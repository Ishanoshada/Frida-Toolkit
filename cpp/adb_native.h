#pragma once
#include <stdbool.h>

typedef struct {
    bool adbd_running;    /* init.svc.adbd = "running"  via __system_property_get */
    bool adb_keys_exist;  /* /data/misc/adb/adb_keys present (ADB ever authorized) */
    bool adb_port_open;   /* TCP 5037 has a listener in /proc/net/tcp6             */
} AdbNativeResult;

AdbNativeResult adb_check_native(void);
