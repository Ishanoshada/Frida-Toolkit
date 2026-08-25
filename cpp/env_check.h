#pragma once
#include <stdbool.h>
typedef struct {
    bool ld_preload_injected;
    bool tracer_detected;       /* ptrace TRACEME fails = already traced */
} EnvCheckResult;

EnvCheckResult env_check(void);
