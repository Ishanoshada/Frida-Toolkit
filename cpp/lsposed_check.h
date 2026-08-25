#pragma once
#include <stdbool.h>

typedef struct {
    bool lspd_process;    /* lspd daemon found in proc-star-cmdline        */
    bool lspd_data_dir;   /* /data/adb/lspd/ accessible via direct open   */
    bool module_lsposed;  /* /data/adb/modules/lsposed/ found             */
    bool module_shamiko;  /* /data/adb/modules/shamiko/ found             */
    bool module_hma;      /* /data/adb/modules/hidemyapplist/ found       */
    bool module_zgnxt;    /* /data/adb/modules/zygisknext/ found          */
} LsposedCheckResult;

LsposedCheckResult lsposed_check(void);
