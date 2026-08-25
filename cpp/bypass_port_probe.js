/*
 * bypass_port_probe.js
 * Bypasses detection in: port_probe.c (probe_frida_port, scan_frida_ports)
 *
 * Detects:
 *   - Connects to known ports (27042, 27043, 4444, etc.) and waits for
 *     a D-Bus METHOD_CALL greeting with version=0x01, prefix=0x6C,
 *     and non-zero header-fields array length.
 *
 * Strategy:
 *   - Hook connect() to immediately return success on Frida ports
 *   - Hook recv() to return a payload that does NOT match the D-Bus check
 *
 * Targets Frida-Toolkit/cpp/port_probe.c
 */

'use strict';

const FRIDA_PORTS = new Set([
    27042, 27043, 4444, 1234, 8888, 9999,
    1337, 7777, 31415, 8080, 8443, 11111,
    5555, 6666, 2222, 54321, 12345
]);

// Hook connect — make it look like Frida is unreachable
function hookConnect() {
    const connectAddr = Module.findExportByName('libc.so', 'connect');
    if (!connectAddr) return;
    Interceptor.replace(connectAddr, new NativeCallback(function (fd, addr, len) {
        // Reject all loopback connections on suspect ports
        if (addr && !addr.isNull()) {
            // sockaddr_in: family at offset 0, port at offset 2-3 (big-endian)
            const port = (addr.add(2).readU8() << 8) | addr.add(3).readU8();
            if (FRIDA_PORTS.has(port)) {
                // ECONNREFUSED
                const __errno = new NativeFunction(
                    Module.findExportByName('libc.so', '__errno'),
                    'pointer', []
                );
                __errno().writeU32(111); // ECONNREFUSED
                return -1;
            }
        }
        return connect(fd, addr, len);
    }, 'int', ['int', 'pointer', 'int']));
}

// Hook socket — return an invalid fd for new sockets on loopback
function hookSocket() {
    const socketAddr = Module.findExportByName('libc.so', 'socket');
    if (!socketAddr) return;
    // Don't replace socket — just hook connect above
}

// Hook recv — return data that fails the D-Bus check
function hookRecv() {
    const recv = new NativeFunction(
        Module.findExportByName('libc.so', 'recv'),
        'ssize_t', ['int', 'pointer', 'size_t', 'int']
    );
    Interceptor.replace(recv, new NativeCallback(function (fd, buf, len, flags) {
        // Get the original socket and check the destination port.
        // For Frida ports, return zeros so the D-Bus check fails.
        const n = recv(fd, buf, len, flags);
        if (n > 0) {
            // Check if the first byte is the D-Bus 0x6C prefix
            if (buf.readU8() === 0x6C) {
                // Zero out the version and header fields bytes
                buf.writeU8(0x00, 0);
                buf.writeU8(0x00, 3);
                for (let i = 12; i < 16; i++) buf.writeU8(0x00, i);
            }
        }
        return n;
    }, 'ssize_t', ['int', 'pointer', 'size_t', 'int']));
}

console.log('[bypass_port_probe] Installing bypass hooks...');
hookConnect();
hookRecv();
console.log('[bypass_port_probe] Bypass active. Port probe should report no Frida ports.');
