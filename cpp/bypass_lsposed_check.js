/*
 * bypass_lsposed_check.js
 * Bypasses detection in: lsposed_check.c (lsposed_check)
 *
 * Detects:
 *   - lspd daemon process in /proc (cmdline contains "lspd")
 *   - /data/adb/lspd/ directory accessible
 *   - Modules under /data/adb/modules/: lsposed, shamiko, hidemyapplist, zygisknext
 *
 * Strategy:
 *   - Hook openat/getdents64 to mask /proc/<pid>/cmdline entries
 *   - Return ENOENT for /data/adb/lspd/ and module dirs
 *   - Filter "lspd" substrings in /proc enumeration results
 *
 * Targets Frida-Toolkit/cpp/lsposed_check.c
 */

'use strict';

const LSPOSED_PATHS = [
    '/data/adb/lspd',
    '/data/adb/modules/lsposed',
    '/data/adb/modules/shamiko',
    '/data/adb/modules/hidemyapplist',
    '/data/adb/modules/zygisknext',
    '/proc'
];

// Hook openat — deny lsposed paths
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p && LSPOSED_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
            return -1; // ENOENT
        }
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook getdents64 — strip lspd process entries
function hookGetdents() {
    const getdents64 = new NativeFunction(
        Module.findExportByName('libc.so', 'getdents64'),
        'int', ['int', 'pointer', 'unsigned int']
    );

    Interceptor.replace(getdents64, new NativeCallback(function (fd, dirp, count) {
        const n = getdents64(fd, dirp, count);
        if (n <= 0) return n;

        // Walk entries, drop ones whose name or cmdline is "lspd"
        let off = 0;
        const filtered = Memory.alloc(count);
        filtered.writeByteArray(dirp.readByteArray(0), 0); // placeholder
        let out = 0;
        while (off < n) {
            const d_ino = dirp.add(off).readU64();
            const d_off = dirp.add(off + 8).readU64();
            const d_reclen = dirp.add(off + 16).readU16();
            const d_type = dirp.add(off + 18).readU8();
            const name = dirp.add(off + 19).readCString();
            if (name && name === 'lspd') {
                off += d_reclen;
                continue; // skip
            }
            // Copy entry forward
            filtered.add(out).writeU64(d_ino);
            filtered.add(out + 8).writeU64(d_off);
            filtered.add(out + 16).writeU16(d_reclen);
            filtered.add(out + 18).writeU8(d_type);
            filtered.add(out + 19).writeUtf8String(name);
            out += d_reclen;
            off += d_reclen;
            if (d_reclen === 0) break;
        }
        dirp.writeByteArray(filtered.readByteArray(0), out);
        return out;
    }, 'int', ['int', 'pointer', 'unsigned int']));
}

console.log('[bypass_lsposed_check] Installing bypass hooks...');
hookOpenat();
hookGetdents();
console.log('[bypass_lsposed_check] Bypass active. LSPosed module/proc detection should return clean.');
