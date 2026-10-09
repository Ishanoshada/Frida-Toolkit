# cpp/ — Native Anti-Tamper Library & Bypass Scripts

This directory contains a **native C/C++ anti-tamper / anti-Frida library** (the *defensive* counterpart to the 637 Frida bypass scripts in the parent project) along with a matching set of **Frida bypass scripts** that defeat each individual detection module.

## 🎯 Master Unified Hooks (NEW)

**[master-unified-hooks.js](./master-unified-hooks.js)** — A comprehensive aggregation of all individual bypass scripts into a single, modular, production-ready Frida instrumentation file.

### Features:
- **16 Android Detection Bypasses** (ADB, Frida, Root, Environment, Timing, Build properties, etc.)
- **6 Android Java/Application Hooks** (Activities, SQLite, Intents, Location, Biometrics)
- **4 Native-Level Hooks** (dlopen, Process execution, RegisterNatives, Syscall tracing)
- **5 iOS Objective-C Hooks** (App info, Biometrics, Location, URL schemes, Preferences)
- **Modular Configuration**: Enable/disable each module independently
- **Platform Detection**: Automatically detects Android (Java) vs iOS (ObjC)
- **Comprehensive Logging**: Verbose logging with DEBUG mode support
- **RPC Exports**: Query/modify configuration at runtime

### Quick Start:
```bash
# Run on Android
frida -U -f com.example.app -l cpp/master-unified-hooks.js --no-pause

# Run on iOS
frida -U -f com.example.app -l cpp/master-unified-hooks.js --no-pause

# Configure at runtime
rpc.exports.setConfig({enableADBBypass: false, enableLocationHooks: true})
rpc.exports.status()  # Get current status
```

### Architecture:
```
master-unified-hooks.js
├── Android Detection Bypasses (AndroidBypassModule)
│   ├── ADB, Frida, Root, Environment, Timing, Build properties
│   └── ~500 lines of native-level Frida interceptors
├── Android Java Hooks (AndroidJavaModule)
│   ├── Activities, SQLite, Intents, Location, Biometrics
│   └── ~400 lines of Java/Kotlin interception
├── Native Hooks (NativeModule)
│   ├── dlopen, Process execution, RegisterNatives, Syscalls
│   └── ~200 lines of native instrumentation
└── iOS Objective-C Hooks (IOSModule)
    ├── App info, Biometrics, Location, URL schemes, Preferences
    └── ~250 lines of ObjC hooking
```

**Total**: 1000+ lines of unified, production-ready instrumentation code combining functionality from **130+ individual bypass scripts** and **hook scripts** across this entire repository.

---

The native code models a realistic "Device Trust" library similar to those embedded in modern banking, payments, and DRM-protected Android apps. It detects:

- **Root / Magisk / APatch** (binary, magisk daemon, mountinfo, busybox, SELinux)
- **Frida** (TracerPid, frida-agent, frida-helper, gadget symbols, gum-js, zymbiote)
- **LSPosed / Shamiko / HMA / ZygiskNext** (process, data dirs, modules)
- **Hook frameworks** (Dobby, shadowhook, Whale) and anonymous RWX regions
- **ADB** (adbd service, adb_keys, port 5037)
- **Build state** (vbmeta, verifiedbootstate, test-keys, eng/userdebug)
- **Late injection** (comparison of early vs fresh detection snapshots)
- **Caller-origin tampering** (RegisterNatives vtable capture via dladdr)
- **Timing anomalies** (syscall hooking slows syscalls 10–100×)

## 📋 Table of Contents

- [Architecture](#architecture)
- [Detection ↔ Bypass Mapping](#detection--bypass-mapping)
- [Quick Start](#quick-start)
- [Module Reference](#module-reference)
- [Limitations](#limitations)
- [Disclaimer](#disclaimer)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Android App                          │
│  ┌────────────────┐  JNI  ┌──────────────────────────┐  │
│  │ Java / Kotlin  │◄──────│  libsnitchtt.so          │  │
│  └────────────────┘       │  (snitchtt_jni.c)        │  │
│                            │  • caller-origin check   │  │
│                            │  • early vs late compare │  │
│                            │  • re-register natives   │  │
│                            └─────────┬────────────────┘  │
│                                      │ dlopen()           │
│              ┌───────────────────────┴──────────────┐    │
│              ▼                                       ▼    │
│  ┌────────────────────┐                  ┌────────────────┐│
│  │  libsnb.so         │                  │  libsna.so     ││
│  │  (guard_entry.c)   │                  │  (hunter_      ││
│  │                    │                  │   entry.c)     ││
│  │  • root_check      │                  │  • maps_scan   ││
│  │  • mount_check     │                  │  • frida_      ││
│  │  • env_check       │                  │    detect      ││
│  │  • plt_check       │                  │  • port_probe  ││
│  │  • lsposed_check   │                  │  • fd_scan     ││
│  │  • adb_native      │                  │  • thread_scan ││
│  │  • build_native    │                  │  • stack_check ││
│  │  Entry: snb_e()    │                  │  • timing      ││
│  └────────────────────┘                  │  Entry: sna_e()││
│                                          └────────────────┘│
│  Direct syscalls via syscall_utils.h (bypasses libc hooks) │
│  XOR-encoded strings via str_enc.h (defeats `strings`)    │
│  Decoy functions + opaque predicates (obf_macros.h)        │
└──────────────────────────────────────────────────────────┘
```

**Key design choices in the native code:**
- All file/IO goes through raw `syscall(__NR_*)` (see `syscall_utils.h`) so that Frida's libc hooks don't intercept it.
- All string literals are XOR-encoded with `0x42` (`str_enc.h`) so `strings(1)` can't find them.
- 30 decoy functions per translation unit (`obf_macros.h`) confuse static analysis.
- `sna_e()` and `snb_e()` are the only exported symbols; their outputs are XOR-encoded with a runtime key derived from `JNI_OnLoad` and `getpid()`.
- The JNI bridge does a "caller-origin check" by dladdr'ing the immediate return address — if the caller isn't in `/system/` or `/apex/`, the code marks it as suspicious (i.e. someone replaced a JNI pointer via `RegisterNatives`).

---

## Detection ↔ Bypass Mapping

Each `.c` / `.cpp` file in this directory has a matching `bypass_*.js` script that defeats it. Load the relevant bypass script (or the master `bypass_snitchtt_jni.js` for full coverage) with Frida.

| # | Native Detection File | Detection Target | Frida Bypass Script | Strategy |
|---|---|---|---|---|
| 1 | `root_check.c` + `root_check.h` | su binary, `/data/adb/{magisk,modules,lspd,apatch}`, mountinfo `magisk`/`/debug_ramdisk`, busybox, SELinux permissive, init.mountinfo, `@magisk_daemon` unix socket, `ro.debuggable`/`ro.secure`/`ro.build.type` props | [`bypass_root_check.js`](./bypass_root_check.js) | Hook `openat` (deny paths) + `__system_property_get` (force clean) + `strstr` (mask needles) + `getenv` (clear LD_PRELOAD) + `ptrace` (force success) |
| 2 | `frida_detect.c` + `frida_detect.h` | `TracerPid > 0`, zymbiote socket, gadget TCP listener, gadget/gum symbols, LSPosed socket | [`bypass_frida_detect.js`](./bypass_frida_detect.js) | Hook `dlsym` (return NULL for gadget symbols) + `fopen` (deny `/proc/self/status`) + `openat` (deny `/proc/*`) + `recv` (scrub D-Bus greeting) |
| 3 | `lsposed_check.c` + `lsposed_check.h` | lspd process in `/proc`, `/data/adb/lspd/`, modules under `/data/adb/modules/` (lsposed, shamiko, hidemyapplist, zygisknext) | [`bypass_lsposed_check.js`](./bypass_lsposed_check.js) | Hook `openat` (deny lsposed paths) + `getdents64` (drop lspd entries from `/proc` enumeration) |
| 4 | `maps_scan.c` + `maps_scan.h` | `frida-agent-*.so`, `frida-helper`, `frida-zymbiote`, `libzygisk.so`, xposed/lsposed, frida-gadget, dobby/shadowhook/whale, deleted data map, `/memfd:jit-cache` rwxp > 8 MB, anonymous rwxp | [`bypass_maps_scan.js`](./bypass_maps_scan.js) | Hook `openat` (deny `/proc/self/maps`) + `fgets` (drop lines with suspicious needles) + `read` (sanitize content) |
| 5 | `mount_check.c` + `mount_check.h` | conscrypt tmpfs, magisk tmpfs, `/debug_ramdisk` tmpfs, `/sbin` tmpfs, `/system` mounted rw | [`bypass_mount_check.js`](./bypass_mount_check.js) | Hook `openat` (deny `/proc/self/mounts`) + `fgets`/`read` (scrub Magisk and `/system rw` lines) |
| 6 | `env_check.c` + `env_check.h` | `LD_PRELOAD` set, `LD_LIBRARY_PATH` → `/data/local`, `ptrace(TRACEME)` returns `EPERM` | [`bypass_env_check.js`](./bypass_env_check.js) | Hook `getenv` (return NULL for LD_PRELOAD) + `ptrace` (force success) |
| 7 | `fd_scan.c` + `fd_scan.h` | `/proc/self/fd/<n>` symlink target contains `frida` or `jit-cache` | [`bypass_fd_scan.js`](./bypass_fd_scan.js) | Hook `openat` (deny `/proc/self/fd`) + `readlinkat` (return `/dev/null` for suspicious targets) |
| 8 | `plt_check.c` + `plt_check.h` | `SSL_write`/`SSL_read` not in `libssl.so`, `open` not in `libc.so` | [`bypass_plt_check.js`](./bypass_plt_check.js) | Hook `dlsym` (resolve to real libssl/libc export) + `dladdr` (forge system fname) |
| 9 | `port_probe.c` + `port_probe.h` | D-Bus greeting on known ports (27042, 27043, 4444, 1234, 8888, 9999, 1337, 7777, 31415, 8080, 8443, 11111, 5555, 6666, 2222, 54321, 12345) | [`bypass_port_probe.js`](./bypass_port_probe.js) | Hook `connect` (return `ECONNREFUSED` on Frida ports) + `recv` (zero the D-Bus signature bytes) |
| 10 | `thread_scan.c` + `thread_scan.h` | Threads named `gmain`, `gum-js-loop`, `pool-frida`, `gdbus` in `/proc/self/task/<tid>/comm` | [`bypass_thread_scan.js`](./bypass_thread_scan.js) | Hook `openat` (deny `/proc/self/task`) + `fgets` (rename thread comm to "main") |
| 11 | `stack_check.c` + `stack_check.h` | Stack frames whose dladdr fname contains `frida`/`gadget`/`gdbus`/`/data/local/tmp` or anonymous frames | [`bypass_stack_check.js`](./bypass_stack_check.js) | Hook `dladdr` (forge fname to `/system/lib64/libc.so` for suspicious addresses) |
| 12 | `timing.c` + `timing.h` | 10000× `syscall(__NR_getpid)` is > 8× baseline | [`bypass_timing.js`](./bypass_timing.js) | Hook `getpid` + `syscall` (return `Process.id` instantly from a known function) |
| 13 | `adb_native.c` + `adb_native.h` | `init.svc.adbd = "running"`, `/data/misc/adb/adb_keys` exists, TCP 5037 listener in `/proc/net/tcp6` | [`bypass_adb_native.js`](./bypass_adb_native.js) | Hook `__system_property_get` (return `stopped`) + `openat` (deny adb_keys & tcp6) + `read` (scrub `:13BD` lines) |
| 14 | `build_native.c` + `build_native.h` | `ro.boot.vbmeta.digest` empty, `ro.boot.verifiedbootstate` orange/yellow, `ro.build.tags` contains `test-keys`, `ro.build.type` is eng/userdebug | [`bypass_build_native.js`](./bypass_build_native.js) | Hook `__system_property_get` to return clean values for the four build props |
| 15 | `device_trust_native.cpp` | RWX segments in `/proc/self/maps`, frida/gum/gadget in maps, frida in `/proc/self/fd` symlinks, libc `getpid` resolving outside `/system/lib` or `/apex/` | [`bypass_device_trust_native.js`](./bypass_device_trust_native.js) | Hook `openat` (deny `/proc/self/maps` and `/proc/self/fd`) + `fgets`/`readlinkat` (scrub needles) + `dladdr` (forge libc path) |
| 16 | `snitchtt_jni.c`, `guard_entry.c` (libsnb.so), `hunter_entry.c` (libsna.so) | Composed: `sna_e()` (Frida/timing), `snb_e()` (root/env/build), late-inject diff, caller-origin in `/system/`/`/apex/`, validation hashes (`0xC0FFEE42`, `0xDEADFA11`) | [`bypass_snitchtt_jni.js`](./bypass_snitchtt_jni.js) | Replace `sna_e`/`snb_e` to return zeroed outputs + hook `dladdr` (caller always looks like libart.so) + hook `strstr` (mask needles) |

---

## Quick Start

### Build the native Android libraries

The CMake project builds `libsna.so`, `libsnb.so`, `libsnitchtt.so`, and
`libdevice_trust_native.so` for the selected Android ABI. Install the Android
NDK, CMake, and Ninja (the Android SDK's CMake package includes Ninja), then
set `ANDROID_NDK_HOME` to the installed NDK directory. For example, from the
repository root in PowerShell:

```powershell
$env:ANDROID_NDK_HOME = "C:\Users\you\AppData\Local\Android\Sdk\ndk\<version>"
cmake -S .\cpp -B .\cpp\build -G Ninja `
  -DCMAKE_TOOLCHAIN_FILE="$env:ANDROID_NDK_HOME\build\cmake\android.toolchain.cmake" `
  -DANDROID_ABI=arm64-v8a `
  -DANDROID_PLATFORM=android-23
cmake --build .\cpp\build --config Release
```

Choose another `ANDROID_ABI` (for example, `armeabi-v7a` or `x86_64`) and a
separate build directory to produce libraries for another architecture. The
three `sna`, `snb`, and `snitchtt` libraries form the detection/JNI set;
`device_trust_native` is the separate C++ JNI example.

### 1. Pick the bypass script you need

If you're targeting **all detections** at once (the realistic case for a Device Trust library), use the master script:

```bash
frida -U -f com.target.app -l cpp/bypass_snitchtt_jni.js --no-pause
```

For **single-module** bypasses, the `bypass_*.js` scripts are independent and can be loaded individually:

```bash
# Just bypass root check
frida -U -f com.target.app -l cpp/bypass_root_check.js --no-pause

# Bypass Frida + ADB + build props
frida -U -f com.target.app \
  -l cpp/bypass_frida_detect.js \
  -l cpp/bypass_adb_native.js \
  -l cpp/bypass_build_native.js \
  --no-pause
```

### 2. Spawn mode vs attach

For **fully-fledged app spawn**:
```bash
frida -U -f com.target.app --no-pause -l cpp/bypass_snitchtt_jni.js
```

For **attach to running process** (some early `__attribute__((constructor))` checks may already have run):
```bash
frida -U com.target.app -l cpp/bypass_snitchtt_jni.js
```

If you attach late and the constructor already populated `g_early_*`, the bypass still works because the JNI methods read fresh values on every call.

### 3. Verify

Watch the Frida console — most scripts print a confirmation like:
```
[bypass_root_check] Bypass active. Root detection should return false.
```

You can also test from the app side by triggering the Java method that calls into the native bridge (e.g. tap a "Device Trust" button) and confirming the result is "trusted".

---

## Module Reference

### Header / utility files (no detection, no bypass needed)

| File | Purpose |
|---|---|
| `syscall_utils.h` | Inline wrappers around `syscall(__NR_*)` for `open`, `read`, `close`, `socket`, `connect`, `send`, `recv`, `setsockopt`, `readlinkat`, `getdents64`. Bypasses libc/Frida hooks. |
| `str_enc.h` | XOR-encoded strings + `sd()` decoder. Defeats naive `strings(1)` scanning. |
| `obf_macros.h` | Opaque predicates (`OP_TRUE` / `OP_FALSE`), result encoding (`ENC_RESULT` / `DEC_RESULT`), 30 decoy functions per TU via `EMIT_DECOYS()`. |

### Root / mount / environment detection modules (compiled into `libsnb.so`)

| File | JNI / Entry | Result Bits |
|---|---|---|
| `root_check.c` | `root_check_native()` | su binary, magisk data, mountinfo, busybox, selinux_permissive, debuggable_prop, insecure_prop, eng_build, apatch, magisk_unix_socket, magisk_in_init_mountinfo |
| `mount_check.c` | `mount_check()` | conscrypt_tmpfs, magisk_mount, system_rw |
| `env_check.c` | `env_check()` | ld_preload_injected, tracer_detected |
| `plt_check.c` | `is_ssl_write_hooked()` etc. | SSL_write/read/open hooked (boolean) |
| `lsposed_check.c` | `lsposed_check()` | lspd_process, lspd_data_dir, module_lsposed, module_shamiko, module_hma, module_zgnxt |
| `adb_native.c` | `adb_check_native()` | adbd_running, adb_keys_exist, adb_port_open |
| `build_native.c` | `build_check_native()` | vbmeta_cleared, bootloader_unlocked, test_keys, eng_or_userdebug |
| `guard_entry.c` | `snb_e(key, out, 3)` | Aggregates all libsnb.so checks, XOR-encodes with `0xDEADFA11` validation hash |

### Frida / timing / process detection modules (compiled into `libsna.so`)

| File | JNI / Entry | Result Bits |
|---|---|---|
| `maps_scan.c` | `maps_scan()` | frida_agent, frida_helper, frida_raw_agent, frida_zymbiote, frida_gadget, frida_memfd, deleted_data_map, zygisk_active, xposed_mapped, hook_framework, anon_rwx |
| `frida_detect.c` | `frida_detect()` | tracer_pid, zymbiote_socket, gadget_tcp_listener, gadget_symbol_found, gum_symbol_found, lsposed_socket |
| `port_probe.c` | `probe_frida_port()`, `scan_frida_ports()` | Open port (int) or -1 |
| `fd_scan.c` | `fd_has_frida_memfd()` | Boolean — frida in `/proc/self/fd` symlinks |
| `thread_scan.c` | `has_frida_threads()` | Boolean — gmain / gum-js-loop / pool-frida / gdbus threads |
| `stack_check.c` | `stack_has_frida_frame()` | Boolean — Frida frame in current call stack |
| `timing.c` | `timing_baseline()`, `timing_anomaly()` | Boolean — syscall loop took > 8× baseline |
| `hunter_entry.c` | `sna_e(key, out, 3)` | Aggregates all libsna.so checks, XOR-encodes with `0xC0FFEE42` validation hash |

### JNI bridge (compiled into `libsnitchtt.so`)

| File | Purpose |
|---|---|
| `snitchtt_jni.c` | Loads libsna/libsnb in a `__attribute__((constructor))` for early scanning; implements JNI methods like `n_scan_maps`, `n_detect_frida`, `n_scan_port`, `n_check_mounts`, `n_check_root`, `n_check_plt`, `n_check_stack`, `n_check_fd`, `n_check_env`, `n_check_threads`, `n_check_lsposed`, `n_check_late_inject`, `n_check_adb_native`, `n_check_build_native`, `n_get_baseline`, `n_check_timing`. Includes caller-origin check via dladdr of `__builtin_return_address(0)`. |

---

## Limitations

These bypasses are designed to defeat the **specific implementation** in this `cpp/` folder. Real production Device Trust libraries often add additional defenses:

- **Kernel-level detection** (e.g. Magisk's `resetprop` flushing, kernel module hiding) — out of scope; Frida cannot bypass without root.
- **Hardware attestation** (Play Integrity, Key Attestation, StrongBox) — requires server-side validation; bypass scripts cannot defeat these.
- **Encrypted DEX / packers** (DexGuard, DexProtector, Bangcle) — orthogonal to this library; handled in other Frida scripts.
- **Native code protection** (obfuscated LLVM, control-flow flattening, anti-tamper with embedded public keys) — the native code here is intentionally readable to mirror a real-world example; in practice, look for the *symbols* and the *strings* (which are the most useful hooks).
- **Memory integrity / RASP** — the early-vs-fresh comparison in `snitchtt_jni.c` is a real defense against late injection; the master `bypass_snitchtt_jni.js` patches `sna_e`/`snb_e` to return zeros, which neutralizes the comparison.

The bypasses also rely on **Frida being able to hook libc exports**. If the target app uses `seccomp`, `SECCOMP_RET_TRACE`, or `prctl(PR_SET_NO_NEW_PRIVS)`, Frida may not be able to spawn at all — that's a different class of problem and is outside this folder's scope.

---

## Disclaimer

These scripts are provided for **educational and authorized security research only**. Use them only on:

- ✅ Applications you own
- ✅ Applications you have explicit written authorization to test
- ✅ Authorized penetration testing engagements
- ✅ Legitimate reverse-engineering / security research

Do not use to bypass DRM, payment systems, or any controls you don't have permission to disable.

---

**Parent project**: [Frida-Toolkit](https://github.com/ishanoshada/Frida-Toolkit) — 637+ Frida scripts organized in 18 categories.
