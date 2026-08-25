#include "mount_check.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <string.h>
#include <stdlib.h>

MountCheckResult mount_check(void) {
    MountCheckResult r; memset(&r, 0, sizeof(r));
    char *buf = malloc(256 * 1024); if (!buf) return r;

    char *path = sd(_MNT, sizeof(_MNT));
    if (!path) { free(buf); return r; }
    sc_read_file(path, buf, 256 * 1024); free(path);

    char *s_cc   = sd(_CC,    sizeof(_CC));
    char *s_tmp  = sd(_TMP,   sizeof(_TMP));
    char *s_mgk  = sd(_MGK,   sizeof(_MGK));
    char *s_drd  = sd(_DBGRD, sizeof(_DBGRD));
    char *s_sbin = sd(_SBIN,  sizeof(_SBIN));

    char *line = buf, *end = buf + strlen(buf);
    while (line < end) {
        char *nl  = memchr(line, '\n', (size_t)(end - line));
        size_t ln = nl ? (size_t)(nl - line) : (size_t)(end - line);
        char sv = line[ln]; line[ln] = '\0';

        /* cert-fixer: tmpfs over APEX cert dir */
        if (s_cc && s_tmp && strstr(line, s_cc) && strstr(line, s_tmp))
            r.conscrypt_tmpfs = true;

        /* Magisk: source-name "magisk" with tmpfs (visible when Shamiko is off) */
        if (s_mgk && s_tmp && strstr(line, s_mgk) && strstr(line, s_tmp))
            r.magisk_mount = true;
        /* Magisk: path-based — /debug_ramdisk mounted as tmpfs (Android 11+).
         * Shamiko replaces "magisk" source name but cannot change the mount point.
         * Clean devices don't have /debug_ramdisk as a tmpfs mount. */
        if (!r.magisk_mount && s_drd && s_tmp && strstr(line, s_drd) && strstr(line, s_tmp))
            r.magisk_mount = true;
        /* Older Magisk: /sbin mounted as tmpfs */
        if (!r.magisk_mount && s_sbin && s_tmp && strstr(line, s_sbin) && strstr(line, s_tmp))
            r.magisk_mount = true;

        /* /system mounted rw */
        if (strstr(line, "/system") && strstr(line, " rw,"))
            r.system_rw = true;

        line[ln] = sv;
        line = nl ? nl + 1 : end;
    }
    free(s_cc); free(s_tmp); free(s_mgk); free(s_drd); free(s_sbin); free(buf);
    return r;
}
