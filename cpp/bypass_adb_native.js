/*
 * bypass_adb_native.js
 * Bypasses detection in: adb_native.c (adb_check_native)
 *
 * Detects:
 *   - init.svc.adbd property = "running" or "restarting"
 *   - /data/misc/adb/adb_keys file present
 *   - TCP 5037 listener in /proc/net/tcp6
 *
 * Strategy:
 *   - Hook __system_property_get to return "stopped" for init.svc.adbd
 *   - Hook openat to return ENOENT for /data/misc/adb/adb_keys
 *   - Hook openat to deny /proc/net/tcp6, or scrub port 5037 (0x13BD) lines
 *
 * Targets Frida-Toolkit/cpp/adb_native.c
 */

'use strict';

const ADB_KEYS = '/data/misc/adb/adb_keys';
const TCP6_PATH = '/proc/net/tcp6';
const ADB_PORT = 5037; // 0x13BD

// Hook __system_property_get
function hookSystemProperty() {
    const addr = Module.findExportByName('libc.so', '__system_property_get');
    if (!addr) return;
    Interceptor.attach(addr, {
        onEnter(args) {
            this.name = args[0].readCString();
            this.buf = args[1];
        },
        onLeave(retval) {
            if (this.name === 'init.svc.adbd') {
                this.buf.writeUtf8String('stopped');
                retval.replace(7);
            }
        }
    });
}

// Hook openat to deny ADB-relevant paths
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p === ADB_KEYS || p === TCP6_PATH) {
            return -1; // ENOENT
        }
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook read for /proc/net/tcp6 — strip :13BD lines
function hookRead() {
    const read = new NativeFunction(
        Module.findExportByName('libc.so', 'read'),
        'ssize_t', ['int', 'pointer', 'size_t']
    );
    Interceptor.replace(read, new NativeCallback(function (fd, buf, size) {
        const n = read(fd, buf, size);
        if (n > 0) {
            const content = buf.readCString();
            if (content) {
                // :13BD is the big-endian hex for port 5037
                const sanitized = content.split('\n').filter(l => !l.includes(':13BD ')).join('\n');
                if (sanitized !== content) {
                    buf.writeUtf8String(sanitized);
                    return sanitized.length;
                }
            }
        }
        return n;
    }, 'ssize_t', ['int', 'pointer', 'size_t']));
}

console.log('[bypass_adb_native] Installing bypass hooks...');
hookSystemProperty();
hookOpenat();
hookRead();
console.log('[bypass_adb_native] Bypass active. ADB detection should report clean.');
