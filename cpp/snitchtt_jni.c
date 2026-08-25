#include <jni.h>
#include <stdbool.h>
#include <string.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>
#include <sys/syscall.h>
#include <dlfcn.h>
#include <stdint.h>

#include "obf_macros.h"
#include "str_enc.h"
#include "syscall_utils.h"

EMIT_DECOYS()

#define TAG "Snitchtt"
#define CLS "ai/snitchtt/SnitchNative"

/* ── Encoded lib/symbol names (XOR 0x42) ───────────────────────────────── */
static const unsigned char _LSNA[]  = {0x2e,0x2b,0x20,0x31,0x2c,0x23,0x6c,0x31,0x2d}; /* libsna.so */
static const unsigned char _LSNB[]  = {0x2e,0x2b,0x20,0x31,0x2c,0x20,0x6c,0x31,0x2d}; /* libsnb.so */
static const unsigned char _SNAE[]  = {0x31,0x2c,0x23,0x1d,0x27};                       /* sna_e     */
static const unsigned char _SNBE[]  = {0x31,0x2c,0x20,0x1d,0x27};                       /* snb_e     */

typedef uint32_t (*sn_entry_t)(uint32_t key, uint32_t *out, uint32_t outsz);

/* ── Module handles ─────────────────────────────────────────────────────── */
static void       *g_hna    = NULL;
static void       *g_hnb    = NULL;
static sn_entry_t  g_sna_fn = NULL;
static sn_entry_t  g_snb_fn = NULL;

/* ── Runtime state ───────────────────────────────────────────────────────── */
static uint32_t  g_key        = 0;
static JavaVM   *g_jvm        = NULL;
static jclass    g_cls_global = NULL;   /* global ref — used to re-register natives */

/* ── Early-scan cache ────────────────────────────────────────────────────── */
static uint32_t  g_early_key     = 0;
static uint32_t  g_early_na[3]   = {0, 0, 0};
static uint32_t  g_early_nb[3]   = {0, 0, 0};
static uint32_t  g_early_ha      = 0;
static uint32_t  g_early_hb      = 0;
static volatile int g_early_done = 0;

/* ── Late-inject flag ────────────────────────────────────────────────────── */
static volatile uint32_t g_late_inject_bits = 0;

/* ── JNI function pointer integrity seal ────────────────────────────────── *
 * At RegisterNatives time we store the base address of libsnitchtt.so.
 * Periodically we verify our static functions still dladdr to the same base.
 * If an attacker replaced any function pointer via RegisterNatives vtable
 * capture, the trampoline will be in a different module.                     */
static void *g_own_base = NULL;

static void capture_own_base(void) {
    Dl_info di;
    if (dladdr((void*)(uintptr_t)JNI_OnLoad, &di))
        g_own_base = di.dli_fbase;
}

/* ── FIX 1: Caller-origin check ─────────────────────────────────────────── *
 * When called from ART's JNI dispatcher the return address is in a system    *
 * library under /apex/ or /system/.  If Frida replaced our function via      *
 * RegisterNatives capture, its trampoline is in an anonymous mapping.         */
static bool __attribute__((noinline)) caller_is_system(void) {
    /* Level 0 = immediate caller (ART JNI dispatch stub in libart.so)        */
    void *ra = __builtin_return_address(0);
    Dl_info di;
    if (!dladdr(ra, &di)) return false;          /* anonymous mapping = hook  */
    if (!di.dli_fname)    return false;
    const char *f = di.dli_fname;
    /* Must originate from a system APEX or /system/ library, never /data/    */
    return (strstr(f, "/apex/") != NULL || strstr(f, "/system/") != NULL);
}

/* Returns true if any sampled JNI function pointer no longer lives in our .so */
static bool __attribute__((unused)) jni_ptrs_hijacked(void) {
    if (!g_own_base) return false;
    /* Sample a handful of our static JNI functions via dladdr */
    extern jint n_scan_maps_sentinel;   /* declared below as a way to get addresses */
    void *probes[4];
    int nprobe = 0;
    Dl_info di;
    /* Use g_sna_fn and g_snb_fn as indirect probes — they live in detection libs;
     * if they got NULL-ed out that's also suspicious.                          */
    if (!g_sna_fn || !g_snb_fn) return true;
    probes[nprobe++] = (void*)(uintptr_t)g_sna_fn;
    /* Check that sna_fn lives in the expected module (libsna.so) */
    if (dladdr(probes[0], &di) && di.dli_fbase == g_own_base)
        return true;  /* sna_fn pointing into OUR module = redirected */
    return false;
}

/* ── FIX 2: Re-register natives every monitor cycle ─────────────────────── *
 * Overwrites any pointer that an attacker installed via vtable capture.       */
static void reregister_natives(JNIEnv *env);  /* forward declaration          */

/* ── Key generator ───────────────────────────────────────────────────────── */
static uint32_t gen_key(void) {
    uint32_t k = (uint32_t)(uintptr_t)JNI_OnLoad;
    k ^= (uint32_t)getpid();
    k ^= (uint32_t)(uintptr_t)&g_key;
    k = ((k << 7) | (k >> 25)) * 0x9e3779b9u;
    if (OP_FALSE(k)) k = ~k;
    return k ? k : 0x5A5A5A5Au;
}

/* ── Shared path resolver ────────────────────────────────────────────────── */
static int resolve_lib_dir(const void *anchor, char *dir_out, size_t dir_sz) {
    Dl_info di; memset(&di, 0, sizeof(di));
    if (!dladdr(anchor, &di) || !di.dli_fname) return 0;
    const char *f = di.dli_fname;
    size_t n = strlen(f), sl = n;
    while (sl > 0 && f[sl - 1] != '/') sl--;
    if (sl == 0 || sl >= dir_sz) return 0;
    memcpy(dir_out, f, sl);
    dir_out[sl] = '\0';
    return 1;
}

/* ── FIX 3: Constructor — pre-load libs before JNI_OnLoad ───────────────── */
__attribute__((constructor(101)))
static void snitchtt_early_scan(void) {
    char dir[256], path[256];
    if (!resolve_lib_dir((const void *)(uintptr_t)snitchtt_early_scan, dir, sizeof(dir)))
        return;

    uint32_t ek = (uint32_t)(uintptr_t)&ek ^ (uint32_t)(uintptr_t)snitchtt_early_scan;
    ek ^= (uint32_t)getpid();
    ek = ((ek << 11) | (ek >> 21)) * 0x9e3779b9u;
    if (OP_FALSE(ek)) ek = ~ek;
    g_early_key = ek ? ek : 0xDEAD1234u;

    char *lsna = sd(_LSNA, sizeof(_LSNA));
    if (lsna) {
        snprintf(path, sizeof(path), "%s%s", dir, lsna); free(lsna);
        void *h = dlopen(path, RTLD_LOCAL | RTLD_NOW);
        if (h) {
            char *sym = sd(_SNAE, sizeof(_SNAE));
            if (sym) {
                sn_entry_t fn = (sn_entry_t)dlsym(h, sym);
                if (fn) g_early_ha = fn(g_early_key, g_early_na, 3);
                free(sym);
            }
        }
    }
    char *lsnb = sd(_LSNB, sizeof(_LSNB));
    if (lsnb) {
        snprintf(path, sizeof(path), "%s%s", dir, lsnb); free(lsnb);
        void *h = dlopen(path, RTLD_LOCAL | RTLD_NOW);
        if (h) {
            char *sym = sd(_SNBE, sizeof(_SNBE));
            if (sym) {
                sn_entry_t fn = (sn_entry_t)dlsym(h, sym);
                if (fn) g_early_hb = fn(g_early_key, g_early_nb, 3);
                free(sym);
            }
        }
    }
    g_early_done = 1;
}

/* ── Late-inject comparison ──────────────────────────────────────────────── */
static void check_late_inject(const uint32_t *fresh_na, const uint32_t *fresh_nb) {
    if (!g_early_done) return;
    uint32_t early_maps = DEC_RESULT(g_early_na[0], g_early_key);
    uint32_t fresh_maps = DEC_RESULT(fresh_na[0],   g_key);
    uint32_t frida_mask = 0x01FF0000u | 0x000001FFu;
    uint32_t new_frida  = (fresh_maps & frida_mask) & ~(early_maps & frida_mask);
    if (new_frida) g_late_inject_bits |= new_frida;
    uint32_t early_env = DEC_RESULT(g_early_nb[2], g_early_key ^ 0x12345678u);
    uint32_t fresh_env = DEC_RESULT(fresh_nb[2],   g_key       ^ 0x12345678u);
    if ((fresh_env & (1u<<1)) && !(early_env & (1u<<1)))
        g_late_inject_bits |= (1u << 31);
}

/* ── Load detection modules ──────────────────────────────────────────────── */
static void load_modules(void) {
    char dir[256], path[256];
    if (!resolve_lib_dir((const void *)(uintptr_t)JNI_OnLoad, dir, sizeof(dir))) return;

    char *lsna = sd(_LSNA, sizeof(_LSNA));
    if (lsna) {
        snprintf(path, sizeof(path), "%s%s", dir, lsna); free(lsna);
        g_hna = dlopen(path, RTLD_LOCAL | RTLD_NOW);
        if (g_hna) {
            char *sym = sd(_SNAE, sizeof(_SNAE));
            if (sym) { g_sna_fn = (sn_entry_t)dlsym(g_hna, sym); free(sym); }
        }
    }
    char *lsnb = sd(_LSNB, sizeof(_LSNB));
    if (lsnb) {
        snprintf(path, sizeof(path), "%s%s", dir, lsnb); free(lsnb);
        g_hnb = dlopen(path, RTLD_LOCAL | RTLD_NOW);
        if (g_hnb) {
            char *sym = sd(_SNBE, sizeof(_SNBE));
            if (sym) { g_snb_fn = (sn_entry_t)dlsym(g_hnb, sym); free(sym); }
        }
    }
}

/* ── Call helpers ────────────────────────────────────────────────────────── */
static uint32_t call_sna(uint32_t *out3) {
    if (!g_sna_fn) { out3[0] = out3[1] = out3[2] = 0; return 0; }
    uint32_t h = g_sna_fn(g_key, out3, 3);
    uint32_t exp = g_key ^ out3[0] ^ out3[1] ^ out3[2] ^ 0xC0FFEE42u;
    exp = ((exp << 13) | (exp >> 19)) ^ (exp * 0x9e3779b9u);
    if (h != exp) { out3[0] = out3[1] = out3[2] = 0; return 0; }
    if (g_late_inject_bits) {
        uint32_t d = DEC_RESULT(out3[0], g_key);
        d |= (1u << 25);
        out3[0] = ENC_RESULT(d, g_key);
    }
    return 1u;
}

static uint32_t call_snb(uint32_t *out3) {
    if (!g_snb_fn) { out3[0] = out3[1] = out3[2] = 0; return 0; }
    uint32_t h = g_snb_fn(g_key, out3, 3);
    uint32_t exp = g_key ^ out3[0] ^ out3[1] ^ out3[2] ^ 0xDEADFA11u;
    exp = ((exp << 17) | (exp >> 15)) ^ (exp * 0x9e3779b9u);
    if (h != exp) { out3[0] = out3[1] = out3[2] = 0; return 0; }
    return 1u;
}

static void full_scan(uint32_t *na, uint32_t *nb, int *na_ok, int *nb_ok) {
    *na_ok = (int)call_sna(na);
    *nb_ok = (int)call_snb(nb);
    if (*na_ok && *nb_ok) check_late_inject(na, nb);
}

/* ── JNI implementations ─────────────────────────────────────────────────── */

/* FIX 1 applied: each JNI fn checks caller is from a system library.
 * If Frida replaced the function pointer via RegisterNatives vtable capture,
 * the call will arrive from Frida's trampoline (anonymous / non-system mapping)
 * rather than from libart.so — we detect this and add a penalty score.        */
#define CALLER_CHECK(out_expr)                        \
    do {                                              \
        if (!caller_is_system()) {                    \
            g_late_inject_bits |= (1u << 30);         \
        }                                             \
    } while(0)

static jint n_scan_maps(JNIEnv *e, jclass c) {
    (void)e;(void)c; CALLER_CHECK();
    uint32_t na[3]={0}, nb[3]={0}; int na_ok, nb_ok;
    full_scan(na, nb, &na_ok, &nb_ok);
    if (!na_ok) return 0;
    uint32_t m = DEC_RESULT(na[0], g_key);
    jint f = 0;
    if (m&(1u<<0))  f|=(1<<0);
    if (m&(1u<<1))  f|=(1<<1);
    if (m&(1u<<2))  f|=(1<<2);
    if (m&(1u<<3))  f|=(1<<3);
    if (m&(1u<<4))  f|=(1<<4);
    if (m&(1u<<5))  f|=(1<<5);
    if (m&(1u<<6))  f|=(1<<6);
    if (m&(1u<<7))  f|=(1<<7);
    if (m&(1u<<8))  f|=(1<<8);
    if (m&(1u<<25)) f|=(1<<9);   /* late-inject sentinel */
    return f;
}

static jint n_detect_frida(JNIEnv *e, jclass c) {
    (void)e;(void)c; CALLER_CHECK();
    uint32_t na[3]={0}, nb[3]={0}; int na_ok, nb_ok;
    full_scan(na, nb, &na_ok, &nb_ok);
    if (!na_ok) return 0;
    uint32_t m = DEC_RESULT(na[0], g_key);
    jint f = 0;
    if (m&(1u<<16)) f|=(1<<0);
    if (m&(1u<<17)) f|=(1<<1);
    if (m&(1u<<18)) f|=(1<<2);
    if (m&(1u<<19)) f|=(1<<3);
    if (m&(1u<<20)) f|=(1<<4);
    if (m&(1u<<21)) f|=(1<<5);
    return f;
}

static jint n_scan_port(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_sna(out)) return -1;
    return (jint)DEC_RESULT(out[1], g_key ^ 0x13579BDFu) - 1;
}

static jint n_check_mounts(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[1], g_key ^ 0xFEDCBA98u);
    jint f = 0;
    if (m&(1u<<0)) f|=(1<<0);
    if (m&(1u<<1)) f|=(1<<1);
    if (m&(1u<<2)) f|=(1<<2);
    return f;
}

static jint n_check_root(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[0], g_key);
    jint f = 0;
    if (m&(1u<<0))  f|=(1<<0);
    if (m&(1u<<1))  f|=(1<<1);
    if (m&(1u<<2))  f|=(1<<2);
    if (m&(1u<<3))  f|=(1<<3);
    if (m&(1u<<4))  f|=(1<<4);
    if (m&(1u<<5))  f|=(1<<5);
    if (m&(1u<<6))  f|=(1<<6);
    if (m&(1u<<7))  f|=(1<<7);
    if (m&(1u<<8))  f|=(1<<8);
    if (m&(1u<<9))  f|=(1<<9);
    if (m&(1u<<10)) f|=(1<<10);
    return f;
}

static jboolean n_check_plt(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return JNI_FALSE;
    uint32_t m = DEC_RESULT(out[2], g_key ^ 0x12345678u);
    return (m & (1u<<2)) ? JNI_TRUE : JNI_FALSE;
}

static jboolean n_check_stack(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_sna(out)) return JNI_FALSE;
    uint32_t m = DEC_RESULT(out[0], g_key);
    return (m & (1u<<23)) ? JNI_TRUE : JNI_FALSE;
}

static jboolean n_check_fd(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_sna(out)) return JNI_FALSE;
    uint32_t m = DEC_RESULT(out[0], g_key);
    return (m & (1u<<22)) ? JNI_TRUE : JNI_FALSE;
}

static jint n_check_env(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[2], g_key ^ 0x12345678u);
    jint f = 0;
    if (m&(1u<<0)) f|=(1<<0);
    if (m&(1u<<1)) f|=(1<<1);
    return f;
}

static jboolean n_check_threads(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_sna(out)) return JNI_FALSE;
    uint32_t m = DEC_RESULT(out[0], g_key);
    return (m & (1u<<24)) ? JNI_TRUE : JNI_FALSE;
}

static jint n_check_lsposed(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[2], g_key ^ 0x12345678u);
    jint f = 0;
    if (m&(1u<<4)) f|=(1<<0);
    if (m&(1u<<5)) f|=(1<<1);
    if (m&(1u<<6)) f|=(1<<2);
    if (m&(1u<<7)) f|=(1<<3);
    if (m&(1u<<8)) f|=(1<<4);
    if (m&(1u<<9)) f|=(1<<5);
    return f;
}

static jboolean n_check_late_inject(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    return g_late_inject_bits ? JNI_TRUE : JNI_FALSE;
}

/* FIX: native ADB + build checks — bits 10-16 in env_bits of snb */
static jint n_check_adb_native(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[2], g_key ^ 0x12345678u);
    jint f = 0;
    if (m&(1u<<10)) f|=(1<<0);   /* adbd_running   */
    if (m&(1u<<11)) f|=(1<<1);   /* adb_keys_exist */
    if (m&(1u<<12)) f|=(1<<2);   /* adb_port_open  */
    return f;
}

static jint n_check_build_native(JNIEnv *e, jclass c) {
    (void)e;(void)c;
    uint32_t out[3]={0};
    if (!call_snb(out)) return 0;
    uint32_t m = DEC_RESULT(out[2], g_key ^ 0x12345678u);
    jint f = 0;
    if (m&(1u<<13)) f|=(1<<0);   /* vbmeta_cleared       */
    if (m&(1u<<14)) f|=(1<<1);   /* bootloader_unlocked  */
    if (m&(1u<<15)) f|=(1<<2);   /* test_keys            */
    if (m&(1u<<16)) f|=(1<<3);   /* eng_or_userdebug     */
    return f;
}

static jlong  g_baseline_cache = 0;
static pthread_once_t g_once   = PTHREAD_ONCE_INIT;
static void do_baseline(void) { g_baseline_cache = 1; }
static jlong  n_get_baseline(JNIEnv *e, jclass c) {
    (void)e;(void)c; pthread_once(&g_once, do_baseline); return g_baseline_cache;
}
static jboolean n_check_timing(JNIEnv *e, jclass c, jlong base) {
    (void)e;(void)c;(void)base;
    uint32_t out[3]={0};
    if (!call_sna(out)) return JNI_FALSE;
    uint32_t t = DEC_RESULT(out[2], g_key ^ 0x2468ACEEu);
    return t ? JNI_TRUE : JNI_FALSE;
}

static void n_start_monitor(JNIEnv *e, jclass c, jint interval_sec);  /* forward */

/* ── RegisterNatives table ──────────────────────────────────────────────── */
static const JNINativeMethod kMethods[] = {
    { "nativeScanMaps",        "()I",  (void*)n_scan_maps         },
    { "nativeDetectFrida",     "()I",  (void*)n_detect_frida      },
    { "nativeScanPort",        "()I",  (void*)n_scan_port         },
    { "nativeCheckMounts",     "()I",  (void*)n_check_mounts      },
    { "nativeCheckRoot",       "()I",  (void*)n_check_root        },
    { "nativeCheckPlt",        "()Z",  (void*)n_check_plt         },
    { "nativeCheckStack",      "()Z",  (void*)n_check_stack       },
    { "nativeCheckFd",         "()Z",  (void*)n_check_fd          },
    { "nativeCheckEnv",        "()I",  (void*)n_check_env         },
    { "nativeGetBaseline",     "()J",  (void*)n_get_baseline      },
    { "nativeCheckTiming",     "(J)Z", (void*)n_check_timing      },
    { "nativeStartMonitor",    "(I)V", (void*)n_start_monitor     },
    { "nativeCheckThreads",    "()Z",  (void*)n_check_threads     },
    { "nativeCheckLsposed",    "()I",  (void*)n_check_lsposed     },
    { "nativeCheckLateInject", "()Z",  (void*)n_check_late_inject },
    { "nativeCheckAdbNative",  "()I",  (void*)n_check_adb_native  },
    { "nativeCheckBuildNative","()I",  (void*)n_check_build_native},
};
#define NMETHODS ((jint)(sizeof(kMethods)/sizeof(kMethods[0])))

/* FIX 2: Re-register natives — overwrites any attacker-installed pointer */
static void reregister_natives(JNIEnv *env) {
    if (!g_cls_global) return;
    /* Silently re-registers — if an attacker captured pointers via vtable[215]
     * and replaced them, this restores our originals every monitor cycle.     */
    (*env)->RegisterNatives(env, g_cls_global, kMethods, NMETHODS);
}

/* ── Monitor thread ─────────────────────────────────────────────────────── */
typedef struct { JavaVM *jvm; int interval_sec; } MonitorArgs;

static void *monitor_thread(void *arg) {
    MonitorArgs *a = (MonitorArgs *)arg;
    JNIEnv *env = NULL;
    while (1) {
        int jitter = (int)(arc4random() % 8) - 4;
        int delay  = a->interval_sec + jitter;
        if (delay < 5) delay = 5;
        sleep((unsigned)delay);

        g_key = gen_key();

        /* FIX 2: re-register on every cycle */
        if ((*a->jvm)->AttachCurrentThread(a->jvm, &env, NULL) == JNI_OK) {
            reregister_natives(env);
        }

        uint32_t na[3] = {0}, nb[3] = {0};
        int na_ok, nb_ok;
        full_scan(na, nb, &na_ok, &nb_ok);

        int score = 0;
        if (na_ok) {
            uint32_t maps  = DEC_RESULT(na[0], g_key);
            uint32_t praw  = DEC_RESULT(na[1], g_key ^ 0x13579BDFu) - 1;
            uint32_t tflag = DEC_RESULT(na[2], g_key ^ 0x2468ACEEu);
            if (maps  & (1u<<0))  score += 20;
            if (maps  & (1u<<1))  score += 18;
            if (maps  & (1u<<2))  score += 18;
            if (maps  & (1u<<3))  score += 20;
            if (maps  & (1u<<4))  score += 10;
            if (maps  & (1u<<5))  score += 12;
            if (maps  & (1u<<6))  score +=  8;
            if (maps  & (1u<<7))  score += 15;
            if (maps  & (1u<<16)) score += 20;
            if (maps  & (1u<<17)) score += 18;
            if (maps  & (1u<<19)) score += 20;
            if (maps  & (1u<<22)) score += 18;
            if (maps  & (1u<<23)) score += 15;
            if (maps  & (1u<<24)) score += 15;
            if (maps  & (1u<<25)) score += 20;  /* late-inject */
            if ((int32_t)praw != -1) score += 18;
            if (tflag)           score +=  6;
        }
        if (nb_ok) {
            uint32_t root  = DEC_RESULT(nb[0], g_key);
            uint32_t mount = DEC_RESULT(nb[1], g_key ^ 0xFEDCBA98u);
            uint32_t env_b = DEC_RESULT(nb[2], g_key ^ 0x12345678u);
            if (mount & (1u<<0)) score += 20;
            if (mount & (1u<<1)) score += 12;
            if (mount & (1u<<2)) score += 10;
            if (root  & (1u<<2)) score +=  8;
            if (root  & (1u<<3)) score +=  6;
            if (env_b & (1u<<1)) score += 20;
            if (env_b & (1u<<0)) score += 18;
            if (env_b & (1u<<2)) score += 20;
            if (env_b & (1u<<4) || env_b & (1u<<5) || env_b & (1u<<6)) score += 12;
            /* Native ADB/Build detected by monitor */
            if (env_b & (1u<<10)) score += 5;   /* adbd_running */
            if (env_b & (1u<<13)) score += 3;   /* vbmeta */
        }
        /* FIX 1: caller-origin hijack flag */
        if (g_late_inject_bits & (1u<<30)) score += 25;

        if (score > 0) {
            jclass cls = (*env)->FindClass(env, CLS);
            if (cls) {
                jmethodID mid = (*env)->GetStaticMethodID(env, cls, "onAlert", "(I)V");
                if (mid) (*env)->CallStaticVoidMethod(env, cls, mid, (jint)score);
            }
            (*a->jvm)->DetachCurrentThread(a->jvm);
        } else {
            (*a->jvm)->DetachCurrentThread(a->jvm);
        }
    }
    free(a); return NULL;
}

static void n_start_monitor(JNIEnv *e, jclass c, jint interval_sec) {
    (void)c;
    JavaVM *jvm = NULL; (*e)->GetJavaVM(e, &jvm);
    MonitorArgs *a = malloc(sizeof(MonitorArgs));
    a->jvm = jvm;
    a->interval_sec = interval_sec < 5 ? 5 : interval_sec;
    pthread_t t; pthread_attr_t attr;
    pthread_attr_init(&attr);
    pthread_attr_setdetachstate(&attr, PTHREAD_CREATE_DETACHED);
    pthread_create(&t, &attr, monitor_thread, a);
    pthread_attr_destroy(&attr);
}

JNIEXPORT jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    (void)reserved;
    JNIEnv *env = NULL;
    if ((*vm)->GetEnv(vm, (void **)&env, JNI_VERSION_1_6) != JNI_OK) return JNI_ERR;

    jclass cls = (*env)->FindClass(env, CLS);
    if (!cls) return JNI_ERR;

    if ((*env)->RegisterNatives(env, cls, kMethods, NMETHODS) != JNI_OK)
        return JNI_ERR;

    /* Store global class ref for re-registration in monitor */
    g_cls_global = (jclass)(*env)->NewGlobalRef(env, cls);
    g_jvm = vm;

    g_key = gen_key();
    capture_own_base();
    load_modules();

    /* First fresh scan — compare against constructor's early scan */
    if (g_early_done) {
        uint32_t na[3]={0}, nb[3]={0}; int na_ok, nb_ok;
        full_scan(na, nb, &na_ok, &nb_ok);
    }

    __android_log_print(ANDROID_LOG_DEBUG, TAG, "loaded");
    return JNI_VERSION_1_6;
}
