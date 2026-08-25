#include "port_probe.h"
#include "syscall_utils.h"
#include <string.h>
#include <sys/time.h>

bool probe_frida_port(int port) {
    int sock = sc_socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) return false;

    /* 80 ms — enough for localhost, long enough for Frida to send its greeting */
    struct timeval tv = { .tv_sec = 0, .tv_usec = 80000 };
    sc_setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    sc_setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family      = AF_INET;
    addr.sin_port        = __builtin_bswap16((uint16_t)port);
    addr.sin_addr.s_addr = 0x0100007F;  /* 127.0.0.1 */

    if (sc_connect(sock, (struct sockaddr *)&addr, sizeof(addr)) != 0) {
        sc_close(sock); return false;
    }

    /*
     * Do NOT send anything first.  Frida's embedded D-Bus server sends an
     * unsolicited METHOD_CALL immediately on connect as its handshake.
     * ADB loopback relay sockets (the common false-positive source) only
     * echo data back — they send nothing unless we write first.
     *
     * A real Frida D-Bus METHOD_CALL must have non-empty header fields
     * (PATH + MEMBER are mandatory per spec), so bytes 12-15 (header fields
     * array length, little-endian) will be non-zero.  An accidental 0x6c
     * prefix from a non-D-Bus service is extremely unlikely to also satisfy
     * the version byte and non-zero header fields check.
     */
    uint8_t resp[64] = {0};
    ssize_t n = sc_recv(sock, resp, sizeof(resp), 0);
    sc_close(sock);

    return (n >= 16 &&
            resp[0] == 0x6c &&
            resp[3] == 0x01 &&
            (resp[1] == 0x01 || resp[1] == 0x02 || resp[1] == 0x04) &&
            (resp[12] | resp[13] | resp[14] | resp[15]) != 0);
}

int scan_frida_ports(void) {
    /* Fast path — known ports */
    static const int known[] = {
        27042, 27043, 4444, 1234, 8888, 9999,
        1337, 7777, 31415, 8080, 8443, 11111,
        5555, 6666, 2222, 54321, 12345, -1
    };
    for (int i = 0; known[i] != -1; i++)
        if (probe_frida_port(known[i])) return known[i];

    /* Full range */
    for (int p = 1024; p <= 65535; p++) {
        bool skip = false;
        for (int i = 0; known[i] != -1; i++) if (known[i] == p) { skip=true; break; }
        if (skip) continue;
        if (probe_frida_port(p)) return p;
    }
    return -1;
}
