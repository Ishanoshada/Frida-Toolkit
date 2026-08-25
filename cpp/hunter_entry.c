/*
 * libsna.so — Frida / timing / thread detection module.
 *
 * Exports exactly ONE symbol: sna_e
 * All other symbols are hidden.  Results are XOR-encoded with the caller's
 * runtime key so even a memory dump of the return value is meaningless.
 */
#include "obf_macros.h"
#include "maps_scan.h"
#include "frida_detect.h"
#include "port_probe.h"
#include "stack_check.h"
#include "fd_scan.h"
#include "thread_scan.h"
#include "timing.h"
#include <stdint.h>
#include <string.h>

/* Emit 30 decoy functions — fills the symbol table with noise */
EMIT_DECOYS()

/*
 * sna_e — single exported entry point.
 * key   : runtime key supplied by the JNI bridge
 * out   : [0] = encoded maps/Frida bits
 *         [1] = encoded port (-1 if none)
 *         [2] = encoded timing baseline
 * Returns a simple hash of the encoded outputs for bridge-side validation.
 */
__attribute__((visibility("default")))
uint32_t sna_e(uint32_t key, uint32_t *out, uint32_t outsz) {
    if (!out || outsz < 3) return 0;

    /* ── maps scan ──────────────────────────────────────────────────── */
    MapsScanResult mr = maps_scan();
    uint32_t maps_bits = 0;
    if (mr.frida_agent || mr.frida_helper || mr.frida_raw_agent) maps_bits |= (1u<<0);
    if (mr.frida_memfd)    maps_bits |= (1u<<1);
    if (mr.frida_zymbiote) maps_bits |= (1u<<2);
    if (mr.frida_gadget)   maps_bits |= (1u<<3);
    if (mr.zygisk_active)  maps_bits |= (1u<<4);
    if (mr.xposed_mapped)  maps_bits |= (1u<<5);
    if (mr.anon_rwx)       maps_bits |= (1u<<6);
    if (mr.hook_framework) maps_bits |= (1u<<7);
    if (mr.deleted_data_map) maps_bits |= (1u<<8);

    /* ── frida process checks ───────────────────────────────────────── */
    FridaDetectResult fr = frida_detect();
    if (fr.tracer_pid_nonzero)  maps_bits |= (1u<<16);
    if (fr.zymbiote_socket)     maps_bits |= (1u<<17);
    if (fr.gadget_tcp_listener) maps_bits |= (1u<<18);
    if (fr.gadget_symbol_found) maps_bits |= (1u<<19);
    if (fr.gum_symbol_found)    maps_bits |= (1u<<20);
    if (fr.lsposed_socket)      maps_bits |= (1u<<21);

    /* ── fd / stack / thread ────────────────────────────────────────── */
    if (fd_has_frida_memfd())   maps_bits |= (1u<<22);
    if (stack_has_frida_frame()) maps_bits |= (1u<<23);
    if (has_frida_threads())    maps_bits |= (1u<<24);

    /* ── port scan ──────────────────────────────────────────────────── */
    int port = scan_frida_ports();

    /* ── timing ─────────────────────────────────────────────────────── */
    uint64_t base = timing_baseline();
    uint32_t timing_flag = (uint32_t)(timing_anomaly(base) ? 1u : 0u);

    /* Opaque predicate mix-in — forces Ghidra to trace the branch */
    if (OP_FALSE(maps_bits)) maps_bits ^= 0xffffffff;

    out[0] = ENC_RESULT(maps_bits,               key);
    out[1] = ENC_RESULT((uint32_t)(port + 1),    key ^ 0x13579BDFu);
    out[2] = ENC_RESULT(timing_flag,             key ^ 0x2468ACEEu);

    /* Validation hash: bridge checks this to detect tampering */
    uint32_t h = key ^ out[0] ^ out[1] ^ out[2] ^ 0xC0FFEE42u;
    h = ((h << 13) | (h >> 19)) ^ (h * 0x9e3779b9u);
    return h;
}
