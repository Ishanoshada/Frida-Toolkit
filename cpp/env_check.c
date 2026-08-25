#include "env_check.h"
#include "str_enc.h"
#include "syscall_utils.h"
#include <stdlib.h>
#include <string.h>
#include <sys/ptrace.h>
#include <errno.h>

static bool check_ld_preload(void) {
    char *k1 = sd(_LDP, sizeof(_LDP));
    char *k2 = sd(_LDL, sizeof(_LDL));
    bool found = false;

    if (k1) {
        char *v = getenv(k1);
        if (v && strlen(v) > 0) {
            /* Flag if LD_PRELOAD is set to anything non-standard */
            char *f = sd(_FRDA, sizeof(_FRDA));
            /* Any non-empty LD_PRELOAD in a production app is suspicious */
            found = true;
            (void)f; free(f);
        }
        free(k1);
    }
    if (!found && k2) {
        /* LD_LIBRARY_PATH pointing outside system paths is suspicious */
        char *v = getenv(k2);
        if (v && strstr(v, "/data/local")) found = true;
        free(k2);
    } else {
        free(k2);
    }
    return found;
}

static bool check_tracer_via_ptrace(void) {
    /*
     * ptrace(PTRACE_TRACEME) returns EPERM if another process is already
     * tracing us. On non-traced processes it succeeds (returns 0).
     * We immediately "detach" by checking status — we can't truly detach
     * TRACEME, but the attempt itself doesn't affect normal execution.
     */
    long r = ptrace(PTRACE_TRACEME, 0, NULL, NULL);
    if (r < 0 && errno == EPERM) return true;
    return false;
}

EnvCheckResult env_check(void) {
    EnvCheckResult r; memset(&r, 0, sizeof(r));
    r.ld_preload_injected = check_ld_preload();
    r.tracer_detected     = check_tracer_via_ptrace();
    return r;
}
