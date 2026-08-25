#pragma once
#include <stdbool.h>

typedef struct {
    bool vbmeta_cleared;   /* ro.boot.vbmeta.digest empty/missing              */
    bool bootloader_unlocked; /* ro.boot.verifiedbootstate = orange/yellow     */
    bool test_keys;        /* ro.build.tags contains "test-keys"               */
    bool eng_or_userdebug; /* ro.build.type = eng|userdebug                   */
} BuildNativeResult;

BuildNativeResult build_check_native(void);
