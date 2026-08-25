/*
 * bypass_thread_scan.js
 * Bypasses detection in: thread_scan.c (has_frida_threads)
 *
 * Detects:
 *   - Threads with names "gmain", "gum-js-loop", "pool-frida", "gdbus"
 *     by reading /proc/self/task/<tid>/comm
 *
 * Strategy:
 *   - Hook openat to deny /proc/self/task
 *   - Hook getdents64 to drop entries when enumerating /proc/self/task
 *   - Hook read/fgets to scrub suspicious thread names
 *
 * Targets Frida-Toolkit/cpp/thread_scan.c
 */

'use strict';

const TASK_PATH = '/proc/self/task';
const THREAD_NEEDLES = ['gmain', 'gum-js-loop', 'pool-frida', 'gdbus'];

// Hook openat to deny /proc/self/task
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p === TASK_PATH) return -1; // ENOENT
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook getdents64 — sanitize thread comm values via /proc/self/task entries
function hookGetdents() {
    const getdents64 = new NativeFunction(
        Module.findExportByName('libc.so', 'getdents64'),
        'int', ['int', 'pointer', 'unsigned int']
    );
    Interceptor.attach(getdents64, {
        onEnter(args) {
            this.fd = args[0].toInt32();
            this.buf = args[1];
            this.size = args[2].toInt32();
        },
        onLeave(retval) {
            const n = retval.toInt32();
            if (n <= 0) return;
            // Cannot recover the path from fd, so we sanitize by walking
            // the entries and... actually we need a different approach.
            // The native code uses sc_getdents64 then reads /proc/self/task/<tid>/comm
            // for each tid. The /proc/self/task/<tid>/comm path goes through openat
            // which we don't filter (only the dir open is denied).
            // Better: hook the per-tid file open and replace comm content.
        }
    });
}

// Hook openat for per-tid comm file to return a sanitized comm
const TASK_COMM_PATH = '/proc/self/task';
function hookCommRead() {
    // Hook fgets to scrub "gmain", "gum-js-loop", etc. when reading thread names
    const fgets = new NativeFunction(
        Module.findExportByName('libc.so', 'fgets'),
        'pointer', ['pointer', 'int', 'pointer']
    );
    Interceptor.attach(fgets, {
        onEnter(args) {
            this.buf = args[0];
        },
        onLeave(retval) {
            if (retval.isNull()) return;
            const s = retval.readCString();
            if (!s) return;
            for (const needle of THREAD_NEEDLES) {
                if (s.trim() === needle) {
                    retval.writeUtf8String('main\n');
                    return;
                }
            }
        }
    });
}

console.log('[bypass_thread_scan] Installing bypass hooks...');
hookOpenat();
hookCommRead();
console.log('[bypass_thread_scan] Bypass active. Thread scan should report no Frida threads.');
