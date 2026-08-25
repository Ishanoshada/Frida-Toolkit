#include "fd_scan.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>

struct sn_dirent64 {
    uint64_t d_ino;
    int64_t  d_off;
    uint16_t d_reclen;
    uint8_t  d_type;
    char     d_name[];
};

bool fd_has_frida_memfd(void) {
    char *dir_path = sd(_FD, sizeof(_FD));
    if (!dir_path) return false;

    int dirfd = sc_open(dir_path, O_RDONLY | O_DIRECTORY);
    free(dir_path);
    if (dirfd < 0) return false;

    char buf[4096];
    char link_path[128];
    char target[512];
    bool found = false;

    char *f = sd(_FRDA, sizeof(_FRDA));
    char *j = sd(_JITM, sizeof(_JITM));

    int n;
    while (!found && (n = sc_getdents64(dirfd, buf, sizeof(buf))) > 0) {
        int off = 0;
        while (off < n && !found) {
            struct sn_dirent64 *d = (struct sn_dirent64 *)(buf + off);
            if (d->d_name[0] != '.') {
                snprintf(link_path, sizeof(link_path), "/proc/self/fd/%s", d->d_name);
                ssize_t len = sc_readlinkat(AT_FDCWD, link_path, target, sizeof(target)-1);
                if (len > 0) {
                    target[len] = '\0';
                    if ((f && strstr(target, f)) || (j && strstr(target, j)))
                        found = true;
                }
            }
            off += d->d_reclen;
            if (d->d_reclen == 0) break;
        }
    }

    free(f); free(j);
    sc_close(dirfd);
    return found;
}
