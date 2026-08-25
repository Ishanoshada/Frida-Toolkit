#pragma once
#include <stdbool.h>
typedef struct {
    bool frida_agent;
    bool frida_helper;
    bool frida_raw_agent;
    bool frida_zymbiote;
    bool frida_gadget;
    bool frida_memfd;
    bool deleted_data_map;
    bool zygisk_active;
    bool xposed_mapped;
    bool hook_framework;   /* Dobby / shadowhook / whale */
    bool anon_rwx;
} MapsScanResult;

MapsScanResult maps_scan(void);
