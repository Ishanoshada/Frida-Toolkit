/*
 * bypass_stack_check.js
 * Bypasses detection in: stack_check.c (stack_has_frida_frame)
 *
 * Detects:
 *   - Any frame in the call stack whose dladdr-fname contains "frida",
 *     "gadget", "gdbus", or "/data/local/tmp"
 *   - Any frame with no backing library (anonymous mapping = injected trampoline)
 *
 * Strategy:
 *   - Hook dladdr to return a fake fname (e.g. /system/lib64/libc.so) for
 *     any address that does not resolve, and to sanitize fnames containing
 *     "frida", "gadget", "gdbus", "/data/local/tmp"
 *   - When dladdr fails, return a non-null result pointing to libc.so
 *
 * Targets Frida-Toolkit/cpp/stack_check.c
 */

'use strict';

const FRAME_NEEDLES = ['frida', 'gadget', 'gdbus', '/data/local/tmp'];
const FAKE_LIB_PATH = '/system/lib64/libc.so';

// Cache the fake path so we can return a stable pointer
let fakePathPtr = null;
function getFakePathPtr() {
    if (!fakePathPtr) {
        fakePathPtr = Memory.allocUtf8String(FAKE_LIB_PATH);
    }
    return fakePathPtr;
}

function hookDladdr() {
    const dladdrAddr = Module.findExportByName('libc.so', 'dladdr');
    if (!dladdrAddr) return;
    Interceptor.replace(dladdrAddr, new NativeCallback(function (addr, info) {
        // First call the real dladdr
        const ok = dladdr(addr, info);
        if (ok === 0) {
            // dladdr failed — frame is anonymous. Forge a successful result.
            // Dl_info layout: dli_fname (ptr), dli_fbase (ptr), dli_sname (ptr), dli_saddr (ptr)
            info.writePointer(getFakePathPtr());                  // dli_fname
            info.add(Process.pointerSize).writePointer(ptr(0));   // dli_fbase
            info.add(Process.pointerSize * 2).writePointer(ptr(0)); // dli_sname
            info.add(Process.pointerSize * 3).writePointer(ptr(0)); // dli_saddr
            return 1;
        }
        // dladdr succeeded — sanitize fname
        const fname = info.readPointer();
        if (!fname.isNull()) {
            const fnameStr = fname.readCString();
            if (fnameStr) {
                for (const needle of FRAME_NEEDLES) {
                    if (fnameStr.includes(needle)) {
                        info.writePointer(getFakePathPtr());
                        return 1;
                    }
                }
            }
        }
        return ok;
    }, 'int', ['pointer', 'pointer']));
}

console.log('[bypass_stack_check] Installing bypass hooks...');
hookDladdr();
console.log('[bypass_stack_check] Bypass active. Stack trace should not report Frida frames.');
