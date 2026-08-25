#pragma once
#include <stdint.h>
#include <stdbool.h>
uint64_t timing_baseline(void);
bool     timing_anomaly(uint64_t baseline_ns);
