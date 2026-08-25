/*
 * libsnb.so — Root / mount / PLT / env / LSPosed / ADB / Build detection.
 *
 * Exports exactly ONE symbol: snb_e
 * All internal functions are hidden.  Results XOR-encoded with runtime key.
 */
#include "obf_macros.h"
#include "root_check.h"
#include "mount_check.h"
#include "plt_check.h"
#include "env_check.h"
#include "lsposed_check.h"
#include "adb_native.h"
#include "build_native.h"
#include <stdint.h>

EMIT_DECOYS()

/*
 * snb_e — single exported entry point.
 * out[0] = encoded root bits
 * out[1] = encoded mount bits
 * out[2] = encoded env/PLT/LSPosed/ADB/Build bits
 *
 * env_bits layout:
 *   bit  0  = ld_preload_injected
 *   bit  1  = tracer_detected
 *   bit  2  = ssl_write/read hooked
 *   bit  3  = libc_open hooked
 *   bit  4  = lspd_process
 *   bit  5  = lspd_data_dir
 *   bit  6  = module_lsposed
 *   bit  7  = module_shamiko
 *   bit  8  = module_hma
 *   bit  9  = module_zgnxt
 *   bit 10  = adbd_running         (native — bypasses Java hook)
 *   bit 11  = adb_keys_exist       (native)
 *   bit 12  = adb_port_open        (native — TCP 5037)
 *   bit 13  = vbmeta_cleared       (native __system_property_get)
 *   bit 14  = bootloader_unlocked  (native)
 *   bit 15  = test_keys            (native)
 *   bit 16  = eng_or_userdebug     (native)
 */
__attribute__((visibility("default")))
uint32_t snb_e(uint32_t key, uint32_t *out, uint32_t outsz) {
    if (!out || outsz < 3) return 0;

    /* ── root ─────────────────────────────────────────────────────────── */
    RootCheckResult rc = root_check_native();
    uint32_t root_bits = 0;
    if (rc.su_binary)               root_bits |= (1u<<0);
    if (rc.busybox)                 root_bits |= (1u<<1);
    if (rc.selinux_permissive)      root_bits |= (1u<<2);
    if (rc.debuggable_prop)         root_bits |= (1u<<3);
    if (rc.insecure_prop)           root_bits |= (1u<<4);
    if (rc.eng_build)               root_bits |= (1u<<5);
    if (rc.magisk_data)             root_bits |= (1u<<6);
    if (rc.magisk_in_mountinfo)     root_bits |= (1u<<7);
    if (rc.apatch)                  root_bits |= (1u<<8);
    if (rc.magisk_unix_socket)      root_bits |= (1u<<9);
    if (rc.magisk_in_init_mountinfo) root_bits |= (1u<<10);

    /* ── mounts ───────────────────────────────────────────────────────── */
    MountCheckResult mc = mount_check();
    uint32_t mount_bits = 0;
    if (mc.conscrypt_tmpfs) mount_bits |= (1u<<0);
    if (mc.magisk_mount)    mount_bits |= (1u<<1);
    if (mc.system_rw)       mount_bits |= (1u<<2);

    /* ── env / PLT / LSPosed ──────────────────────────────────────────── */
    EnvCheckResult  ec = env_check();
    LsposedCheckResult lc = lsposed_check();
    AdbNativeResult    ac = adb_check_native();
    BuildNativeResult  bc = build_check_native();

    uint32_t env_bits = 0;
    if (ec.ld_preload_injected)   env_bits |= (1u<<0);
    if (ec.tracer_detected)       env_bits |= (1u<<1);
    if (is_ssl_write_hooked() || is_ssl_read_hooked()) env_bits |= (1u<<2);
    if (is_libc_open_hooked())    env_bits |= (1u<<3);
    if (lc.lspd_process)          env_bits |= (1u<<4);
    if (lc.lspd_data_dir)         env_bits |= (1u<<5);
    if (lc.module_lsposed)        env_bits |= (1u<<6);
    if (lc.module_shamiko)        env_bits |= (1u<<7);
    if (lc.module_hma)            env_bits |= (1u<<8);
    if (lc.module_zgnxt)          env_bits |= (1u<<9);
    /* Native ADB — bypasses Settings.Secure Java hook */
    if (ac.adbd_running)          env_bits |= (1u<<10);
    if (ac.adb_keys_exist)        env_bits |= (1u<<11);
    if (ac.adb_port_open)         env_bits |= (1u<<12);
    /* Native build props — bypasses android.os.Build Java hook */
    if (bc.vbmeta_cleared)        env_bits |= (1u<<13);
    if (bc.bootloader_unlocked)   env_bits |= (1u<<14);
    if (bc.test_keys)             env_bits |= (1u<<15);
    if (bc.eng_or_userdebug)      env_bits |= (1u<<16);

    if (OP_FALSE(root_bits)) root_bits ^= 0xffffffff;

    out[0] = ENC_RESULT(root_bits,  key);
    out[1] = ENC_RESULT(mount_bits, key ^ 0xFEDCBA98u);
    out[2] = ENC_RESULT(env_bits,   key ^ 0x12345678u);

    uint32_t h = key ^ out[0] ^ out[1] ^ out[2] ^ 0xDEADFA11u;
    h = ((h << 17) | (h >> 15)) ^ (h * 0x9e3779b9u);
    return h;
}
