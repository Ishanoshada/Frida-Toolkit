#include "plt_check.h"
#include "str_enc.h"
#include <dlfcn.h>
#include <string.h>
#include <stdlib.h>

static bool sym_hooked(const unsigned char *enc, size_t len, const char *expected_lib) {
    char *sym = sd(enc, len);
    if (!sym) return false;
    void *addr = dlsym(RTLD_DEFAULT, sym); free(sym);
    if (!addr) return false;
    Dl_info info;
    if (!dladdr(addr, &info) || !info.dli_fname) return true;
    return strstr(info.dli_fname, expected_lib) == NULL;
}

bool is_ssl_write_hooked(void) { return sym_hooked(_SSLW, sizeof(_SSLW), "libssl"); }
bool is_ssl_read_hooked(void)  { return sym_hooked(_SSLR, sizeof(_SSLR), "libssl"); }

bool is_libc_open_hooked(void) {
    void *addr = dlsym(RTLD_DEFAULT, "open");
    if (!addr) return false;
    Dl_info info;
    if (!dladdr(addr, &info) || !info.dli_fname) return true;
    return strstr(info.dli_fname, "libc") == NULL;
}
