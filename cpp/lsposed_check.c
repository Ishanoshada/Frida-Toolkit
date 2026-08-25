#include "lsposed_check.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <stdio.h>

struct ld64 { uint64_t ino; int64_t off; uint16_t reclen; uint8_t type; char name[]; };

static bool is_digits(const char *s) {
    if (!*s) return false;
    for (; *s; s++) if (*s < '0' || *s > '9') return false;
    return true;
}

static bool scan_proc_for_lspd(void) {
    /* Open /proc/ directory */
    int dfd = sc_open("/proc", O_RDONLY | O_DIRECTORY);
    if (dfd < 0) return false;

    char *lspd = sd(_LSPD, sizeof(_LSPD));  /* "lspd" */
    if (!lspd) { sc_close(dfd); return false; }

    bool found = false;
    char dents[8192];

    while (!found) {
        int n = sc_getdents64(dfd, dents, sizeof(dents));
        if (n <= 0) break;

        for (int off = 0; off < n && !found; ) {
            struct ld64 *de = (struct ld64 *)(dents + off);
            off += de->reclen;
            if (!is_digits(de->name)) continue;

            char path[64];
            __builtin_snprintf(path, sizeof(path), "/proc/%s/cmdline", de->name);

            char buf[256] = {0};
            ssize_t r = sc_read_file(path, buf, sizeof(buf) - 1);
            if (r <= 0) continue;

            /* cmdline is null-separated argv — search the whole buffer */
            for (ssize_t i = 0; i < r && !found; i++)
                if (buf[i] == '\0') buf[i] = '/';  /* expose full path */
            buf[r] = '\0';

            if (strstr(buf, lspd)) found = true;
        }
    }

    free(lspd);
    sc_close(dfd);
    return found;
}

static bool probe_dir(const char *path) {
    int fd = sc_open(path, O_RDONLY | O_DIRECTORY);
    if (fd >= 0) { sc_close(fd); return true; }
    return false;
}

LsposedCheckResult lsposed_check(void) {
    LsposedCheckResult r; __builtin_memset(&r, 0, sizeof(r));

    /* 1. Process scan */
    r.lspd_process = scan_proc_for_lspd();

    /* 2. /data/adb/lspd/ */
    char *lspd_dir = sd(_DADBLSPD, sizeof(_DADBLSPD));  /* "/data/adb/lspd" */
    if (lspd_dir) { r.lspd_data_dir = probe_dir(lspd_dir); free(lspd_dir); }

    /* 3. Module directories under /data/adb/modules/ */
    char *mod_base = sd(_DADBMOD, sizeof(_DADBMOD));  /* "/data/adb/modules" */
    if (mod_base) {
        char *ls  = sd(_LP,      sizeof(_LP));       /* "lsposed"       */
        char *sh  = sd(_SHAMIKO, sizeof(_SHAMIKO));  /* "shamiko"       */
        char *hma = sd(_HMA,     sizeof(_HMA));      /* "hidemyapplist" */
        char *zgn = sd(_ZGNXT,   sizeof(_ZGNXT));    /* "zygisknext"    */

        char path[128];
        if (ls)  { __builtin_snprintf(path,sizeof(path),"%s/%s",mod_base,ls);  r.module_lsposed = probe_dir(path); }
        if (sh)  { __builtin_snprintf(path,sizeof(path),"%s/%s",mod_base,sh);  r.module_shamiko = probe_dir(path); }
        if (hma) { __builtin_snprintf(path,sizeof(path),"%s/%s",mod_base,hma); r.module_hma     = probe_dir(path); }
        if (zgn) { __builtin_snprintf(path,sizeof(path),"%s/%s",mod_base,zgn); r.module_zgnxt   = probe_dir(path); }

        free(ls); free(sh); free(hma); free(zgn);
        free(mod_base);
    }

    return r;
}
