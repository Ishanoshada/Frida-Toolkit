/*
 * bypass_env_check.js
 * Bypasses detection in: env_check.c (env_check)
 *
 * Detects:
 *   - LD_PRELOAD environment variable set
 *   - LD_LIBRARY_PATH pointing under /data/local
 *   - ptrace(PTRACE_TRACEME) returning EPERM (already traced)
 *
 * Strategy:
 *   - Hook getenv to return NULL for LD_PRELOAD and LD_LIBRARY_PATH
 *   - Replace ptrace() so TRACEME always succeeds
 *
 * Targets Frida-Toolkit/cpp/env_check.c
 */

'use strict';

// Hook getenv
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

// Hook ptrace
function hookPtrace() {
    const ptraceAddr = Module.findExportByName('libc.so', 'ptrace');
    if (!ptraceAddr) return;
    Interceptor.replace(ptraceAddr, new NativeCallback(function (req, pid, addr, data) {
        // Always succeed — never report we're being traced
        return 0;
    }, 'long', ['int', 'int', 'pointer', 'pointer']));
}

console.log('[bypass_env_check] Installing bypass hooks...');
hookGetenv();
hookPtrace();
console.log('[bypass_env_check] Bypass active. LD_PRELOAD/pTraceme checks should return clean.');
