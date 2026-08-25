/*
 * bypass_mount_check.js
 * Bypasses detection in: mount_check.c (mount_check)
 *
 * Detects (by reading /proc/self/mounts):
 *   - "conscrypt" + "tmpfs" = cert-fixer tmpfs over APEX cert dir
 *   - "magisk" + "tmpfs" or /debug_ramdisk + tmpfs or /sbin + tmpfs
 *   - "/system" with " rw," (system mounted read-write)
 *
 * Strategy:
 *   - Hook openat to deny /proc/self/mounts
 *   - Hook fgets to scrub lines with magisk/debug_ramdisk/sbin tmpfs
 *   - Strip " rw," entries for /system
 *
 * Targets Frida-Toolkit/cpp/mount_check.c
 */

'use strict';

const PROC_MOUNTS = '/proc/self/mounts';
const NEEDLES = [
    'conscrypt', 'magisk', '/debug_ramdisk', '/sbin'
];

// Hook fopen / openat for /proc/self/mounts
function hookOpen() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (p === PROC_MOUNTS) return -1; // ENOENT
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));
}

// Hook fgets to scrub /system rw and Magisk lines
function hookFgets() {
    const fgetsAddr = Module.findExportByName('libc.so', 'fgets');
    if (!fgetsAddr) return;
    Interceptor.attach(fgetsAddr, {
        onLeave(retval) {
            if (retval.isNull()) return;
            const s = retval.readCString();
            if (!s) return;
            // Strip lines that match Magisk or /system rw
            for (const needle of NEEDLES) {
                if (s.includes(needle) && s.includes('tmpfs')) {
                    retval.writeUtf8String('\n');
                    return;
                }
            }
            if (s.includes('/system') && s.includes(' rw,')) {
                retval.writeUtf8String('\n');
            }
        }
    });
}

// Hook read for raw reads
function hookRead() {
    const read = new NativeFunction(
        Module.findExportByName('libc.so', 'read'),
        'ssize_t', ['int', 'pointer', 'size_t']
    );
    Interceptor.replace(read, new NativeCallback(function (fd, buf, size) {
        const n = read(fd, buf, size);
        if (n > 0) {
            const content = buf.readCString();
            if (content && (content.includes('magisk') || content.includes('debug_ramdisk'))) {
                const sanitized = content.split('\n').filter(l => {
                    if (NEEDLES.some(n => l.includes(n)) && l.includes('tmpfs')) return false;
                    if (l.includes('/system') && l.includes(' rw,')) return false;
                    return true;
                }).join('\n');
                buf.writeUtf8String(sanitized);
                return sanitized.length;
            }
        }
        return n;
    }, 'ssize_t', ['int', 'pointer', 'size_t']));
}

console.log('[bypass_mount_check] Installing bypass hooks...');
hookOpen();
hookFgets();
hookRead();
console.log('[bypass_mount_check] Bypass active. Mount check should return clean.');
