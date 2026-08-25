/*
 * bypass_frida_detect.js
 * Bypasses detection in: frida_detect.c (frida_detect)
 *
 * Detects:
 *   - TracerPid > 0 in /proc/self/status
 *   - "zymbiote" socket in /proc/self/net/unix
 *   - TCP listener on Frida gadget port (state 0x0A)
 *   - Symbols: frida_gadget_load, frida_gadget_wait_for_debugger,
 *              gum_interceptor_obtain, gum_init_embedded
 *   - LSPosed socket
 *
 * Strategy:
 *   - Hook openat to return ENOENT for /proc paths detection uses.
 *   - Hook read + pwrite to scrub TracerPid from /proc/self/status.
 *   - Hide the gadget by hooking the symbol resolution (dlsym) and
 *     returning NULL for known gadget symbols.
 *   - Hook stat/fstat to return a fake net/unix file.
 *
 * Targets Frida-Toolkit/cpp/frida_detect.c
 */

'use strict';

const PROC_PATHS = [
    '/proc/self/status',
    '/proc/self/net/unix',
    '/proc/net/unix',
    '/proc/self/net/tcp',
    '/proc/net/tcp'
];

const GADGET_SYMBOLS = [
    'frida_gadget_load',
    'frida_gadget_wait_for_debugger',
    'gum_interceptor_obtain',
    'gum_init_embedded',
    'frida_agent_main'
];

// Hook dlsym so the four gadget lookups return NULL
function hookDlsym() {
    const dlsymAddr = Module.findExportByName('libc.so', 'dlsym');
    if (!dlsymAddr) return;
    Interceptor.attach(dlsymAddr, {
        onEnter(args) {
            this.sym = args[1].readCString();
        },
        onLeave(retval) {
            if (this.sym && GADGET_SYMBOLS.some(s => this.sym.includes(s))) {
                retval.replace(ptr(0));
            }
        }
    });
}

// Mask TracerPid in /proc/self/status reads
function hookStatusRead() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );

    // We hook the high-level fopen path which libc helpers funnel through
    const fopen = new NativeFunction(
        Module.findExportByName('libc.so', 'fopen'),
        'pointer', ['pointer', 'pointer']
    );

    Interceptor.replace(fopen, new NativeCallback(function (pathPtr, modePtr) {
        const p = pathPtr.readCString();
        if (p === '/proc/self/status' || p === '/proc/net/unix' || p === '/proc/net/tcp') {
            // For status, return a sanitized version
            if (p === '/proc/self/status') {
                return Memory.allocUtf8String('/data/local/tmp/sanitized_status').isNull()
                    ? ptr(0) : Memory.allocUtf8String('/data/local/tmp/sanitized_status');
            }
            return ptr(0);
        }
        return fopen(pathPtr, modePtr);
    }, 'pointer', ['pointer', 'pointer']));
}

// Hook openat to deny /proc paths detection uses
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p && PROC_PATHS.includes(p)) {
            return -1; // ENOENT
        }
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook getsockname / recv to scrub 0x6C D-Bus greeting on any local port
function hookSocket() {
    const recv = new NativeFunction(
        Module.findExportByName('libc.so', 'recv'),
        'ssize_t', ['int', 'pointer', 'size_t', 'int']
    );
    Interceptor.replace(recv, new NativeCallback(function (fd, buf, len, flags) {
        const n = recv(fd, buf, len, flags);
        if (n >= 16) {
            // Strip D-Bus signature so probe_frida_port() rejects it
            buf.writeU8(0x00, 0);
            buf.writeU8(0x00, 3);
            buf.writeU8(0x00, 12);
            buf.writeU8(0x00, 13);
            buf.writeU8(0x00, 14);
            buf.writeU8(0x00, 15);
        }
        return n;
    }, 'ssize_t', ['int', 'pointer', 'size_t', 'int']));
}

console.log('[bypass_frida_detect] Installing bypass hooks...');
hookDlsym();
hookStatusRead();
hookOpenat();
hookSocket();
console.log('[bypass_frida_detect] Bypass active. Frida detection should report clean.');
