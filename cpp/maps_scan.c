#include "maps_scan.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#define BUF_SZ (512 * 1024)

MapsScanResult maps_scan(void) {
    MapsScanResult r; memset(&r, 0, sizeof(r));
    char *buf = malloc(BUF_SZ); if (!buf) return r;

    char *path = sd(_MAP, sizeof(_MAP));
    if (!path) { free(buf); return r; }
    ssize_t n = sc_read_file(path, buf, BUF_SZ); free(path);
    if (n <= 0) { free(buf); return r; }

    char *fa64  = sd(_FA64,  sizeof(_FA64));
    char *fa32  = sd(_FA32,  sizeof(_FA32));
    char *fraw  = sd(_FRAW,  sizeof(_FRAW));
    char *fh    = sd(_FH,    sizeof(_FH));
    char *fz    = sd(_FZ,    sizeof(_FZ));
    char *lz    = sd(_LZ,    sizeof(_LZ));
    char *xp    = sd(_XP,    sizeof(_XP));
    char *lp    = sd(_LP,    sizeof(_LP));
    char *dobby = sd(_DOBBY, sizeof(_DOBBY));
    char *shk   = sd(_SHK,   sizeof(_SHK));
    char *whk   = sd(_WHK,   sizeof(_WHK));
    char *frda  = sd(_FRDA,  sizeof(_FRDA));
    char *gadg  = sd(_GADG,  sizeof(_GADG));
    char *rwxp  = sd(_RWXP,  sizeof(_RWXP));
    char *dlt   = sd(_DLT,   sizeof(_DLT));
    char *adata = sd(_ADATA, sizeof(_ADATA));
    char *jitm  = sd(_JITM,  sizeof(_JITM));

    char *line = buf, *end = buf + n;
    while (line < end) {
        char *nl = memchr(line, '\n', (size_t)(end - line));
        size_t len = nl ? (size_t)(nl - line) : (size_t)(end - line);
        char sv = line[len]; line[len] = '\0';

        if (fa64  && strstr(line, fa64))  r.frida_agent    = true;
        if (fa32  && strstr(line, fa32))  r.frida_agent    = true;
        if (fraw  && strstr(line, fraw))  r.frida_raw_agent= true;
        if (fh    && strstr(line, fh))    r.frida_helper   = true;
        if (fz    && strstr(line, fz))    r.frida_zymbiote = true;
        if (lz    && strstr(line, lz))    r.zygisk_active  = true;
        if (xp    && strstr(line, xp))    r.xposed_mapped  = true;
        if (lp    && strstr(line, lp))    r.xposed_mapped  = true;
        if (gadg  && strstr(line, gadg))  r.frida_gadget   = true;
        if (frda  && strstr(line, frda))  r.frida_gadget   = true;

        if (dobby && strstr(line, dobby)) r.hook_framework = true;
        if (shk   && strstr(line, shk))   r.hook_framework = true;
        if (whk   && strstr(line, whk))   r.hook_framework = true;

        /* Helper DEX mapped then deleted */
        if (dlt && adata && strstr(line, dlt) && strstr(line, adata))
            r.deleted_data_map = true;

        /* GumJS JIT heap: /memfd:jit-cache with rwxp AND > 8 MB.
         * ART uses the same name but with r-xp/r--p permissions.
         * Requiring rwxp eliminates ART false positives on Samsung/Android 16. */
        if (jitm && rwxp && strstr(line, jitm) && strstr(line, rwxp)) {
            unsigned long s = 0, e2 = 0;
            if (sscanf(line, "%lx-%lx", &s, &e2) == 2 &&
                (e2 - s) > 8UL * 1024 * 1024)
                r.frida_memfd = true;
        }

        /* Anonymous rwxp region — injected trampoline / shellcode */
        if (rwxp && strstr(line, rwxp)) {
            /* Make sure it has no file backing (no '/' after permissions) */
            char *perm = strstr(line, rwxp);
            if (perm) {
                char *rest = perm + 4;
                while (*rest == ' ' || *rest == '\t') rest++;
                /* fields: offset dev inode [path] */
                /* if there's no path component it's anonymous */
                unsigned long offset; unsigned int dev_maj, dev_min; unsigned long ino;
                int parsed = sscanf(rest, "%lx %x:%x %lu", &offset, &dev_maj, &dev_min, &ino);
                if (parsed == 4 && ino == 0 && dev_maj == 0)
                    r.anon_rwx = true;
            }
        }

        line[len] = sv;
        line = nl ? nl + 1 : end;
    }

    free(fa64); free(fa32); free(fraw); free(fh); free(fz);
    free(lz); free(xp); free(lp); free(dobby); free(shk);
    free(whk); free(frda); free(gadg); free(rwxp); free(dlt);
    free(adata); free(jitm); free(buf);
    return r;
}
