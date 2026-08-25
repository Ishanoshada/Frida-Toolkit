/*
 * bypass_build_native.js
 * Bypasses detection in: build_native.c (build_check_native)
 *
 * Detects:
 *   - ro.boot.vbmeta.digest empty (bootloader unlocked)
 *   - ro.boot.verifiedbootstate = "orange" or "yellow"
 *   - ro.build.tags contains "test-keys"
 *   - ro.build.type = "eng" or "userdebug"
 *
 * Strategy:
 *   - Hook __system_property_get to return clean values for these properties
 *
 * Targets Frida-Toolkit/cpp/build_native.c
 */

'use strict';

function hookSystemProperty() {
    const addr = Module.findExportByName('libc.so', '__system_property_get');
    if (!addr) return;
    Interceptor.attach(addr, {
        onEnter(args) {
            this.name = args[0].readCString();
            this.buf = args[1];
        },
        onLeave(retval) {
            if (!this.name) return;
            switch (this.name) {
                case 'ro.boot.vbmeta.digest':
                    this.buf.writeUtf8String('0123456789abcdef0123456789abcdef');
                    retval.replace(32);
                    break;
                case 'ro.boot.verifiedbootstate':
                    this.buf.writeUtf8String('green');
                    retval.replace(5);
                    break;
                case 'ro.build.tags':
                    this.buf.writeUtf8String('release-keys');
                    retval.replace(12);
                    break;
                case 'ro.build.type':
                    this.buf.writeUtf8String('user');
                    retval.replace(4);
                    break;
            }
        }
    });
}

console.log('[bypass_build_native] Installing bypass hooks...');
hookSystemProperty();
console.log('[bypass_build_native] Bypass active. Build state should report clean.');
