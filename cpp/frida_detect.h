#pragma once
#include <stdbool.h>
typedef struct {
    int  tracer_pid;
    bool tracer_pid_nonzero;
    bool zymbiote_socket;
    bool gadget_tcp_listener;
    bool gadget_symbol_found;
    bool gum_symbol_found;
    bool lsposed_socket;
} FridaDetectResult;

FridaDetectResult frida_detect(void);
