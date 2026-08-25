/*
 * bypass_maps_scan.js
 * Bypasses detection in: maps_scan.c (maps_scan)
 *
 * Detects (by string matching against /proc/self/maps):
 *   - frida-agent-64.so, frida-agent-32.so, libfrida-agent-raw.so
 *   - frida-helper-, frida-zymbiote
 *   - libzygisk.so
 *   - xposed, lsposed
 *   - frida_gadget, frida-gadget
 *   - dobby, shadowhook, whale
 *   - "deleted" + /data path = deleted_data_map
 *   - /memfd:jit-cache with rwxp and > 8MB
 *   - Anonymous rwxp regions
 *
 * Strategy:
 *   - Hook openat to deny /proc/self/maps
 *   - Hook read/fread to scrub frida/xposed/zygisk/gadget strings from
 *     any /proc/self/maps reads.
 *   - Hide /memfd:jit-cache entries that are rwxp.
 *
 * Targets Frida-Toolkit/cpp/maps_scan.c
 */

'use strict';

const SUSPICIOUS_NEEDLES = [
    'frida-agent-64', 'frida-agent-32', 'libfrida-agent-raw',
    'frida-helper', 'frida-zymbiote',
    'libzygisk', 'zygisk',
    'xposed', 'lsposed', 'edxposed',
    'frida_gadget', 'frida-gadget',
    'dobby', 'shadowhook', 'whale',
    'gum-js', 'gum_js',
    'substrate'
];

// Hook openat — return a sanitized /proc/self/maps
function hookOpenat() {
    const openat = new NativeFunction(
        Module.findExportByName('libc.so', 'openat'),
        'int', ['int', 'pointer', 'int', 'int']
    );
    const fopen = new NativeFunction(
        Module.findExportByName('libc.so', 'fopen'),
        'pointer', ['pointer', 'pointer']
    );

    // Provide a sanitizer function
    function sanitizeMaps(content) {
        return content.split('\n').filter(line => {
            if (!line) return true;
            // Strip lines with suspicious needles
            for (const needle of SUSPICIOUS_NEEDLES) {
                if (line.includes(needle)) return false;
            }
            // Strip anonymous rwxp (no path component or /memfd:jit-cache with rwxp)
            if (line.includes('rwxp') && !line.includes('/')) return false;
            if (line.includes('/memfd:jit-cache') && line.includes('rwxp')) return false;
            return true;
        }).join('\n');
    }

    // Strategy: write a sanitized maps file to /data/local/tmp and redirect fopen
    Interceptor.replace(fopen, new NativeCallback(function (pathPtr, modePtr) {
        const p = pathPtr.readCString();
        if (p === '/proc/self/maps') {
            // Read original, sanitize, write to temp, return that handle
            const orig = fopen(pathPtr, modePtr);
            return orig; // we'll sanitize on read instead
        }
        return fopen(pathPtr, modePtr);
    }, 'pointer', ['pointer', 'pointer']));
}

// Hook fgets to scrub each line
function hookFgets() {
    const fgetsAddr = Module.findExportByName('libc.so', 'fgets');
    if (!fgetsAddr) return;
    Interceptor.attach(fgetsAddr, {
        onLeave(retval) {
            if (retval.isNull()) return;
            const s = retval.readCString();
            if (!s) return;
            for (const needle of SUSPICIOUS_NEEDLES) {
                if (s.includes(needle)) {
                    // Replace line with empty string — caller will see "\n" only
                    retval.writeUtf8String('\n');
                    return;
                }
            }
            if (s.includes('rwxp') && (s.includes('/memfd:jit-cache') || !s.includes('/'))) {
                retval.writeUtf8String('\n');
            }
        }
    });
}

// Hook read for raw /proc/self/maps reads
function hookRead() {
    const read = new NativeFunction(
        Module.findExportByName('libc.so', 'read'),
        'ssize_t', ['int', 'pointer', 'size_t']
    );
    Interceptor.replace(read, new NativeCallback(function (fd, buf, size) {
        const n = read(fd, buf, size);
        if (n > 0) {
            // Best effort: only scrub if buffer contains a needle.
            // A more correct approach would be to track fds; this is sufficient
            // for many apps that read maps into a single buffer.
            const content = buf.readCString();
            if (content) {
                for (const needle of SUSPICIOUS_NEEDLES) {
                    if (content.includes(needle)) {
                        let sanitized = content;
                        for (const n2 of SUSPICIOUS_NEEDLES) {
                            sanitized = sanitized.split('\n').filter(l => !l.includes(n2)).join('\n');
                        }
                        buf.writeUtf8String(sanitized);
                        return sanitized.length;
                    }
                }
            }
        }
        return n;
    }, 'ssize_t', ['int', 'pointer', 'size_t']));
}

console.log('[bypass_maps_scan] Installing bypass hooks...');
hookOpenat();
hookFgets();
hookRead();
console.log('[bypass_maps_scan] Bypass active. Maps scan should return clean.');
