#include "root_check.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <string.h>
#include <stdlib.h>
#include <errno.h>
#include <sys/system_properties.h>

static bool prop_equals(const char *key, const char *val) {
    char buf[PROP_VALUE_MAX] = {0};
    __system_property_get(key, buf);
    return strcmp(buf, val) == 0;
}

/*
 * Try to open a path via direct syscall (bypasses Shamiko's libc hooks).
 * IMPORTANT: only returns 1 when fd >= 0 (file actually opened).
 * We do NOT treat EACCES as "exists" — SELinux returns EACCES for denied
 * path lookups on ALL Android devices regardless of whether the file exists,
 * which would create false positives on clean devices.
 */
static int path_exists_syscall(const char *path) {
    int fd = sc_open(path, O_RDONLY);
    if (fd >= 0) { sc_close(fd); return 1; }
    return 0;
}

static bool check_su_binary(void) {
    /* Only check world-readable system paths — avoids SELinux EACCES false
     * positives on /data/* paths where SELinux denies lookup unconditionally */
    const char *paths[] = {
        "/system/bin/su", "/system/xbin/su",
        "/system/sd/xbin/su", "/system/bin/failsafe/su", NULL
    };
    for (int i = 0; paths[i]; i++)
        if (path_exists_syscall(paths[i])) return true;
    return false;
}

static bool check_magisk_data(void) {
    /*
     * /data/adb/magisk exists ONLY on Magisk-rooted devices.
     * On stock Android this path returns ENOENT.
     * Shamiko's libc-hook cannot intercept our raw syscall(__NR_openat).
     * EACCES = the directory exists (owned root:root 700) → rooted.
     */
    char *p1 = sd(_DADBMGK,  sizeof(_DADBMGK));
    char *p2 = sd(_DADBMOD,  sizeof(_DADBMOD));
    char *p3 = sd(_DADBLSPD, sizeof(_DADBLSPD));
    bool found = false;
    if (p1 && path_exists_syscall(p1)) found = true;
    if (!found && p2 && path_exists_syscall(p2)) found = true;
    if (!found && p3 && path_exists_syscall(p3)) found = true;
    free(p1); free(p2); free(p3);
    return found;
}

static bool check_mountinfo_magisk(void) {
    /*
     * Read /proc/self/mountinfo and look for Magisk-specific mount points.
     * Shamiko replaces the fs_source "magisk" in the hidden mount namespace,
     * so we match on the mount point path instead: /debug_ramdisk as tmpfs
     * is a Magisk-specific construct that only appears on rooted devices.
     */
    char *buf = malloc(512 * 1024);
    if (!buf) return false;

    char *path = sd(_MNTI, sizeof(_MNTI));
    if (!path) { free(buf); return false; }
    ssize_t n = sc_read_file(path, buf, 512 * 1024);
    free(path);
    if (n <= 0) { free(buf); return false; }

    /* Primary: source name still visible (Shamiko not active for this app) */
    char *mgk = sd(_MGK, sizeof(_MGK));
    bool found = (mgk && strstr(buf, mgk));
    free(mgk);

    /* Fallback: path-based — /debug_ramdisk in mountinfo = Magisk Android 11+ */
    if (!found) {
        char *drd = sd(_DBGRD, sizeof(_DBGRD));
        found = (drd && strstr(buf, drd));
        free(drd);
    }

    free(buf);
    return found;
}

static bool check_busybox(void) {
    char *bb = sd(_BUSYB, sizeof(_BUSYB));
    if (!bb) return false;
    const char *dirs[] = {"/system/bin/", "/system/xbin/", "/sbin/", NULL};
    bool found = false;
    for (int i = 0; dirs[i] && !found; i++) {
        char path[128];
        snprintf(path, sizeof(path), "%s%s", dirs[i], bb);
        if (path_exists_syscall(path)) found = true;
    }
    free(bb);
    return found;
}

static bool check_selinux_permissive(void) {
    char buf[8] = {0};
    char *p = sd(_SLE, sizeof(_SLE));
    if (!p) return false;
    sc_read_file(p, buf, sizeof(buf));
    free(p);
    return buf[0] == '0';
}

static bool check_magisk_unix_socket(void) {
    /*
     * Magisk daemon registers an abstract Unix socket "@magisk_daemon".
     * /proc/self/net/unix lists all Unix sockets visible in our net namespace.
     * Reading via direct syscall bypasses Shamiko's libc read() hooks.
     */
    char *buf = malloc(512 * 1024);
    if (!buf) return false;
    char *p = sd(_UNX, sizeof(_UNX));
    if (!p) { free(buf); return false; }
    ssize_t n = sc_read_file(p, buf, 512 * 1024);
    free(p);
    if (n <= 0) { free(buf); return false; }
    char *mgk = sd(_MGK, sizeof(_MGK));
    bool found = (mgk && strstr(buf, mgk));
    free(mgk); free(buf);
    return found;
}

static bool check_init_mountinfo(void) {
    /*
     * /proc/1/mountinfo is PID 1 (init)'s mount namespace — Shamiko does NOT
     * patch this for our process. If "magisk" appears here but not in
     * /proc/self/mountinfo, Shamiko is actively hiding mounts from us.
     * Either way, presence of "magisk" in /proc/1/mountinfo = rooted.
     */
    char *buf = malloc(512 * 1024);
    if (!buf) return false;
    char *p = sd(_MNTI1, sizeof(_MNTI1));
    if (!p) { free(buf); return false; }
    ssize_t n = sc_read_file(p, buf, 512 * 1024);
    free(p);
    if (n <= 0) { free(buf); return false; }
    char *mgk = sd(_MGK, sizeof(_MGK));
    bool found = (mgk && strstr(buf, mgk));
    free(mgk); free(buf);
    return found;
}

static bool check_apatch(void) {
    /* APatch stores its files at /data/adb/apatch */
    char *ap = sd(_APATCH, sizeof(_APATCH));
    if (!ap) return false;
    char path[64];
    char *base = sd(_DADB, sizeof(_DADB));
    bool found = false;
    if (base) {
        snprintf(path, sizeof(path), "%s/%s", base, ap);
        found = path_exists_syscall(path);
    }
    free(ap); free(base);
    return found;
}

RootCheckResult root_check_native(void) {
    RootCheckResult r; memset(&r, 0, sizeof(r));

    r.su_binary                 = check_su_binary();
    r.magisk_data               = check_magisk_data();
    r.magisk_in_mountinfo       = check_mountinfo_magisk();
    r.busybox                   = check_busybox();
    r.selinux_permissive        = check_selinux_permissive();
    r.apatch                    = check_apatch();
    r.magisk_unix_socket        = check_magisk_unix_socket();
    r.magisk_in_init_mountinfo  = check_init_mountinfo();

    /* System properties */
    {
        char *k1 = sd(_RDBG, sizeof(_RDBG));
        if (k1) { r.debuggable_prop = prop_equals(k1, "1"); free(k1); }
    }
    {
        char *k2 = sd(_RSEC, sizeof(_RSEC));
        if (k2) { r.insecure_prop = prop_equals(k2, "0"); free(k2); }
    }
    {
        char *k3 = sd(_RBLT, sizeof(_RBLT));
        char *ve = sd(_ENG,  sizeof(_ENG));
        char *vu = sd(_USRD, sizeof(_USRD));
        if (k3 && ve && vu) {
            char buf[PROP_VALUE_MAX] = {0};
            __system_property_get(k3, buf);
            r.eng_build = (strcmp(buf, ve) == 0 || strcmp(buf, vu) == 0);
        }
        free(k3); free(ve); free(vu);
    }

    return r;
}
