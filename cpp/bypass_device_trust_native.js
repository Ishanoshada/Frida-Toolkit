/*
 * bypass_device_trust_native.js
 * Bypasses detection in: device_trust_native.cpp (collectNativeSignals)
 *
 * Detects (via JNI):
 *   - RWX segments in /proc/self/maps
 *   - Frida/GumJS/Gadget modules in /proc/self/maps
 *   - Suspicious module basenames
 *   - frida/gadget/gum-js in /proc/self/fd symlinks
 *   - libc getpid() resolving to a non-system path
 *
 * Strategy:
 *   - Hook openat to deny /proc/self/maps and /proc/self/fd
 *   - Hook fgets/read to scrub suspicious needles
 *   - Hook dladdr to spoof lib path for getpid
 *
 * Targets Frida-Toolkit/cpp/device_trust_native.cpp
 */

'use strict';

const MAPS_PATH = '/proc/self/maps';
const FD_PATH = '/proc/self/fd';
const SUSPICIOUS_NEEDLES = [
    'frida', 'gum-js', 'gum_js', 'gadget',
    'substrate', 'xposed', 'lsposed', 'edxposed'
];

// Hook openat
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p === MAPS_PATH || p === FD_PATH) return -1; // ENOENT
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook fgets to scrub lines with suspicious needles
function hookFgets() {
    const fgets = new NativeFunction(
        Module.findExportByName('libc.so', 'fgets'),
        'pointer', ['pointer', 'int', 'pointer']
    );
    Interceptor.attach(fgets, {
        onEnter(args) { this.buf = args[0]; },
        onLeave(retval) {
            if (retval.isNull()) return;
            const s = retval.readCString();
            if (!s) return;
            for (const needle of SUSPICIOUS_NEEDLES) {
                if (s.toLowerCase().includes(needle)) {
                    retval.writeUtf8String('\n');
                    return;
                }
            }
            if (s.includes('rwxp') && (s.includes('/memfd') || !s.includes('/'))) {
                retval.writeUtf8String('\n');
            }
        }
    });
}

// Hook readlinkat for /proc/self/fd/<n>
function hookReadlinkat() {
    const readlinkat = Module.findExportByName('libc.so', 'readlinkat');
    if (!readlinkat) return;
    Interceptor.attach(readlinkat, {
        onEnter(args) {
            this.path = args[1].readCString();
            this.buf = args[2];
        },
        onLeave(retval) {
            if (!this.path || !this.path.startsWith(FD_PATH + '/')) return;
            const link = this.buf.readCString();
            if (!link) return;
            for (const needle of SUSPICIOUS_NEEDLES) {
                if (link.toLowerCase().includes(needle)) {
                    this.buf.writeUtf8String('/dev/null');
                    retval.replace(9);
                    return;
                }
            }
        }
    });
}

// Hook dladdr for getpid symbol
function hookDladdr() {
    const dladdrAddr = Module.findExportByName('libc.so', 'dladdr');
    if (!dladdrAddr) return;
    Interceptor.replace(dladdrAddr, new NativeCallback(function (addr, info) {
        const ok = dladdr(addr, info);
        if (ok === 0) return 0;
        const fname = info.readPointer();
        if (fname.isNull()) return ok;
        const f = fname.readCString();
        if (!f) return ok;
        // Check if it's a /data/ path or not a system path
        if (f.includes('/data/') || f.includes('/memfd:')) {
            info.writePointer(Memory.allocUtf8String('/system/lib64/libc.so'));
        }
        return ok;
    }, 'int', ['pointer', 'pointer']));
}

console.log('[bypass_device_trust_native] Installing bypass hooks...');
hookOpenat();
hookFgets();
hookReadlinkat();
hookDladdr();
console.log('[bypass_device_trust_native] Bypass active. JSON signal report should be clean.');
