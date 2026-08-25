#include "build_native.h"
#include <sys/system_properties.h>
#include <string.h>

BuildNativeResult build_check_native(void) {
    BuildNativeResult r = {false, false, false, false};
    char val[PROP_VALUE_MAX];

    /* ro.boot.vbmeta.digest — empty = bootloader unlocked or cleared */
    if (__system_property_get("ro.boot.vbmeta.digest", val) <= 0 || val[0] == '\0')
        r.vbmeta_cleared = true;

    /* ro.boot.verifiedbootstate — orange/yellow = modified below OS level */
    if (__system_property_get("ro.boot.verifiedbootstate", val) > 0) {
        r.bootloader_unlocked = (strncmp(val, "orange", 6) == 0 ||
                                 strncmp(val, "yellow", 6) == 0);
    }

    /* ro.build.tags — test-keys = non-production build */
    if (__system_property_get("ro.build.tags", val) > 0) {
        r.test_keys = (strstr(val, "test-keys") != NULL);
    }

    /* ro.build.type — eng/userdebug = debug firmware */
    if (__system_property_get("ro.build.type", val) > 0) {
        r.eng_or_userdebug = (strncmp(val, "eng",       3) == 0 ||
                              strncmp(val, "userdebug", 9) == 0);
    }

    return r;
}
