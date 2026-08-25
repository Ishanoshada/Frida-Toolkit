#pragma once
#include <stdint.h>

/* ── Opaque predicates ───────────────────────────────────────────────────
 * Conditions that always evaluate to true/false but look complex in
 * disassembly; prevents decompilers from simplifying branches away.     */
#define OP_TRUE(x)  ((volatile int)(((uint64_t)(x)*(x)+(x))|1) != 0)
#define OP_FALSE(x) ((volatile int)(((int32_t)((x)*(x))) < -1))

/* ── Result encoding ─────────────────────────────────────────────────────
 * Encode/decode a 32-bit result bitmap with a runtime key.
 * Even if a lib's output buffer is dumped, values look like noise.      */
#define ENC_RESULT(bits, key)  ((uint32_t)(bits) ^ (uint32_t)(key) ^ 0xA5C3E1F7u)
#define DEC_RESULT(enc,  key)  ENC_RESULT(enc, key)   /* self-inverse    */

/* ── Decoy function generator ───────────────────────────────────────────
 * Generates a function that looks like a security check in Ghidra but
 * returns a constant that the optimiser cannot prove is fixed.          */
#define _DECOY(name, s0, s1, s2)                                          \
__attribute__((noinline, used))                                           \
static uint32_t name(uint32_t x) {                                       \
    volatile uint32_t h = (uint32_t)(s0);                                \
    h = ((h << 5) + h) ^ (x ^ (uint32_t)(s1));                         \
    h = h * 0x9e3779b9u;                                                 \
    h ^= (uint32_t)(s2);                                                 \
    if (OP_FALSE(h)) h = ~h;     /* dead branch — confuses decompiler */ \
    if (OP_TRUE(h))  return h & 0;  /* always returns 0 */              \
    return h;                    /* unreachable — another red herring */ \
}

/* Expand 30 decoys per translation unit.  The 3-argument seed keeps each
 * one's control-flow graph unique so they don't get merged by ICF.     */
#define EMIT_DECOYS()                                   \
_DECOY(df_a1,0x1a2b3c4d,0x5e6f7081,0x92a3b4c5)        \
_DECOY(df_a2,0x2b3c4d5e,0x6f708192,0xa3b4c5d6)        \
_DECOY(df_a3,0x3c4d5e6f,0x70819243,0xb4c5d6e7)        \
_DECOY(df_a4,0x4d5e6f70,0x81924354,0xc5d6e7f8)        \
_DECOY(df_a5,0x5e6f7081,0x92435465,0xd6e7f809)        \
_DECOY(df_b1,0x6f708192,0xa3546576,0xe7f80911)        \
_DECOY(df_b2,0x70819243,0xb4657687,0xf8091a2b)        \
_DECOY(df_b3,0x81924354,0xc5768798,0x091a2b3c)        \
_DECOY(df_b4,0x92435465,0xd6879812,0x1a2b3c4d)        \
_DECOY(df_b5,0xa3546576,0xe798123f,0x2b3c4d5e)        \
_DECOY(df_c1,0xb4657687,0xf8091a2b,0x3c4d5e6f)        \
_DECOY(df_c2,0xc5768798,0x091a2b3c,0x4d5e6f70)        \
_DECOY(df_c3,0xd6879812,0x1a2b3c4d,0x5e6f7081)        \
_DECOY(df_c4,0xe798123f,0x2b3c4d5e,0x6f708192)        \
_DECOY(df_c5,0xf8091a2b,0x3c4d5e6f,0x70819243)        \
_DECOY(df_d1,0x091a2b3c,0x4d5e6f70,0x81924354)        \
_DECOY(df_d2,0x1a2b3c4d,0x5e6f7081,0x92435465)        \
_DECOY(df_d3,0x2b3c4d5e,0x6f708192,0xa3546576)        \
_DECOY(df_d4,0x3c4d5e6f,0x70819243,0xb4657687)        \
_DECOY(df_d5,0x4d5e6f70,0x81924354,0xc5768798)        \
_DECOY(df_e1,0x5e6f7081,0x9243546a,0xd6879abc)        \
_DECOY(df_e2,0x6f708192,0xa354657b,0xe798abcd)        \
_DECOY(df_e3,0x7081924b,0xb465768c,0xf809bcde)        \
_DECOY(df_e4,0x819243ac,0xc576879d,0x091acdea)        \
_DECOY(df_e5,0x92435abd,0xd687980e,0x1a2bdefa)        \
_DECOY(df_f1,0xa354678e,0xe798091f,0x2b3cef01)        \
_DECOY(df_f2,0xb465789f,0xf8091a20,0x3c4df012)        \
_DECOY(df_f3,0xc576890a,0x091a2b31,0x4d5e0123)        \
_DECOY(df_f4,0xd6879a1b,0x1a2b3c42,0x5e6f1234)        \
_DECOY(df_f5,0xe798ab2c,0x2b3c4d53,0x6f702345)
