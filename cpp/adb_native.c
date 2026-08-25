#include "adb_native.h"
#include "syscall_utils.h"
#include <sys/system_properties.h>
#include <string.h>
#include <fcntl.h>

/* Check /proc/net/tcp6 for a listener on port 5037 (0x13BD in little-endian hex) */
static bool tcp6_has_listener(uint16_t port) {
    int fd = sc_open("/proc/net/tcp6", O_RDONLY);
    if (fd < 0) return false;

    char buf[4096];
    bool found = false;
    ssize_t n;

    /* Port 5037 = 0x13BD. In /proc/net/tcp6 local_address is printed as
     * 32-hex-char IPv6 + ":XXXX" where XXXX is port in hex, big-endian.    */
    char target[8];
    /* snprintf not available without libc — build manually */
    const char hex[] = "0123456789ABCDEF";
    target[0] = ':';
    target[1] = hex[(port >> 12) & 0xF];
    target[2] = hex[(port >>  8) & 0xF];
    target[3] = hex[(port >>  4) & 0xF];
    target[4] = hex[ port        & 0xF];
    target[5] = ' ';
    target[6] = '\0';

    while (!found && (n = sc_read(fd, buf, sizeof(buf) - 1)) > 0) {
        buf[n] = '\0';
        /* Simple substring scan */
        for (ssize_t i = 0; i + 6 <= n; i++) {
            if (buf[i]   == target[0] && buf[i+1] == target[1] &&
                buf[i+2] == target[2] && buf[i+3] == target[3] &&
                buf[i+4] == target[4] && buf[i+5] == target[5]) {
                found = true; break;
            }
        }
    }
    sc_close(fd);
    return found;
}

AdbNativeResult adb_check_native(void) {
    AdbNativeResult r = {false, false, false};

    /* 1. init.svc.adbd property — unreadable via Java if hooked */
    char val[PROP_VALUE_MAX];
    if (__system_property_get("init.svc.adbd", val) > 0) {
        r.adbd_running = (strncmp(val, "running",    7) == 0 ||
                          strncmp(val, "restarting", 10) == 0);
    }

    /* 2. ADB authorized keys file */
    int fd = sc_open("/data/misc/adb/adb_keys", O_RDONLY);
    if (fd >= 0) { r.adb_keys_exist = true; sc_close(fd); }

    /* 3. TCP 5037 listener in /proc/net/tcp6 */
    r.adb_port_open = tcp6_has_listener(5037);

    return r;
}
