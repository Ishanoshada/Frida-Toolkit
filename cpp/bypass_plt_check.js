/*
 * bypass_plt_check.js
 * Bypasses detection in: plt_check.c (is_ssl_write_hooked, is_ssl_read_hooked, is_libc_open_hooked)
 *
 * Detects:
 *   - SSL_write/SSL_read resolved to a non-libssl module
 *   - libc open() resolved to a non-libc module
 *
 * Strategy:
 *   - Hook dlsym to ensure SSL_write/SSL_read/open resolve to libssl/libc
 *   - Alternative: hook dladdr to return a fake fname for these symbols
 *
 * Targets Frida-Toolkit/cpp/plt_check.c
 */

'use strict';

const PLT_TARGETS = ['SSL_write', 'SSL_read', 'open'];

// Cache of "real" addresses for each symbol so the hook can return them
const realAddrs = new Map();
const realFnames = new Map();

function findLibStart(libname) {
    const mods = Process.enumerateModules();
    for (const m of mods) {
        if (m.name === libname || m.path.endsWith('/' + libname)) {
            return m.base;
        }
    }
    return ptr(0);
}

function hookDlsym() {
    const dlsymAddr = Module.findExportByName('libc.so', 'dlsym');
    if (!dlsymAddr) return;
    Interceptor.attach(dlsymAddr, {
        onEnter(args) {
            this.sym = args[1].readCString();
        },
        onLeave(retval) {
            if (!this.sym) return;
            for (const t of PLT_TARGETS) {
                if (this.sym === t || this.sym.endsWith('_' + t)) {
                    // Resolve to the real libc/libssl export
                    const real = Module.findExportByName(null, t);
                    if (real) {
                        realAddrs.set(t, real);
                        retval.replace(real);
                    }
                }
            }
        }
    });
}

// Hook dladdr so the fname check passes
function hookDladdr() {
    const dladdrAddr = Module.findExportByName('libc.so', 'dladdr');
    if (!dladdrAddr) return;
    Interceptor.attach(dladdrAddr, {
        onEnter(args) {
            this.addr = args[0];
            this.info = args[1];
        },
        onLeave(retval) {
            // If the queried address is in our realAddrs map, patch the fname
            for (const [sym, addr] of realAddrs) {
                if (this.addr.equals(addr)) {
                    // info->dli_fname is at offset 0
                    const expected = (sym === 'open') ? 'libc.so' : 'libssl.so';
                    const fnamePtr = Memory.allocUtf8String(
                        '/system/lib64/' + expected
                    );
                    this.info.writePointer(fnamePtr);
                    return;
                }
            }
        }
    });
}

console.log('[bypass_plt_check] Installing bypass hooks...');
hookDlsym();
hookDladdr();
console.log('[bypass_plt_check] Bypass active. PLT check should report unhooked symbols.');
