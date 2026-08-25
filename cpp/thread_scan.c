#include "thread_scan.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <stdint.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>

struct ld64 { uint64_t ino; int64_t off; uint16_t reclen; uint8_t type; char name[]; };

static bool is_digits(const char *s) {
    if (!*s) return false;
    for (; *s; s++) if (*s < '0' || *s > '9') return false;
    return true;
}

bool has_frida_threads(void) {
    char *task = sd(_TSK, sizeof(_TSK));   /* "/proc/self/task" */
    if (!task) return false;

    int dfd = sc_open(task, O_RDONLY | O_DIRECTORY);
    free(task);
    if (dfd < 0) return false;

    char *gm = sd(_GMAIN,   sizeof(_GMAIN));    /* "gmain"        */
    char *gj = sd(_GJSLOOP, sizeof(_GJSLOOP));  /* "gum-js-loop"  */
    char *pf = sd(_PFRIDA,  sizeof(_PFRIDA));   /* "pool-frida"   */
    char *gd = sd(_GDBUS,   sizeof(_GDBUS));    /* "gdbus"        */
    char *cm = sd(_COMM,    sizeof(_COMM));     /* "comm"         */

    bool found = false;
    char dents[4096];

    while (!found) {
        int n = sc_getdents64(dfd, dents, sizeof(dents));
        if (n <= 0) break;

        for (int off = 0; off < n && !found; ) {
            struct ld64 *de = (struct ld64 *)(dents + off);
            off += de->reclen;
            if (!is_digits(de->name)) continue;

            /* /proc/self/task/<tid>/comm */
            char path[128];
            __builtin_snprintf(path, sizeof(path),
                "/proc/self/task/%s/%s", de->name, cm ? cm : "comm");

            char buf[32] = {0};
            ssize_t r = sc_read_file(path, buf, sizeof(buf) - 1);
            if (r <= 0) continue;

            char *nl = (char *)memchr(buf, '\n', (size_t)r);
            if (nl) *nl = '\0'; else buf[r] = '\0';

            if ((gm && __builtin_strcmp(buf, gm) == 0) ||
                (gj && __builtin_strcmp(buf, gj) == 0) ||
                (pf && __builtin_strcmp(buf, pf) == 0) ||
                (gd && __builtin_strcmp(buf, gd) == 0))
                found = true;
        }
    }

    free(gm); free(gj); free(pf); free(gd); free(cm);
    sc_close(dfd);
    return found;
}
