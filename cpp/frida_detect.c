#include "frida_detect.h"
#include "syscall_utils.h"
#include "str_enc.h"
#include <dlfcn.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

static int read_tracer_pid(void) {
    char buf[4096] = {0};
    char *p = sd(_STA, sizeof(_STA));
    if (!p) return -1;
    sc_read_file(p, buf, sizeof(buf)); free(p);
    char *t = strstr(buf, "TracerPid:");
    if (!t) return -1;
    t += 10;
    while (*t == ' ' || *t == '\t') t++;
    return atoi(t);
}

static bool check_zymbiote_socket(void) {
    char *buf = malloc(512 * 1024); if (!buf) return false;
    char *p = sd(_UNX, sizeof(_UNX));
    if (!p) { free(buf); return false; }
    sc_read_file(p, buf, 512 * 1024); free(p);
    char *needle = sd(_FZ, sizeof(_FZ));
    bool found = needle && strstr(buf, needle);
    free(needle); free(buf);
    return found;
}

static bool check_gadget_listener(void) {
    char buf[65536] = {0};
    char *p = sd(_TCP, sizeof(_TCP));
    if (!p) return false;
    sc_read_file(p, buf, sizeof(buf)); free(p);
    char *line = buf;
    bool first = true;
    while (line && *line) {
        char *nl = strchr(line, '\n');
        if (first) { first = false; line = nl ? nl + 1 : NULL; continue; }
        unsigned int lport, state;
        if (sscanf(line, " %*d: %*8x:%4x %*8x:%*4x %2x", &lport, &state) == 2) {
            if (state == 0x0A) return true;  /* TCP_LISTEN */
        }
        line = nl ? nl + 1 : NULL;
    }
    return false;
}

static bool check_gadget_symbol(void) {
    char *s1 = sd(_FGL, sizeof(_FGL));
    char *s2 = sd(_FGW, sizeof(_FGW));
    char *s3 = sd(_GIO, sizeof(_GIO));
    char *s4 = sd(_GIF, sizeof(_GIF));
    bool found = false;
    if (s1 && dlsym(RTLD_DEFAULT, s1)) found = true;
    if (!found && s2 && dlsym(RTLD_DEFAULT, s2)) found = true;
    if (!found && s3 && dlsym(RTLD_DEFAULT, s3)) found = true;
    if (!found && s4 && dlsym(RTLD_DEFAULT, s4)) found = true;
    free(s1); free(s2); free(s3); free(s4);
    return found;
}

static bool check_lsposed_socket(void) {
    char *p = sd(_LSPSK, sizeof(_LSPSK));
    if (!p) return false;
    bool exists = sc_file_exists(p);
    free(p);
    if (exists) return true;
    /* Also check /proc/self/net/unix */
    char *buf = malloc(256 * 1024); if (!buf) return false;
    char *pu = sd(_UNX, sizeof(_UNX));
    if (!pu) { free(buf); return false; }
    sc_read_file(pu, buf, 256 * 1024); free(pu);
    char *lsp = sd(_LP, sizeof(_LP));
    bool found = lsp && strstr(buf, lsp);
    free(lsp); free(buf);
    return found;
}

FridaDetectResult frida_detect(void) {
    FridaDetectResult r; memset(&r, 0, sizeof(r));
    r.tracer_pid          = read_tracer_pid();
    r.tracer_pid_nonzero  = (r.tracer_pid > 0);
    r.zymbiote_socket     = check_zymbiote_socket();
    r.gadget_tcp_listener = check_gadget_listener();
    r.gadget_symbol_found = check_gadget_symbol();
    r.lsposed_socket      = check_lsposed_socket();
    return r;
}
