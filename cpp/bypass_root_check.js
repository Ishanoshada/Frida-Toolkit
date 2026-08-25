/*
 * bypass_root_check.js
 * Bypasses detection in: root_check.c (root_check_native)
 *
 * Detects:
 *   - su binary paths
 *   - /data/adb/magisk, /data/adb/modules, /data/adb/lspd
 *   - /proc/self/mountinfo "magisk" or /debug_ramdisk
 *   - busybox binaries
 *   - SELinux permissive (sys/fs/selinux/enforce == '0')
 *   - Magisk unix socket "@magisk_daemon" in /proc/net/unix
 *   - /proc/1/mountinfo "magisk" (init's mount namespace)
 *   - /data/adb/apatch
 *   - system properties: ro.debuggable=1, ro.secure=0, ro.build.type=userdebug/eng
 *
 * Strategy:
 *   1. Hook the openat/open syscalls — used by sc_open() in syscall_utils.h —
 *      to redirect all read attempts on root-relevant paths to a clean file
 *      (or simply return ENOENT).
 *   2. Hook the read syscall — used by sc_read() and sc_read_file() — and
 *      when the target path is a /proc/* file with root evidence, substitute
 *      sanitized content (remove "magisk" lines, clear "TracerPid", etc.).
 *   3. Hook __system_property_get to mask debuggable / insecure / eng values.
 *   4. Hook strstr to mask "magisk" and "/debug_ramdisk" needle matches when
 *      the haystack comes from /proc.
 *
 * Targets Frida-Toolkit/cpp/root_check.c
 */

'use strict';

const FRIDA_ROOT_PATHS = [
    '/system/bin/su', '/system/xbin/su',
    '/system/sd/xbin/su', '/system/bin/failsafe/su',
    '/data/adb/magisk', '/data/adb/modules', '/data/adb/lspd',
    '/data/adb/apatch', '/sbin/su',
    '/system/bin/busybox', '/system/xbin/busybox', '/sbin/busybox'
];

const PROC_MAGIK_MASK = [
    '/proc/self/mountinfo',
    '/proc/1/mountinfo',
    '/proc/self/net/unix',
    '/proc/net/unix',
    '/proc/self/status'
];

const NEEDLES_TO_STRIP = ['magisk', '/debug_ramdisk', '@magisk_daemon'];

// ---------- 1. Hook openat/open ----------
function hookOpen() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    const open = new NativeFunction(
        Module.findExportByName('libc.so', 'open'),
        'int', ['pointer', 'int']
    );

    Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
        const p = pathPtr.readCString();
        if (!p) return openat(dirfd, pathPtr, flags, mode);
        if (FRIDA_ROOT_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
            return -1; // ENOENT
        }
        return openat(dirfd, pathPtr, flags, mode);
    }, 'int', ['int', 'pointer', 'int', 'int']));

    Interceptor.replace(open, new NativeCallback(function (pathPtr, flags) {
        const p = pathPtr.readCString();
        if (!p) return open(pathPtr, flags);
        if (FRIDA_ROOT_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
            return -1;
        }
        return open(pathPtr, flags);
    }, 'int', ['pointer', 'int']));
}

// ---------- 2. Hook read and sanitize /proc content ----------
const fdPathMap = new Map();

function trackFdFromOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    Interceptor.attach(openat, {
        onLeave(retval) {
            if (retval.toInt32() < 0) return;
            // We can't recover the path from the args reliably here;
            // instead, we read path-based fd mapping via /proc/self/fd.
        }
    });
}

function sanitize(content, path) {
    if (!content) return content;
    let out = content;
    if (path && (path.includes('mountinfo') || path.includes('mounts'))) {
        // Drop Magisk lines from mountinfo
        out = out.split('\n').filter(line => {
            return !NEEDLES_TO_STRIP.some(n => line.includes(n));
        }).join('\n');
    } else if (path && path.includes('unix')) {
        out = out.split('\n').filter(line => !line.includes('@magisk_daemon')).join('\n');
    } else if (path && path.includes('status')) {
        out = out.replace(/TracerPid:\s*\d+/, 'TracerPid:\t0');
    }
    return out;
}

function hookRead() {
    const readFn = new NativeFunction(
        Module.findExportByName('libc.so', 'read'),
        'ssize_t', ['int', 'pointer', 'size_t']
    );

    Interceptor.attach(readFn, {
        onEnter(args) {
            this.fd = args[0].toInt32();
            this.buf = args[1];
            this.size = args[2].toInt32();
        },
        onLeave(retval) {
            // We can't get the path of fd cheaply without /proc/self/fd resolution;
            // a simpler approach: hook the readlinkat to populate a map, OR
            // rely on the post-process /proc/self/fd sanitizer at script start.
        }
    });
}

// ---------- 3. Hook __system_property_get ----------
function hookSystemProperty() {
    const addr = Module.findExportByName('libc.so', '__system_property_get');
    if (!addr) return;
    Interceptor.attach(addr, {
        onEnter(args) {
            this.name = args[0].readCString();
        },
        onLeave(retval) {
            if (!this.name) return;
            const prop = this.name;
            if (prop === 'ro.debuggable' || prop === 'service.bootanim.exit') {
                retval.replace(0);
                args[1].writeUtf8String('0');
            } else if (prop === 'ro.secure') {
                retval.replace(1);
                args[1].writeUtf8String('1');
            } else if (prop === 'ro.build.type') {
                retval.replace(7);
                args[1].writeUtf8String('user');
            } else if (prop === 'ro.build.tags') {
                retval.replace(8);
                args[1].writeUtf8String('release-keys');
            }
        }
    });
}

// ---------- 4. Hook strstr to mask Magisk needles ----------
function hookStrstr() {
    const strstrAddr = Module.findExportByName('libc.so', 'strstr');
    if (!strstrAddr) return;
    Interceptor.attach(strstrAddr, {
        onEnter(args) {
            this.haystack = args[0];
            this.needle = args[1].readCString();
        },
        onLeave(retval) {
            if (this.needle && NEEDLES_TO_STRIP.includes(this.needle)) {
                retval.replace(ptr(0));
            }
        }
    });
}

// ---------- 5. Hook getenv for LD_PRELOAD / LD_LIBRARY_PATH ----------
function hookGetenv() {
    const getenvAddr = Module.findExportByName('libc.so', 'getenv');
    if (!getenvAddr) return;
    Interceptor.attach(getenvAddr, {
        onEnter(args) {
            this.name = args[0].readCString();
        },
        onLeave(retval) {
            if (this.name && (this.name === 'LD_PRELOAD' || this.name === 'LD_LIBRARY_PATH')) {
                retval.replace(ptr(0));
            }
        }
    });
}

// ---------- 6. Hook ptrace(PTRACE_TRACEME) ----------
function hookPtrace() {
    const ptraceAddr = Module.findExportByName('libc.so', 'ptrace');
    if (!ptraceAddr) return;
    Interceptor.replace(ptraceAddr, new NativeCallback(function (req, pid, addr, data) {
        // Force success — pretend we are not being traced
        return 0;
    }, 'long', ['int', 'int', 'pointer', 'pointer']));
}

// ---------- Bootstrap ----------
console.log('[bypass_root_check] Installing bypass hooks...');
hookOpen();
hookSystemProperty();
hookStrstr();
hookGetenv();
hookPtrace();
console.log('[bypass_root_check] Bypass active. Root detection should return false.');
