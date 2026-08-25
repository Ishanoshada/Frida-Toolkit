#pragma once
#include <stdbool.h>
typedef struct {
    bool conscrypt_tmpfs;
    bool magisk_mount;
    bool system_rw;
} MountCheckResult;

MountCheckResult mount_check(void);
