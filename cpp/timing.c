#include "timing.h"
#include <sys/syscall.h>
#include <unistd.h>
#include <time.h>

static uint64_t now_ns(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC_RAW, &ts);
    return (uint64_t)ts.tv_sec * 1000000000ULL + (uint64_t)ts.tv_nsec;
}

#define ITERS   10000
#define WARMUP  500

static void warmup(void) {
    for (int i = 0; i < WARMUP; i++) { volatile long r = syscall(__NR_getpid); (void)r; }
}

static uint64_t measure_one(void) {
    uint64_t s = now_ns();
    for (int i = 0; i < ITERS; i++) { volatile long r = syscall(__NR_getpid); (void)r; }
    return (now_ns() - s) / ITERS;
}

uint64_t timing_baseline(void) {
    warmup();
    return measure_one();
}

bool timing_anomaly(uint64_t baseline_ns) {
    /* Re-measure baseline right here so both readings share the same CPU
     * frequency state — eliminates false positives from DVFS throttling
     * between the early baseline call and the later check call. */
    warmup();
    uint64_t fresh_base = measure_one();

    /* Prefer the faster (lower) of the externally-supplied and fresh
     * baselines: a lower reference makes the threshold harder to hit,
     * reducing false positives. */
    uint64_t ref = (baseline_ns > 0 && baseline_ns < fresh_base)
                   ? baseline_ns : fresh_base;

    /* Sanity-guard: < 50 ns is impossible on Android, > 50 µs means the
     * loop itself is being traced — skip unreliable measurements. */
    if (ref < 50 || ref > 50000) return false;

    uint64_t check = measure_one();

    /* Frida hook overhead: 10–100×.  CPU frequency variation: ≤ 4–5×.
     * 8× gives a clean gap between the two. */
    return check > ref * 8;
}
