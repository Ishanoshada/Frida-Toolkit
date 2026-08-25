#pragma once
#include <stdbool.h>
typedef struct {
    bool su_binary;
    bool magisk_data;
    bool magisk_in_mountinfo;
    bool busybox;
    bool selinux_permissive;
    bool debuggable_prop;
    bool insecure_prop;
    bool eng_build;
    bool apatch;
    bool magisk_unix_socket;        /* "magisk" found in /proc/net/unix */
    bool magisk_in_init_mountinfo;  /* "magisk" found in /proc/1/mountinfo (unfiltered) */
} RootCheckResult;

RootCheckResult root_check_native(void);
