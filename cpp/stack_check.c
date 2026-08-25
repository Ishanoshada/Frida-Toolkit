#include "stack_check.h"
#include "str_enc.h"
#include <unwind.h>
#include <dlfcn.h>
#include <string.h>
#include <stdbool.h>

typedef struct { int depth; bool found; } WalkCtx;

static _Unwind_Reason_Code frame_cb(struct _Unwind_Context *ctx, void *arg) {
    WalkCtx *w = (WalkCtx *)arg;
    if (++w->depth > 64) return _URC_END_OF_STACK;
    uintptr_t pc = _Unwind_GetIP(ctx);
    if (!pc) return _URC_NO_REASON;

    Dl_info info;
    if (dladdr((void *)pc, &info) && info.dli_fname) {
        char *f  = sd(_FRDA,  sizeof(_FRDA));
        char *g  = sd(_GADG,  sizeof(_GADG));
        char *db = sd(_GDBST, sizeof(_GDBST));
        bool hit = (f  && strstr(info.dli_fname, f))  ||
                   (g  && strstr(info.dli_fname, g))  ||
                   (db && strstr(info.dli_fname, db))  ||
                   strstr(info.dli_fname, "/data/local/tmp");
        free(f); free(g); free(db);
        if (hit) { w->found = true; return _URC_END_OF_STACK; }
    } else if (pc) {
        /* Frame not backed by any lib = anonymous injected trampoline */
        w->found = true;
        return _URC_END_OF_STACK;
    }
    return _URC_NO_REASON;
}

bool stack_has_frida_frame(void) {
    WalkCtx w = {0, false};
    _Unwind_Backtrace(frame_cb, &w);
    return w.found;
}
