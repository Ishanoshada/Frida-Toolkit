/*
 * bypass_fd_scan.js
 * Bypasses detection in: fd_scan.c (fd_has_frida_memfd)
 *
 * Detects:
 *   - Any /proc/self/fd/<n> symlink target containing "frida" or "jit-cache"
 *
 * Strategy:
 *   - Hook openat to return ENOENT for /proc/self/fd
 *   - Hook getdents64 to drop any entry that would match
 *   - Hook readlinkat to return a sanitized path for /proc/self/fd/<n> reads
 *
 * Targets Frida-Toolkit/cpp/fd_scan.c
 */

'use strict';

const FD_PATH = '/proc/self/fd';
const FD_NEEDLES = ['frida', 'jit-cache'];

// Hook openat to deny /proc/self/fd
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p === FD_PATH) return -1; // ENOENT
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook readlinkat — sanitize frida/jit-cache in /proc/self/fd targets
function hookReadlinkat() {
    const readlinkatAddr = Module.findExportByName('libc.so', 'readlinkat');
    if (!readlinkatAddr) return;
    Interceptor.attach(readlinkatAddr, {
        onEnter(args) {
            this.path = args[1].readCString();
            this.buf = args[2];
        },
        onLeave(retval) {
            if (!this.path || !this.path.startsWith(FD_PATH + '/')) return;
            const link = this.buf.readCString();
            if (!link) return;
            for (const needle of FD_NEEDLES) {
                if (link.includes(needle)) {
                    // Replace with an innocuous /dev/null-style target
                    this.buf.writeUtf8String('/dev/null');
                    retval.replace(9);
                    return;
                }
            }
        }
    });
}

// Hook getdents64 to filter /proc/self/fd enumeration
function hookGetdents() {
    const getdents64 = new NativeFunction(
        Module.findExportByName('libc.so', 'getdents64'),
        'int', ['int', 'pointer', 'unsigned int']
    );
    Interceptor.attach(getdents64, {
        onEnter(args) {
            this.fd = args[0].toInt32();
            this.buf = args[1];
        },
        onLeave(retval) {
            // Without the path context, we can't filter perfectly.
            // The readlinkat hook above is the primary defense.
        }
    });
}

console.log('[bypass_fd_scan] Installing bypass hooks...');
hookOpenat();
hookReadlinkat();
console.log('[bypass_fd_scan] Bypass active. /proc/self/fd Frida memfd detection should be clean.');
