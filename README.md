# Frida-Toolkit - Complete Frida Scripts Collection

A comprehensive, well-organized collection of **637+ Frida scripts** for mobile security research, reverse engineering, and penetration testing. Organized by functionality with detailed documentation for each category.

**Repository**: [github.com/ishanoshada/Frida-Toolkit](https://github.com/ishanoshada/Frida-Toolkit)

<p align="center">
  <a href="https://www.paypal.com/donate/?business=ic31908%40gmail.com&currency_code=USD">
    <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" alt="Donate with PayPal" height="80">
  </a>
</p>

<p align="center">
  <a href="https://www.paypal.com/donate/?business=ic31908%40gmail.com&currency_code=USD">
    <img src="https://raw.githubusercontent.com/elestyle/elepay-payment-logos/master/payment_logos/svg/paypal.svg" alt="Donate with PayPal" height="100">
  </a>
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Master Unified Hooks File](#-master-unified-hooks-file-new)
- [Ultimate Frida Bypass Script](#-ultimate-frida-bypass-script-v43)
- [Category Directory](#-category-directory)
- [Native Anti-Tamper Library (cpp/)](#-native-anti-tamper-library-defensive-code--matching-bypasses)
- [Statistics](#statistics)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Key Features](#key-features)
- [Disclaimer](#disclaimer)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

This collection contains **637 Frida scripts** organized into **18 functional categories** for comprehensive mobile app security analysis. All scripts are cleaned, deduplicated, and organized by security bypass capability, hooking function, and platform (Android/iOS).

> **NEW**: See [**cpp/master-unified-hooks.js**](cpp/master-unified-hooks.js) — A production-ready aggregation combining **130+ scripts** into a single modular Frida instrumentation file with platform detection, configurable modules, and RPC exports.

### What is Frida?

[Frida](https://frida.re/) is a dynamic instrumentation toolkit that lets you inject snippets of JavaScript into black box processes. Perfect for:
- Reverse engineering mobile applications
- Security research and penetration testing
- Bypassing security mechanisms
- Analyzing app behavior at runtime
- Intercepting cryptographic operations

### Why This Collection?

- ✅ **637+ scripts** covering major security bypass techniques
- ✅ **18 organized categories** for easy navigation
- ✅ **Master unified hook file** combining 130+ scripts (see cpp/master-unified-hooks.js)
- ✅ **Deduplicated & cleaned** of author names/watermarks
- ✅ **Detailed documentation** for each category
- ✅ **Real usage examples** and workflows
- ✅ **Platform coverage**: Android, iOS, and platform-agnostic
- ✅ **Modular & configurable** — enable/disable hooks at runtime
- ✅ **Active maintenance** and updates

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Frida tools
pip install frida-tools

# Or on macOS with Homebrew
brew install frida
```

### Basic Usage

```bash
# List available devices
frida-ls-devices

# Run a script on Android device
frida -U -f com.example.app -l script.js --no-pause

# Run multiple scripts
frida -U -f com.example.app \
  -l script1.js \
  -l script2.js \
  --no-pause
```

### Find the Right Script

```bash
# SSL pinning bypass?
cd Bypass-SSL-Certificate-Pinning/

# Root detection bypass?
cd Bypass-Root-Jailbreak-Detection/

# Crypto interception?
cd Intercept-Crypto-Operations/
```

---

## ⚡ Master Unified Hooks File (NEW)

**[cpp/master-unified-hooks.js](cpp/master-unified-hooks.js)** \u2014 A single production-ready Frida instrumentation file combining **130+ scripts** into one modular, platform-aware hook suite.

### One File, All Capabilities

```bash
# Single command for comprehensive instrumentation
frida -U -f com.example.app -l cpp/master-unified-hooks.js --no-pause
```

### What's Included (1000+ lines)

| Module | Coverage | Status |
|--------|----------|--------|
| **Android Detection Bypasses** | ADB, Frida, Root, Environment, Timing, Build properties, LSPosed, Mount/Maps/FD scanning | ✅ |
| **Android Java Hooks** | Activities, SQLite, Intents, Location spoofing, Biometric bypass, Permissions | ✅ |
| **Native Hooks** | dlopen monitoring, Process execution, RegisterNatives/JNI, Syscall tracing | ✅ |
| **iOS Objective-C Hooks** | App info extraction, Biometric bypass, Location spoofing, URL schemes, NSUserDefaults | ✅ |

### Modular Configuration

Enable/disable modules at runtime:

```javascript
// Get current config
const status = rpc.exports.status();

// Update configuration
rpc.exports.setConfig({
    enableADBBypass: false,
    enableLocationHooks: true,
    enableFridaBypass: true
});
```

---

## � Ultimate Frida Bypass Script v4.3+

**[Ultimate Frida Bypass](https://github.com/Ishanoshada/Ultimate-Frida-Bypass)** — A comprehensive, production-ready Frida script providing **19 layers of protection bypass** for enterprise-grade security frameworks.

> **⚠️ IMPORTANT**: This script is for **educational and security research purposes only**. Use only on applications you own or have explicit permission to test.

### Features & Capabilities

Provides complete bypass for:
- **Talsec** — Advanced app security framework
- **freeRASP** — Mobile app protection platform
- **FreeRASP KMP** — Kotlin Multiplatform variant
- **Flutter Applications** — Flutter-based security protections
- **Similar Android Security Frameworks** — Generic protection mechanisms

### What's Included

| Layer | Protection | Status |
|-------|-----------|--------|
| **1-3** | Root/Jailbreak detection, Environment checks, Build property spoofing | ✅ |
| **4-6** | ADB detection, Debugger detection, Frida/gadget detection | ✅ |
| **7-9** | Process integrity, Memory inspection, Timing analysis bypass | ✅ |
| **10-12** | System call hooking, Library interception, JNI tampering detection | ✅ |
| **13-15** | SELinux bypass, Stack inspection, Caller-origin verification | ✅ |
| **16-19** | Thread analysis, Map scanning, File descriptor inspection, Late injection detection | ✅ |

### Quick Usage

```bash
# Direct execution
frida -U -f com.example.app -l https://github.com/Ishanoshada/Ultimate-Frida-Bypass/blob/main/main.js --no-pause

# Or download and run locally
wget https://raw.githubusercontent.com/Ishanoshada/Ultimate-Frida-Bypass/main/main.js
frida -U -f com.example.app -l main.js --no-pause
```

**Repository**: [github.com/Ishanoshada/Ultimate-Frida-Bypass](https://github.com/Ishanoshada/Ultimate-Frida-Bypass)

---

## �📁 Category Directory

Click any category to view detailed README with script listings and usage examples.

### Security Bypass (4 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Bypass-SSL-Certificate-Pinning](./Bypass-SSL-Certificate-Pinning/README.md)** | 140 | Bypass SSL/TLS certificate pinning mechanisms | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Bypass-SSL-Certificate-Pinning) |
| **[Bypass-Root-Jailbreak-Detection](./Bypass-Root-Jailbreak-Detection/README.md)** | 113 | Bypass root/jailbreak detection and integrity checks | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Bypass-Root-Jailbreak-Detection) |
| **[Bypass-Anti-Debug-Protections](./Bypass-Anti-Debug-Protections/README.md)** | 24 | Bypass debugger detection and anti-debug measures | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Bypass-Anti-Debug-Protections) |
| **[Bypass-Biometric-Authentication](./Bypass-Biometric-Authentication/README.md)** | 13 | Bypass fingerprint, face, and Touch ID authentication | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Bypass-Biometric-Authentication) |

### Instrumentation & Hooking (3 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Hook-Java-Methods](./Hook-Java-Methods/README.md)** | 97 | Generic Java method hooking and interception | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Hook-Java-Methods) |
| **[Hook-Native-Functions](./Hook-Native-Functions/README.md)** | 12 | Native C/C++ function hooking and JNI interception | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Hook-Native-Functions) |
| **[Dynamic-Loading](./Dynamic-Loading/README.md)** | 4 | Dynamic code loading and framework injection | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Dynamic-Loading) |

### Data Interception (2 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Intercept-Crypto-Operations](./Intercept-Crypto-Operations/README.md)** | 37 | Hook cryptographic operations (AES, RSA, SHA) | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Intercept-Crypto-Operations) |
| **[Intercept-Network-Traffic](./Intercept-Network-Traffic/README.md)** | 40 | Monitor and intercept HTTP/HTTPS traffic | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Intercept-Network-Traffic) |

### Discovery & Enumeration (2 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Enumerate-Classes-Methods](./Enumerate-Classes-Methods/README.md)** | 12 | Discover and list Java classes, methods, and structures | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Enumerate-Classes-Methods) |
| **[File-System-Access](./File-System-Access/README.md)** | 12 | Access and manipulate files, databases, and storage | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/File-System-Access) |

### Device & Platform-Specific (3 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Spoof-Device-Properties](./Spoof-Device-Properties/README.md)** | 6 | Spoof IMEI, Android ID, build info, and fingerprint | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Spoof-Device-Properties) |
| **[iOS-Specific-Hooks](./iOS-Specific-Hooks/README.md)** | 30 | iOS/Objective-C specific hooks and bypasses | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/iOS-Specific-Hooks) |
| **[Linux-Native-Tools](./Linux-Native-Tools/README.md)** | 3 | Linux/native system tools and hooks | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Linux-Native-Tools) |

### Specialized & Analysis (4 categories)

| Category | Scripts | Purpose | GitHub |
|----------|---------|---------|--------|
| **[Specialized-App-Bypasses](./Specialized-App-Bypasses/README.md)** | 72 | App-specific bypasses (WeChat, Douyin, Instagram, Banking) | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Specialized-App-Bypasses) |
| **[Memory-Operations](./Memory-Operations/README.md)** | 10 | Memory dumping, analysis, and manipulation | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Memory-Operations) |
| **[WebView-Manipulation](./WebView-Manipulation/README.md)** | 3 | WebView and JavaScript interface manipulation | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/WebView-Manipulation) |
| **[Testing-Templates](./Testing-Templates/README.md)** | 8 | CTF solutions (FridaLab, Uncrackable) and reference code | [GitHub](https://github.com/ishanoshada/Frida-Toolkit/tree/main/Testing-Templates) |

### 🛡️ Native Anti-Tamper Library (Defensive Code + Matching Bypasses)

The **[`cpp/`](./cpp/README.md)** directory contains a **native C/C++ Device Trust library** (the *defensive* counterpart to the 637 Frida bypass scripts above) plus a matching set of **Frida bypass scripts** that defeat each individual detection module. This is a realistic, production-style "anti-Frida" library that uses raw syscalls, XOR-encoded strings, decoy functions, and a JNI bridge with caller-origin checks.

| Native Detection File | What It Detects | Frida Bypass Script | Strategy |
|---|---|---|---|
| [`root_check.c`](./cpp/root_check.c) | su, Magisk, APatch, mountinfo, busybox, SELinux, system props | [`bypass_root_check.js`](./cpp/bypass_root_check.js) | Hook `openat` + `__system_property_get` + `strstr` |
| [`frida_detect.c`](./cpp/frida_detect.c) | TracerPid, zymbiote, gadget symbols, gadget TCP | [`bypass_frida_detect.js`](./cpp/bypass_frida_detect.js) | Hook `dlsym` (hide symbols) + `fopen` (deny /proc) |
| [`lsposed_check.c`](./cpp/lsposed_check.c) | lspd process, /data/adb/lspd, Shamiko, HMA, ZygiskNext | [`bypass_lsposed_check.js`](./cpp/bypass_lsposed_check.js) | Hook `openat` + `getdents64` |
| [`maps_scan.c`](./cpp/maps_scan.c) | frida-agent, libzygisk, xposed, anonymous rwxp | [`bypass_maps_scan.js`](./cpp/bypass_maps_scan.js) | Hook `openat` + `fgets` (scrub needles) |
| [`mount_check.c`](./cpp/mount_check.c) | conscrypt tmpfs, magisk tmpfs, /system rw | [`bypass_mount_check.js`](./cpp/bypass_mount_check.js) | Hook `openat` + `fgets` (drop Magisk lines) |
| [`env_check.c`](./cpp/env_check.c) | LD_PRELOAD, ptrace(TRACEME) | [`bypass_env_check.js`](./cpp/bypass_env_check.js) | Hook `getenv` + `ptrace` |
| [`fd_scan.c`](./cpp/fd_scan.c) | frida/jit-cache in /proc/self/fd symlinks | [`bypass_fd_scan.js`](./cpp/bypass_fd_scan.js) | Hook `openat` + `readlinkat` |
| [`plt_check.c`](./cpp/plt_check.c) | SSL_write/read/open hooked to non-system libs | [`bypass_plt_check.js`](./cpp/bypass_plt_check.js) | Hook `dlsym` + `dladdr` (forge system fname) |
| [`port_probe.c`](./cpp/port_probe.c) | Frida D-Bus on ports 27042, 27043, 4444, … | [`bypass_port_probe.js`](./cpp/bypass_port_probe.js) | Hook `connect` (ECONNREFUSED) + `recv` (scrub D-Bus) |
| [`thread_scan.c`](./cpp/thread_scan.c) | gmain, gum-js-loop, pool-frida, gdbus threads | [`bypass_thread_scan.js`](./cpp/bypass_thread_scan.js) | Hook `openat` + `fgets` (rename thread comm) |
| [`stack_check.c`](./cpp/stack_check.c) | Frida frames in current call stack | [`bypass_stack_check.js`](./cpp/bypass_stack_check.js) | Hook `dladdr` (forge libc path) |
| [`timing.c`](./cpp/timing.c) | syscall loop 8× slower than baseline | [`bypass_timing.js`](./cpp/bypass_timing.js) | Hook `getpid` + `syscall` (instant return) |
| [`adb_native.c`](./cpp/adb_native.c) | adbd running, adb_keys, TCP 5037 | [`bypass_adb_native.js`](./cpp/bypass_adb_native.js) | Hook `__system_property_get` + `openat` |
| [`build_native.c`](./cpp/build_native.c) | vbmeta, verifiedbootstate, test-keys, eng/userdebug | [`bypass_build_native.js`](./cpp/bypass_build_native.js) | Hook `__system_property_get` (return clean) |
| [`device_trust_native.cpp`](./cpp/device_trust_native.cpp) | RWX segments, frida modules, libc symbol, fd symlinks | [`bypass_device_trust_native.js`](./cpp/bypass_device_trust_native.js) | Hook `openat` + `fgets` + `readlinkat` + `dladdr` |
| [`snitchtt_jni.c`](./cpp/snitchtt_jni.c) + [`guard_entry.c`](./cpp/guard_entry.c) + [`hunter_entry.c`](./cpp/hunter_entry.c) | Composed: sna_e()/snb_e(), late-inject diff, caller-origin, validation hashes | [`bypass_snitchtt_jni.js`](./cpp/bypass_snitchtt_jni.js) (master) | Replace sna_e/snb_e + hook `dladdr` + `strstr` |

**Quick start (full bypass):**
```bash
frida -U -f com.target.app -l cpp/bypass_snitchtt_jni.js --no-pause
```

📖 See **[`cpp/README.md`](./cpp/README.md)** for the architecture diagram, full module reference, and per-script strategy details.

---

## 📊 Statistics

### By Category

| # | Category | Scripts | Focus | Platform |
|---|----------|---------|-------|----------|
| 1 | Bypass-SSL-Certificate-Pinning | 140 | Network encryption | Android, iOS |
| 2 | Bypass-Root-Jailbreak-Detection | 113 | Integrity checks | Android, iOS |
| 3 | Hook-Java-Methods | 97 | Java instrumentation | Android |
| 4 | Specialized-App-Bypasses | 72 | App-specific tricks | Android, iOS |
| 5 | Intercept-Network-Traffic | 40 | Network monitoring | Android, iOS |
| 6 | Intercept-Crypto-Operations | 37 | Crypto analysis | Android, iOS |
| 7 | iOS-Specific-Hooks | 30 | iOS/Objective-C | iOS |
| 8 | Bypass-Anti-Debug-Protections | 24 | Debugger detection | Android, iOS |
| 9 | Bypass-Biometric-Authentication | 13 | Authentication | Android, iOS |
| 10 | Enumerate-Classes-Methods | 12 | App analysis | Android |
| 11 | File-System-Access | 12 | Storage access | Android, iOS |
| 12 | Hook-Native-Functions | 12 | Native hooking | Android, iOS |
| 13 | Memory-Operations | 10 | Memory analysis | Android, iOS |
| 14 | Testing-Templates | 8 | Reference code | Android, iOS |
| 15 | Spoof-Device-Properties | 6 | Device spoofing | Android |
| 16 | Dynamic-Loading | 4 | Code loading | Android |
| 17 | WebView-Manipulation | 3 | WebView hooks | Android, iOS |
| 18 | Linux-Native-Tools | 3 | System tools | Linux, Android |
| | **TOTAL** | **637** | - | - |
| 19 | **[cpp/](./cpp/README.md) (Native + bypasses)** | **16 bypasses** | Anti-tamper (root, Frida, LSPosed, ADB, build) | Android |
| | **GRAND TOTAL** | **653** | - | - |

### Platform Coverage
- **Android**: 550+ scripts (+ 16 native bypasses)
- **iOS**: 120+ scripts
- **Cross-Platform**: 100+ scripts

### Security Domains
- Network Security: 180 scripts
- Cryptography: 75 scripts
- Integrity Verification: 150 scripts
- Authentication: 90 scripts
- Storage Access: 50 scripts

---

## 💻 Installation & Setup

### System Requirements

```
- Python 3.6+
- Frida tools (pip install frida-tools)
- Frida server (on target device)
- USB/Network connectivity to device
```

### Android Setup

```bash
# 1. Download Frida server for Android architecture
# For ARM64 (most common):
wget https://github.com/frida/frida/releases/download/14.2.10/frida-server-14.2.10-android-arm64.xz

# 2. Extract and push to device
xz -d frida-server-14.2.10-android-arm64.xz
adb push frida-server-14.2.10-android-arm64 /data/local/tmp/frida-server
adb shell chmod +x /data/local/tmp/frida-server

# 3. Run Frida server
adb shell /data/local/tmp/frida-server
```

### iOS Setup

```bash
# 1. Requires jailbroken device
# 2. Install Frida via Cydia/Sileo

# 3. Or manually:
# Download frida-server-14.2.10-ios-arm64.tar.gz
# Extract and place in /usr/local/bin/

# 4. Start Frida server
ssh root@device
/usr/local/bin/frida-server
```

### Clone Collection

```bash
# Clone the repository
git clone https://github.com/ishanoshada/Frida-Toolkit.git
cd Frida-Toolkit

# List folders
ls -la

# View specific category
cd Bypass-SSL-Certificate-Pinning/
ls -la
```

---

## 🛠️ Usage Guide

### Finding Scripts

#### By Security Goal

```bash
# Need to bypass SSL pinning?
ls Bypass-SSL-Certificate-Pinning/

# Need to bypass root detection?
ls Bypass-Root-Jailbreak-Detection/

# Need to intercept network traffic?
ls Intercept-Network-Traffic/

# Need to hook crypto operations?
ls Intercept-Crypto-Operations/
```

#### By App Type

```bash
# WeChat, TikTok, Instagram, Banking apps
ls Specialized-App-Bypasses/

# iOS apps
ls iOS-Specific-Hooks/

# Android Java apps
ls Hook-Java-Methods/
```

### Basic Usage Pattern

```bash
# Step 1: Identify your goal
# Step 2: Choose appropriate category
# Step 3: Select script
# Step 4: Run script

# Example: Intercept HTTPS traffic
cd Bypass-SSL-Certificate-Pinning/
frida -U -f com.example.app -l universal-ssl-pinning-bypass.js --no-pause
```

### Advanced Usage Examples

#### Example 1: Comprehensive SSL + Crypto Analysis

```bash
frida -U -f com.example.app \
  -l Bypass-SSL-Certificate-Pinning/universal-ssl-pinning-bypass.js \
  -l Intercept-Crypto-Operations/aes-crypto-universal.js \
  -l Intercept-Network-Traffic/okhttp3-interceptor.js \
  --no-pause | tee analysis.log
```

#### Example 2: Full Android App Bypass

```bash
frida -U -f com.example.app \
  -l Bypass-Root-Jailbreak-Detection/anti-root.js \
  -l Bypass-Anti-Debug-Protections/anti-debug-bypass.js \
  -l Bypass-SSL-Certificate-Pinning/universal-ssl-pinning-bypass.js \
  --no-pause
```

#### Example 3: Discovery + Analysis

```bash
# First, enumerate classes
frida -U -f com.example.app \
  -l Enumerate-Classes-Methods/dump_classes.js > classes.txt

# Analyze output
grep -i "auth\|crypto\|security" classes.txt

# Then hook discovered classes
frida -U -f com.example.app \
  -l Hook-Java-Methods/hook-method-of-class.js \
  --no-pause
```

#### Example 4: iOS Comprehensive Testing

```bash
frida -U -f com.example.app \
  -l iOS-Specific-Hooks/ios-jailbreak-detection-bypass.js \
  -l iOS-Specific-Hooks/ios-ssl-bypass.js \
  -l iOS-Specific-Hooks/ios-biometric-bypass.js \
  --no-pause
```

### Saving Output

```bash
# Save console output to file
frida -U -f com.example.app -l script.js --no-pause > output.log 2>&1

# Save with timestamps
frida -U -f com.example.app -l script.js --no-pause | \
  sed "s/^/$(date '+%Y-%m-%d %H:%M:%S') /" > timestamped.log
```

---

## 🎯 Key Features

### Comprehensive Coverage
- ✅ **18 functional categories** organized by security bypass type
- ✅ **637+ scripts** covering major security techniques
- ✅ **Android & iOS** support with platform-specific tools
- ✅ **Well-documented** each script with usage examples

### Easy Navigation
- ✅ **Category-based organization** for quick lookup
- ✅ **Detailed README** in each folder
- ✅ **Real-world examples** and workflows
- ✅ **Cross-category integration** guides

### High Quality
- ✅ **Deduplicated** - No redundant scripts
- ✅ **Cleaned** - Author names and watermarks removed
- ✅ **Categorized** - By filename AND content analysis
- ✅ **Tested** - Real-world validated techniques

### Documentation
- ✅ **Usage examples** for every category
- ✅ **Common target patterns** listed
- ✅ **Integration guides** between categories
- ✅ **Troubleshooting tips** for common issues

---

## 📚 Learning Path

### Beginner

1. **Start with Testing-Templates**
   - Learn Frida basics with FridaLab solutions
   - Understand script structure

2. **Move to Enumerate-Classes-Methods**
   - Discover app structure
   - Understand class hierarchy

3. **Try Hook-Java-Methods**
   - Basic method hooking
   - Modify return values

### Intermediate

1. **Bypass-Root-Jailbreak-Detection**
   - Learn device property manipulation
   - Understand detection patterns

2. **Intercept-Network-Traffic**
   - Monitor HTTP/HTTPS traffic
   - Understand request/response flow

3. **Intercept-Crypto-Operations**
   - Hook cryptographic operations
   - Analyze encryption/decryption

### Advanced

1. **Bypass-SSL-Certificate-Pinning**
   - Complex network security bypass
   - Multiple frameworks (OkHttp, Alamofire, etc.)

2. **Specialized-App-Bypasses**
   - App-specific protection mechanisms
   - Reverse engineering techniques

3. **Hook-Native-Functions**
   - Native code hooking
   - JNI interception

---

## 🔗 Related Resources

### Official Links

- **Frida Project**: [frida.re](https://frida.re/)
- **Frida GitHub**: [github.com/frida/frida](https://github.com/frida/frida)
- **Frida Documentation**: [frida.re/docs](https://frida.re/docs/)
- **Frida Codeshare**: [codeshare.frida.re](https://codeshare.frida.re/)

### Security Resources

- **OWASP Mobile**: [owasp.org/www-project-mobile-top-10](https://owasp.org/www-project-mobile-top-10/)
- **OWASP MSTG**: [github.com/OWASP/owasp-mstg](https://github.com/OWASP/owasp-mstg)
- **Android Security**: [developer.android.com/security](https://developer.android.com/security)
- **iOS Security**: [developer.apple.com/security](https://developer.apple.com/security)

### Learning Resources

- **Frida Tutorial**: [frida.re/docs/home](https://frida.re/docs/home/)
- **FridaLab**: Available on Google Play Store
- **Uncrackable Apps**: [github.com/OWASP/owasp-mstg/tree/master/Crackmes](https://github.com/OWASP/owasp-mstg/tree/master/Crackmes)
- **HackTricks**: [book.hacktricks.xyz](https://book.hacktricks.xyz)

---

## ⚠️ Disclaimer

### Educational Purpose Only

These scripts are provided **STRICTLY FOR**:
- ✅ Educational purposes
- ✅ Security research
- ✅ Authorized penetration testing
- ✅ Your own applications
- ✅ Legitimate cybersecurity training

### NOT For

- ❌ Unauthorized access to systems
- ❌ Malicious purposes or hacking
- ❌ Applications you don't own
- ❌ Without explicit permission from app owner
- ❌ Bypassing payment systems or DRM
- ❌ Stealing intellectual property
- ❌ Violating laws or regulations

### Legal Responsibility

**Users assume all legal responsibility** for their use of these scripts. Unauthorized access to computer systems is illegal in most jurisdictions, including:
- United States (Computer Fraud and Abuse Act)
- European Union (Computer Fraud Directive)
- Most other countries

**Always obtain written authorization** before testing any system you don't own.

---

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/ishanoshada/Frida-Toolkit.git
   cd Frida-Toolkit
   git checkout -b feature/your-feature
   ```

2. **Add or improve scripts**
   - Add new scripts to appropriate category
   - Ensure proper documentation
   - Remove author names/watermarks

3. **Update documentation**
   - Update category README if needed
   - Add usage examples
   - Document any new techniques

4. **Submit pull request**
   - Clear description of changes
   - Tested and working scripts
   - Proper formatting and documentation

### Contribution Guidelines

- Scripts should be well-commented
- Remove watermarks and author names
- Test scripts before submitting
- Document dependencies and requirements
- Follow existing code style and structure
- Include usage examples in comments

### Reporting Issues

Found a problem? Report it on GitHub:
- [github.com/ishanoshada/Frida-Toolkit/issues](https://github.com/ishanoshada/Frida-Toolkit/issues)

---

## 📝 License

This collection is provided for **educational and authorized security research purposes only**.

**License Type**: Educational Use License

### Terms

- ✅ Free to use for learning and authorized testing
- ✅ Can be modified for personal use
- ✅ Cannot be sold or commercialized
- ✅ Must retain attribution
- ✅ No warranty or liability

### Attribution

If you use scripts from this collection in your security research:

```
Frida-Toolkit
Repository: github.com/ishanoshada/Frida-Toolkit
License: Educational Use License
```

---

## 📧 Contact & Support

### Repository

- **GitHub**: [github.com/ishanoshada/Frida-Toolkit](https://github.com/ishanoshada/Frida-Toolkit)
- **Issues**: [github.com/ishanoshada/Frida-Toolkit/issues](https://github.com/ishanoshada/Frida-Toolkit/issues)

### Support Resources

- **Frida Documentation**: [frida.re/docs](https://frida.re/docs/)
- **Frida Community**: [frida.re](https://frida.re/)
- **GitHub Discussions**: [github.com/frida/frida/discussions](https://github.com/frida/frida/discussions)

---

## 📈 Statistics Summary

```
Total Scripts:           637
Total Categories:        18
Android Scripts:         550+
iOS Scripts:             120+
Cross-Platform:          100+
Average Scripts/Category: 35.4
Largest Category:        Bypass-SSL-Certificate-Pinning (140)
Most Common Domain:      Network Security (180 scripts)
Documented Categories:   18/18 (100%)
```

---

## 🎓 Quick Reference

### Bypass Security Checks
- SSL Certificate Pinning: `Bypass-SSL-Certificate-Pinning/`
- Root/Jailbreak Detection: `Bypass-Root-Jailbreak-Detection/`
- Biometric Authentication: `Bypass-Biometric-Authentication/`
- Debug Detection: `Bypass-Anti-Debug-Protections/`

### Analyze App Behavior
- Network Traffic: `Intercept-Network-Traffic/`
- Cryptographic Operations: `Intercept-Crypto-Operations/`
- Memory and Heap: `Memory-Operations/`
- File System: `File-System-Access/`

### Hook & Modify
- Java Methods: `Hook-Java-Methods/`
- Native Functions: `Hook-Native-Functions/`
- WebView Components: `WebView-Manipulation/`
- Dynamic Code: `Dynamic-Loading/`

### Platform-Specific
- iOS/Objective-C: `iOS-Specific-Hooks/`
- Linux/System: `Linux-Native-Tools/`
- Device Properties: `Spoof-Device-Properties/`
- Specific Apps: `Specialized-App-Bypasses/`

---

## 🔄 Version History

**Current Version**: 2.0 (Content-Based Reorganization)
- ✅ All 637 scripts analyzed and categorized
- ✅ 18 category READMEs with documentation
- ✅ Comprehensive main README with examples
- ✅ GitHub integration and links
- ✅ Learning paths and workflows

**Last Updated**: 2025

---

## 🙏 Acknowledgments

This collection aggregates security research and Frida scripts from the security community. Special thanks to:
- Frida team for the incredible dynamic instrumentation platform
- Security researchers who discovered these techniques
- OWASP for mobile security guidelines
- The ethical hacking community

---

**Made with ❤️ for the security research community**

### Start Exploring

Pick a category and dive in:

```bash
# View category list
ls -la

# Pick a category
cd Bypass-SSL-Certificate-Pinning/

# Read documentation
cat README.md

# Use a script
frida -U -f com.example.app -l universal-ssl-pinning-bypass.js --no-pause
```

**Happy reverse engineering! 🔍**

---

**Repository**: [github.com/ishanoshada/Frida-Toolkit](https://github.com/ishanoshada/Frida-Toolkit)
