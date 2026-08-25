#pragma once
#include <stdbool.h>

/* Returns true if any Frida worker thread is found in /proc/self/task.
 * Catches Frida attach-mode injection which creates named threads. */
bool has_frida_threads(void);
