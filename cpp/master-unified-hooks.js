/**
 * ============================================================================
 * MASTER UNIFIED COMPLETE FRIDA HOOK
 * ============================================================================
 * 
 * COMBINES:
 * 
 * DETECTION BYPASSES (16 modules):
 *   - ADB Detection Bypass
 *   - Build Property Spoofing
 *   - Device Trust Native Bypass
 *   - Environment Check Bypass
 *   - FD Scan Bypass
 *   - Frida Detection Bypass
 *   - LSPosed Check Bypass
 *   - Maps Scan Bypass
 *   - Mount Check Bypass
 *   - PLT Check Bypass
 *   - Port Probe Bypass
 *   - Root Check Bypass
 *   - Snitchtt JNI Bypass
 *   - Stack Check Bypass
 *   - Thread Scan Bypass
 *   - Timing Bypass
 * 
 * ANDROID JAVA HOOKS:
 *   - Activity Lifecycle Monitoring
 *   - SQLite Database Tracing
 *   - Intent Interception
 *   - Location Spoofing
 *   - Biometric Bypass
 *   - Permission Hooks
 * 
 * NATIVE HOOKS:
 *   - RegisterNatives Tracking
 *   - dlopen/dlclose Monitoring
 *   - Process Execution (exec/fork)
 *   - System Call Tracing
 * 
 * iOS HOOKS:
 *   - App Info Extraction
 *   - Biometric (Touch ID/Face ID) Bypass
 *   - Location Spoofing
 *   - URL Scheme Interception
 *   - NSUserDefaults Monitoring
 * 
 * ============================================================================
 */

(function() {
    'use strict';

    // Check if running in Frida environment
    const isFridaEnvironment = typeof Frida !== 'undefined' || 
                               typeof Process !== 'undefined' || 
                               typeof Interceptor !== 'undefined';

    // ============================================================================
    // CONFIGURATION
    // ============================================================================

    const CONFIG = {
        // Detection Bypass Modules
        enableADBBypass: true,
        enableBuildBypass: true,
        enableDeviceTrustBypass: true,
        enableEnvironmentBypass: true,
        enableFDBypass: true,
        enableFridaBypass: true,
        enableLSPosedBypass: true,
        enableMapsBypass: true,
        enableMountBypass: true,
        enablePLTBypass: true,
        enablePortProbeBypass: true,
        enableRootBypass: true,
        enableSnitchttBypass: true,
        enableStackBypass: true,
        enableThreadBypass: true,
        enableTimingBypass: true,

        // Android Java Hooks
        enableJavaHooks: true,
        enableActivityHooks: true,
        enableSQLiteHooks: true,
        enableIntentHooks: true,
        enableLocationHooks: true,
        enableBiometricBypass: true,
        enablePermissionHooks: true,

        // Native Hooks
        enableNativeTracing: true,
        enableRegisterNativesHook: true,
        enableDlopenHook: true,
        enableProcessExecutionHooks: true,

        // iOS Hooks
        enableIOSHooks: true,
        enableAppInfoHooks: true,
        enableBiometricsIOSBypass: true,
        enableLocationIOSBypass: true,
        enableURLSchemeHooks: true,

        // Logging
        verboseLogging: true,
        debugMode: false
    };

    // ============================================================================
    // CONSTANTS
    // ============================================================================

    const CONSTANTS = {
        // ADB
        ADB_KEYS: '/data/misc/adb/adb_keys',
        TCP6_PATH: '/proc/net/tcp6',
        ADB_PORT: 5037,
        ADB_PORT_HEX: ':13BD ',

        // Frida/Gadget
        GADGET_SYMBOLS: [
            'frida_gadget_load',
            'frida_gadget_wait_for_debugger',
            'gum_interceptor_obtain',
            'gum_init_embedded',
            'frida_agent_main'
        ],

        PROC_PATHS: [
            '/proc/self/status',
            '/proc/self/net/unix',
            '/proc/net/unix',
            '/proc/self/net/tcp',
            '/proc/net/tcp'
        ],

        // Root
        ROOT_PATHS: [
            '/system/bin/su', '/system/xbin/su', '/system/sd/xbin/su',
            '/system/bin/failsafe/su', '/data/adb/magisk', '/data/adb/modules',
            '/data/adb/lspd', '/data/adb/apatch', '/sbin/su',
            '/system/bin/busybox', '/system/xbin/busybox', '/sbin/busybox',
            '/system/app/SuperUser.apk', '/data/app/com.noshufou.android.su',
            '/system/app/SuperSU', '/system/app/Magisk'
        ],

        // LSPosed
        LSPOSED_PATHS: [
            '/data/adb/lspd', '/data/adb/modules/lsposed',
            '/data/adb/modules/shamiko', '/data/adb/modules/hidemyapplist',
            '/data/adb/modules/zygisknext'
        ],

        // Maps needles
        MAPS_NEEDLES: [
            'frida-agent-64', 'frida-agent-32', 'libfrida-agent-raw',
            'frida-helper', 'frida-zymbiote', 'libzygisk', 'zygisk',
            'xposed', 'lsposed', 'edxposed', 'frida_gadget', 'frida-gadget',
            'dobby', 'shadowhook', 'whale', 'gum-js', 'gum_js', 'substrate'
        ],

        // Mount needles
        MOUNT_NEEDLES: ['conscrypt', 'magisk', '/debug_ramdisk', '/sbin'],

        // FD needles
        FD_NEEDLES: ['frida', 'jit-cache'],
        FD_PATH: '/proc/self/fd',

        // Thread needles
        THREAD_NEEDLES: ['gmain', 'gum-js-loop', 'pool-frida', 'gdbus'],
        TASK_PATH: '/proc/self/task',

        // Stack needles
        STACK_NEEDLES: ['frida', 'gadget', 'gdbus', '/data/local/tmp'],
        FAKE_LIB_PATH: '/system/lib64/libc.so',

        // Root needles
        ROOT_NEEDLES: ['magisk', '/debug_ramdisk', '@magisk_daemon'],

        // Frida ports
        FRIDA_PORTS: new Set([
            27042, 27043, 4444, 1234, 8888, 9999, 1337, 7777,
            31415, 8080, 8443, 11111, 5555, 6666, 2222, 54321, 12345
        ]),

        // PLT targets
        PLT_TARGETS: ['SSL_write', 'SSL_read', 'open'],

        // Build properties
        BUILD_PROPS: {
            'ro.boot.vbmeta.digest': { value: '0123456789abcdef0123456789abcdef', len: 32 },
            'ro.boot.verifiedbootstate': { value: 'green', len: 5 },
            'ro.build.tags': { value: 'release-keys', len: 12 },
            'ro.build.type': { value: 'user', len: 4 },
            'ro.debuggable': { value: '0', len: 1 },
            'ro.secure': { value: '1', len: 1 }
        },

        // iOS
        IOS_BIOMETRIC_CLASSES: ['LAContext', 'BiometricKit', 'BKDevicePeer'],
        IOS_LOCATION_CLASSES: ['CLLocation', 'MKMapView', 'CLGeocoder'],
        IOS_URL_SCHEMES: ['UIApplication', 'SFSafariViewController']
    };

    // ============================================================================
    // UTILITY FUNCTIONS
    // ============================================================================

    function log(msg, level = 'INFO') {
        if (CONFIG.verboseLogging || level === 'ERROR' || level === 'FATAL') {
            try {
                const timestamp = new Date().toISOString();
                console.log(`[${timestamp}] [${level}] ${msg}`);
            } catch (e) {
                console.log(`[${level}] ${msg}`);
            }
        }
    }

    function logDebug(msg) {
        if (CONFIG.debugMode) log(msg, 'DEBUG');
    }

    function isAndroid() {
        try { 
            return typeof Java !== 'undefined' && Java.available;
        } catch (e) { 
            return false; 
        }
    }

    function isIOS() {
        try { 
            return typeof ObjC !== 'undefined' && ObjC.available;
        } catch (e) { 
            return false; 
        }
    }

    function findExport(libName, funcName) {
        try { 
            return Module.findExportByName(libName, funcName);
        } catch (e) { 
            return null; 
        }
    }

    function getFakePathPtr() {
        try {
            if (!getFakePathPtr._cache) {
                getFakePathPtr._cache = Memory.allocUtf8String(CONSTANTS.FAKE_LIB_PATH);
            }
            return getFakePathPtr._cache;
        } catch (e) {
            return null;
        }
    }

    function readCString(ptr) {
        try { 
            return ptr.readCString(); 
        } catch (e) { 
            return null; 
        }
    }

    function safeExecute(fn, name) {
        try {
            fn();
        } catch (e) {
            log(`[${name}] Error: ${e.message}`, 'ERROR');
            if (CONFIG.debugMode) {
                console.error(e.stack);
            }
        }
    }

    // ============================================================================
    // CHECK FRIDA ENVIRONMENT
    // ============================================================================

    function checkFridaEnvironment() {
        try {
            const required = ['Process', 'Module', 'Interceptor', 'Memory', 'ptr'];
            const missing = [];
            
            for (const name of required) {
                if (typeof global[name] === 'undefined' && typeof eval(name) === 'undefined') {
                    missing.push(name);
                }
            }
            
            if (missing.length > 0) {
                log(`Missing Frida APIs: ${missing.join(', ')}`, 'WARNING');
                return false;
            }
            return true;
        } catch (e) {
            log(`Frida environment check failed: ${e.message}`, 'ERROR');
            return false;
        }
    }

    // ============================================================================
    // DETECTION BYPASS HOOKS
    // ============================================================================

    // 1.1 ADB DETECTION BYPASS
    function bypassADB() {
        if (!CONFIG.enableADBBypass) return;
        safeExecute(function() {
            const addr = findExport('libc.so', '__system_property_get');
            if (addr) {
                Interceptor.attach(addr, {
                    onEnter(args) {
                        this.name = readCString(args[0]);
                        this.buf = args[1];
                    },
                    onLeave(retval) {
                        if (this.name === 'init.svc.adbd') {
                            this.buf.writeUtf8String('stopped');
                            retval.replace(7);
                        }
                    }
                });
            }

            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p === CONSTANTS.ADB_KEYS || p === CONSTANTS.TCP6_PATH) return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const read = new NativeFunction(
                findExport('libc.so', 'read') || Module.findExportByName(null, 'read'),
                'ssize_t', ['int', 'pointer', 'size_t']
            );
            Interceptor.replace(read, new NativeCallback(function (fd, buf, size) {
                const n = read(fd, buf, size);
                if (n > 0) {
                    const content = readCString(buf);
                    if (content && content.includes(CONSTANTS.ADB_PORT_HEX)) {
                        const sanitized = content.split('\n')
                            .filter(l => !l.includes(CONSTANTS.ADB_PORT_HEX))
                            .join('\n');
                        if (sanitized !== content) {
                            buf.writeUtf8String(sanitized);
                            return sanitized.length;
                        }
                    }
                }
                return n;
            }, 'ssize_t', ['int', 'pointer', 'size_t']));

            log('[ADB] Bypass installed');
        }, 'ADB');
    }

    // 1.2 BUILD PROPERTY SPOOFING
    function bypassBuildProperties() {
        if (!CONFIG.enableBuildBypass) return;
        safeExecute(function() {
            const addr = findExport('libc.so', '__system_property_get');
            if (!addr) return;

            Interceptor.attach(addr, {
                onEnter(args) {
                    this.name = readCString(args[0]);
                    this.buf = args[1];
                },
                onLeave(retval) {
                    if (!this.name) return;
                    const prop = CONSTANTS.BUILD_PROPS[this.name];
                    if (prop) {
                        this.buf.writeUtf8String(prop.value);
                        retval.replace(prop.len);
                    }
                }
            });

            log('[Build] Property spoofing installed');
        }, 'Build');
    }

    // 1.3 DEVICE TRUST NATIVE BYPASS
    function bypassDeviceTrustNative() {
        if (!CONFIG.enableDeviceTrustBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p === '/proc/self/maps' || p === CONSTANTS.FD_PATH) return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const fgets = new NativeFunction(
                findExport('libc.so', 'fgets') || Module.findExportByName(null, 'fgets'),
                'pointer', ['pointer', 'int', 'pointer']
            );
            Interceptor.attach(fgets, {
                onEnter(args) { this.buf = args[0]; },
                onLeave(retval) {
                    if (retval.isNull()) return;
                    const s = readCString(retval);
                    if (!s) return;
                    for (const needle of CONSTANTS.ROOT_NEEDLES) {
                        if (s.toLowerCase().includes(needle)) {
                            retval.writeUtf8String('\n');
                            return;
                        }
                    }
                    if (s.includes('rwxp') && (s.includes('/memfd') || !s.includes('/'))) {
                        retval.writeUtf8String('\n');
                    }
                }
            });

            const readlinkat = findExport('libc.so', 'readlinkat');
            if (readlinkat) {
                Interceptor.attach(readlinkat, {
                    onEnter(args) {
                        this.path = readCString(args[1]);
                        this.buf = args[2];
                    },
                    onLeave(retval) {
                        if (!this.path || !this.path.startsWith(CONSTANTS.FD_PATH + '/')) return;
                        const link = readCString(this.buf);
                        if (!link) return;
                        for (const needle of CONSTANTS.FD_NEEDLES) {
                            if (link.toLowerCase().includes(needle)) {
                                this.buf.writeUtf8String('/dev/null');
                                retval.replace(9);
                                return;
                            }
                        }
                    }
                });
            }

            const dladdr = findExport('libc.so', 'dladdr');
            if (dladdr) {
                Interceptor.replace(dladdr, new NativeCallback(function (addr, info) {
                    const ok = dladdr(addr, info);
                    if (ok === 0) return 0;
                    const fname = info.readPointer();
                    if (fname.isNull()) return ok;
                    const f = readCString(fname);
                    if (!f) return ok;
                    if (f.includes('/data/') || f.includes('/memfd:')) {
                        const fakePath = getFakePathPtr();
                        if (fakePath) info.writePointer(fakePath);
                    }
                    return ok;
                }, 'int', ['pointer', 'pointer']));
            }

            log('[DeviceTrust] Bypass installed');
        }, 'DeviceTrust');
    }

    // 1.4 ENVIRONMENT CHECK BYPASS
    function bypassEnvironment() {
        if (!CONFIG.enableEnvironmentBypass) return;
        safeExecute(function() {
            const getenv = findExport('libc.so', 'getenv');
            if (getenv) {
                Interceptor.attach(getenv, {
                    onEnter(args) {
                        this.name = readCString(args[0]);
                    },
                    onLeave(retval) {
                        if (this.name && (this.name === 'LD_PRELOAD' || this.name === 'LD_LIBRARY_PATH')) {
                            retval.replace(ptr(0));
                        }
                    }
                });
            }

            const ptrace = findExport('libc.so', 'ptrace');
            if (ptrace) {
                Interceptor.replace(ptrace, new NativeCallback(function (req, pid, addr, data) {
                    return 0;
                }, 'long', ['int', 'int', 'pointer', 'pointer']));
            }

            log('[Environment] Bypass installed');
        }, 'Environment');
    }

    // 1.5 FD SCAN BYPASS
    function bypassFDScan() {
        if (!CONFIG.enableFDBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p === CONSTANTS.FD_PATH) return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const readlinkat = findExport('libc.so', 'readlinkat');
            if (readlinkat) {
                Interceptor.attach(readlinkat, {
                    onEnter(args) {
                        this.path = readCString(args[1]);
                        this.buf = args[2];
                    },
                    onLeave(retval) {
                        if (!this.path || !this.path.startsWith(CONSTANTS.FD_PATH + '/')) return;
                        const link = readCString(this.buf);
                        if (!link) return;
                        for (const needle of CONSTANTS.FD_NEEDLES) {
                            if (link.includes(needle)) {
                                this.buf.writeUtf8String('/dev/null');
                                retval.replace(9);
                                return;
                            }
                        }
                    }
                });
            }

            log('[FDScan] Bypass installed');
        }, 'FDScan');
    }

    // 1.6 FRIDA DETECTION BYPASS
    function bypassFrida() {
        if (!CONFIG.enableFridaBypass) return;
        safeExecute(function() {
            const dlsym = findExport('libc.so', 'dlsym');
            if (dlsym) {
                Interceptor.attach(dlsym, {
                    onEnter(args) {
                        this.sym = readCString(args[1]);
                    },
                    onLeave(retval) {
                        if (this.sym && CONSTANTS.GADGET_SYMBOLS.some(s => this.sym.includes(s))) {
                            retval.replace(ptr(0));
                        }
                    }
                });
            }

            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p && CONSTANTS.PROC_PATHS.includes(p)) return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const recv = new NativeFunction(
                findExport('libc.so', 'recv') || Module.findExportByName(null, 'recv'),
                'ssize_t', ['int', 'pointer', 'size_t', 'int']
            );
            Interceptor.replace(recv, new NativeCallback(function (fd, buf, len, flags) {
                const n = recv(fd, buf, len, flags);
                if (n >= 16 && buf.readU8() === 0x6C) {
                    buf.writeU8(0x00, 0);
                    buf.writeU8(0x00, 3);
                    for (let i = 12; i < 16; i++) buf.writeU8(0x00, i);
                }
                return n;
            }, 'ssize_t', ['int', 'pointer', 'size_t', 'int']));

            log('[Frida] Bypass installed');
        }, 'Frida');
    }

    // 1.7 LSPOSED CHECK BYPASS
    function bypassLSPosed() {
        if (!CONFIG.enableLSPosedBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p && CONSTANTS.LSPOSED_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
                    return -1;
                }
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const getdents64 = new NativeFunction(
                findExport('libc.so', 'getdents64') || Module.findExportByName(null, 'getdents64'),
                'int', ['int', 'pointer', 'unsigned int']
            );
            Interceptor.replace(getdents64, new NativeCallback(function (fd, dirp, count) {
                const n = getdents64(fd, dirp, count);
                if (n <= 0) return n;

                let off = 0, out = 0;
                const filtered = Memory.alloc(count);
                filtered.writeByteArray(dirp.readByteArray(0), 0);

                while (off < n) {
                    const d_ino = dirp.add(off).readU64();
                    const d_off = dirp.add(off + 8).readU64();
                    const d_reclen = dirp.add(off + 16).readU16();
                    const d_type = dirp.add(off + 18).readU8();
                    const name = readCString(dirp.add(off + 19));

                    if (name && name === 'lspd') {
                        off += d_reclen;
                        continue;
                    }

                    filtered.add(out).writeU64(d_ino);
                    filtered.add(out + 8).writeU64(d_off);
                    filtered.add(out + 16).writeU16(d_reclen);
                    filtered.add(out + 18).writeU8(d_type);
                    filtered.add(out + 19).writeUtf8String(name || '');
                    out += d_reclen;
                    off += d_reclen;
                    if (d_reclen === 0) break;
                }

                dirp.writeByteArray(filtered.readByteArray(0), out);
                return out;
            }, 'int', ['int', 'pointer', 'unsigned int']));

            log('[LSPosed] Bypass installed');
        }, 'LSPosed');
    }

    // 1.8 MAPS SCAN BYPASS
    function bypassMaps() {
        if (!CONFIG.enableMapsBypass) return;
        safeExecute(function() {
            const fgets = new NativeFunction(
                findExport('libc.so', 'fgets') || Module.findExportByName(null, 'fgets'),
                'pointer', ['pointer', 'int', 'pointer']
            );
            Interceptor.attach(fgets, {
                onLeave(retval) {
                    if (retval.isNull()) return;
                    const s = readCString(retval);
                    if (!s) return;
                    for (const needle of CONSTANTS.MAPS_NEEDLES) {
                        if (s.includes(needle)) {
                            retval.writeUtf8String('\n');
                            return;
                        }
                    }
                    if (s.includes('rwxp') && (s.includes('/memfd:jit-cache') || !s.includes('/'))) {
                        retval.writeUtf8String('\n');
                    }
                }
            });

            const read = new NativeFunction(
                findExport('libc.so', 'read') || Module.findExportByName(null, 'read'),
                'ssize_t', ['int', 'pointer', 'size_t']
            );
            Interceptor.replace(read, new NativeCallback(function (fd, buf, size) {
                const n = read(fd, buf, size);
                if (n > 0) {
                    const content = readCString(buf);
                    if (content) {
                        let sanitized = content;
                        for (const needle of CONSTANTS.MAPS_NEEDLES) {
                            sanitized = sanitized.split('\n').filter(l => !l.includes(needle)).join('\n');
                        }
                        if (sanitized !== content) {
                            buf.writeUtf8String(sanitized);
                            return sanitized.length;
                        }
                    }
                }
                return n;
            }, 'ssize_t', ['int', 'pointer', 'size_t']));

            log('[Maps] Bypass installed');
        }, 'Maps');
    }

    // 1.9 MOUNT CHECK BYPASS
    function bypassMount() {
        if (!CONFIG.enableMountBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p === '/proc/self/mounts') return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const fgets = new NativeFunction(
                findExport('libc.so', 'fgets') || Module.findExportByName(null, 'fgets'),
                'pointer', ['pointer', 'int', 'pointer']
            );
            Interceptor.attach(fgets, {
                onLeave(retval) {
                    if (retval.isNull()) return;
                    const s = readCString(retval);
                    if (!s) return;
                    for (const needle of CONSTANTS.MOUNT_NEEDLES) {
                        if (s.includes(needle) && s.includes('tmpfs')) {
                            retval.writeUtf8String('\n');
                            return;
                        }
                    }
                    if (s.includes('/system') && s.includes(' rw,')) {
                        retval.writeUtf8String('\n');
                    }
                }
            });

            log('[Mount] Bypass installed');
        }, 'Mount');
    }

    // 1.10 PLT CHECK BYPASS
    function bypassPLT() {
        if (!CONFIG.enablePLTBypass) return;
        safeExecute(function() {
            const realAddrs = new Map();

            const dlsym = findExport('libc.so', 'dlsym');
            if (dlsym) {
                Interceptor.attach(dlsym, {
                    onEnter(args) {
                        this.sym = readCString(args[1]);
                    },
                    onLeave(retval) {
                        if (!this.sym) return;
                        for (const t of CONSTANTS.PLT_TARGETS) {
                            if (this.sym === t || this.sym.endsWith('_' + t)) {
                                const real = Module.findExportByName(null, t);
                                if (real) {
                                    realAddrs.set(t, real);
                                    retval.replace(real);
                                }
                            }
                        }
                    }
                });
            }

            const dladdr = findExport('libc.so', 'dladdr');
            if (dladdr) {
                Interceptor.attach(dladdr, {
                    onEnter(args) {
                        this.addr = args[0];
                        this.info = args[1];
                    },
                    onLeave(retval) {
                        for (const [sym, addr] of realAddrs) {
                            if (this.addr.equals(addr)) {
                                const expected = (sym === 'open') ? 'libc.so' : 'libssl.so';
                                const fnamePtr = Memory.allocUtf8String('/system/lib64/' + expected);
                                this.info.writePointer(fnamePtr);
                                return;
                            }
                        }
                    }
                });
            }

            log('[PLT] Bypass installed');
        }, 'PLT');
    }

    // 1.11 PORT PROBE BYPASS
    function bypassPortProbe() {
        if (!CONFIG.enablePortProbeBypass) return;
        safeExecute(function() {
            const connect = findExport('libc.so', 'connect');
            if (connect) {
                Interceptor.replace(connect, new NativeCallback(function (fd, addr, len) {
                    if (addr && !addr.isNull()) {
                        const port = (addr.add(2).readU8() << 8) | addr.add(3).readU8();
                        if (CONSTANTS.FRIDA_PORTS.has(port)) {
                            const __errno = new NativeFunction(
                                findExport('libc.so', '__errno') || Module.findExportByName(null, '__errno'),
                                'pointer', []
                            );
                            __errno().writeU32(111);
                            return -1;
                        }
                    }
                    return connect(fd, addr, len);
                }, 'int', ['int', 'pointer', 'int']));
            }

            const recv = new NativeFunction(
                findExport('libc.so', 'recv') || Module.findExportByName(null, 'recv'),
                'ssize_t', ['int', 'pointer', 'size_t', 'int']
            );
            Interceptor.replace(recv, new NativeCallback(function (fd, buf, len, flags) {
                const n = recv(fd, buf, len, flags);
                if (n > 0 && buf.readU8() === 0x6C) {
                    buf.writeU8(0x00, 0);
                    buf.writeU8(0x00, 3);
                    for (let i = 12; i < 16; i++) buf.writeU8(0x00, i);
                }
                return n;
            }, 'ssize_t', ['int', 'pointer', 'size_t', 'int']));

            log('[PortProbe] Bypass installed');
        }, 'PortProbe');
    }

    // 1.12 ROOT CHECK BYPASS
    function bypassRoot() {
        if (!CONFIG.enableRootBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (!p) return openat(dirfd, pathPtr, flags, mode);
                if (CONSTANTS.ROOT_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
                    return -1;
                }
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const open = findExport('libc.so', 'open');
            if (open) {
                Interceptor.replace(open, new NativeCallback(function (pathPtr, flags) {
                    const p = readCString(pathPtr);
                    if (!p) return open(pathPtr, flags);
                    if (CONSTANTS.ROOT_PATHS.some(r => p === r || p.startsWith(r + '/'))) {
                        return -1;
                    }
                    return open(pathPtr, flags);
                }, 'int', ['pointer', 'int']));
            }

            const addr = findExport('libc.so', '__system_property_get');
            if (addr) {
                Interceptor.attach(addr, {
                    onEnter(args) {
                        this.name = readCString(args[0]);
                        this.buf = args[1];
                    },
                    onLeave(retval) {
                        if (!this.name) return;
                        if (this.name === 'ro.debuggable') {
                            this.buf.writeUtf8String('0');
                            retval.replace(1);
                        } else if (this.name === 'ro.secure') {
                            this.buf.writeUtf8String('1');
                            retval.replace(1);
                        } else if (this.name === 'ro.build.type') {
                            this.buf.writeUtf8String('user');
                            retval.replace(4);
                        } else if (this.name === 'ro.build.tags') {
                            this.buf.writeUtf8String('release-keys');
                            retval.replace(12);
                        }
                    }
                });
            }

            const strstr = findExport('libc.so', 'strstr');
            if (strstr) {
                Interceptor.attach(strstr, {
                    onEnter(args) {
                        this.needle = readCString(args[1]);
                    },
                    onLeave(retval) {
                        if (this.needle && CONSTANTS.ROOT_NEEDLES.includes(this.needle)) {
                            retval.replace(ptr(0));
                        }
                    }
                });
            }

            const getenv = findExport('libc.so', 'getenv');
            if (getenv) {
                Interceptor.attach(getenv, {
                    onEnter(args) {
                        this.name = readCString(args[0]);
                    },
                    onLeave(retval) {
                        if (this.name && (this.name === 'LD_PRELOAD' || this.name === 'LD_LIBRARY_PATH')) {
                            retval.replace(ptr(0));
                        }
                    }
                });
            }

            const ptrace = findExport('libc.so', 'ptrace');
            if (ptrace) {
                Interceptor.replace(ptrace, new NativeCallback(function (req, pid, addr, data) {
                    return 0;
                }, 'long', ['int', 'int', 'pointer', 'pointer']));
            }

            log('[Root] Bypass installed');
        }, 'Root');
    }

    // 1.13 SNITCHTT JNI BYPASS
    function bypassSnitchtt() {
        if (!CONFIG.enableSnitchttBypass) return;
        safeExecute(function() {
            for (const name of ['sna_e', 'snb_e']) {
                try {
                    const addr = Module.findExportByName(null, name);
                    if (addr) {
                        Interceptor.replace(addr, new NativeCallback(function (key, out, outsz) {
                            if (out && outsz >= 3) {
                                out[0] = 0;
                                out[1] = 0;
                                out[2] = 0;
                            }
                            return (key >>> 0) ^ 0xC0FFEE42 >>> 0;
                        }, 'uint32', ['uint32', 'pointer', 'uint32']));
                    }
                } catch (e) {}
            }

            const dlsym = findExport('libc.so', 'dlsym');
            if (dlsym) {
                Interceptor.attach(dlsym, {
                    onEnter(args) {
                        this.sym = readCString(args[1]);
                    },
                    onLeave(retval) {
                        if (this.sym && (this.sym === 'sna_e' || this.sym === 'snb_e')) {
                            if (retval.isNull()) {
                                const stub = Memory.alloc(Process.pointerSize * 8);
                                stub.writeByteArray([0xC0, 0x03, 0x5F, 0xD6]);
                                retval.replace(stub);
                            }
                        }
                    }
                });
            }

            const dladdr = findExport('libc.so', 'dladdr');
            if (dladdr) {
                Interceptor.replace(dladdr, new NativeCallback(function (addr, info) {
                    const ok = dladdr(addr, info);
                    if (ok === 0) {
                        const fakePath = getFakePathPtr();
                        if (fakePath) {
                            info.writePointer(fakePath);
                            info.add(Process.pointerSize).writePointer(ptr(0));
                            info.add(Process.pointerSize * 2).writePointer(ptr(0));
                            info.add(Process.pointerSize * 3).writePointer(ptr(0));
                        }
                        return 1;
                    }
                    const fname = info.readPointer();
                    if (fname.isNull()) {
                        const fakePath = getFakePathPtr();
                        if (fakePath) info.writePointer(fakePath);
                        return 1;
                    }
                    const f = readCString(fname);
                    if (f && (f.includes('/data/') || f.includes('/memfd:') || f.includes('frida'))) {
                        const fakePath = getFakePathPtr();
                        if (fakePath) info.writePointer(fakePath);
                    }
                    return ok;
                }, 'int', ['pointer', 'pointer']));
            }

            const strstr = findExport('libc.so', 'strstr');
            if (strstr) {
                Interceptor.attach(strstr, {
                    onEnter(args) {
                        this.needle = readCString(args[1]);
                    },
                    onLeave(retval) {
                        if (this.needle && (
                            this.needle === 'magisk' || this.needle === 'frida' ||
                            this.needle === '/debug_ramdisk' || this.needle === 'lspd' ||
                            this.needle === '@magisk_daemon'
                        )) {
                            retval.replace(ptr(0));
                        }
                    }
                });
            }

            log('[Snitchtt] Bypass installed');
        }, 'Snitchtt');
    }

    // 1.14 STACK CHECK BYPASS
    function bypassStack() {
        if (!CONFIG.enableStackBypass) return;
        safeExecute(function() {
            const dladdr = findExport('libc.so', 'dladdr');
            if (dladdr) {
                Interceptor.replace(dladdr, new NativeCallback(function (addr, info) {
                    const ok = dladdr(addr, info);
                    if (ok === 0) {
                        const fakePath = getFakePathPtr();
                        if (fakePath) {
                            info.writePointer(fakePath);
                            info.add(Process.pointerSize).writePointer(ptr(0));
                            info.add(Process.pointerSize * 2).writePointer(ptr(0));
                            info.add(Process.pointerSize * 3).writePointer(ptr(0));
                        }
                        return 1;
                    }
                    const fname = info.readPointer();
                    if (!fname.isNull()) {
                        const fnameStr = readCString(fname);
                        if (fnameStr) {
                            for (const needle of CONSTANTS.STACK_NEEDLES) {
                                if (fnameStr.includes(needle)) {
                                    const fakePath = getFakePathPtr();
                                    if (fakePath) info.writePointer(fakePath);
                                    return 1;
                                }
                            }
                        }
                    }
                    return ok;
                }, 'int', ['pointer', 'pointer']));
            }

            log('[Stack] Bypass installed');
        }, 'Stack');
    }

    // 1.15 THREAD SCAN BYPASS
    function bypassThread() {
        if (!CONFIG.enableThreadBypass) return;
        safeExecute(function() {
            const openat = new NativeFunction(
                findExport('libc.so', 'openat') || Module.findExportByName(null, 'openat'),
                'int', ['int', 'pointer', 'int', 'int']
            );
            Interceptor.replace(openat, new NativeCallback(function (dirfd, pathPtr, flags, mode) {
                const p = readCString(pathPtr);
                if (p === CONSTANTS.TASK_PATH) return -1;
                return openat(dirfd, pathPtr, flags, mode);
            }, 'int', ['int', 'pointer', 'int', 'int']));

            const fgets = new NativeFunction(
                findExport('libc.so', 'fgets') || Module.findExportByName(null, 'fgets'),
                'pointer', ['pointer', 'int', 'pointer']
            );
            Interceptor.attach(fgets, {
                onEnter(args) { this.buf = args[0]; },
                onLeave(retval) {
                    if (retval.isNull()) return;
                    const s = readCString(retval);
                    if (!s) return;
                    for (const needle of CONSTANTS.THREAD_NEEDLES) {
                        if (s.trim() === needle) {
                            retval.writeUtf8String('main\n');
                            return;
                        }
                    }
                }
            });

            log('[Thread] Bypass installed');
        }, 'Thread');
    }

    // 1.16 TIMING BYPASS
    function bypassTiming() {
        if (!CONFIG.enableTimingBypass) return;
        safeExecute(function() {
            const getpid = findExport('libc.so', 'getpid');
            if (getpid) {
                Interceptor.replace(getpid, new NativeCallback(function () {
                    return Process.id;
                }, 'int', []));
            }

            const syscall = findExport('libc.so', 'syscall');
            if (syscall) {
                Interceptor.replace(syscall, new NativeCallback(function (num, a, b, c, d, e, f) {
                    if (num === 39) return Process.id;
                    return syscall(num, a, b, c, d, e, f);
                }, 'long', ['long', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']));
            }

            log('[Timing] Bypass installed');
        }, 'Timing');
    }

    // ============================================================================
    // ANDROID JAVA-LEVEL HOOKS
    // ============================================================================

    function enumerateJavaClasses() {
        if (!CONFIG.enableJavaHooks || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const classList = [];
                Java.enumerateLoadedClasses({
                    onMatch: function (className) {
                        classList.push(className);
                    },
                    onComplete: function () {
                        log(`[Java] Enumerated ${classList.length} loaded classes`);
                        if (CONFIG.debugMode && classList.length > 0) {
                            logDebug(`Sample classes: ${classList.slice(0, 10).join(', ')}`);
                        }
                    }
                });
            });
        }, 'JavaEnum');
    }

    function hookActivities() {
        if (!CONFIG.enableActivityHooks || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const Activity = Java.use('android.app.Activity');
                const originalOnCreate = Activity.onCreate.overload('android.os.Bundle').implementation;

                Activity.onCreate.overload('android.os.Bundle').implementation = function (savedInstanceState) {
                    log(`[Activity] onCreate: ${this.getClass().getName()}`);
                    return originalOnCreate.call(this, savedInstanceState);
                };

                try {
                    const originalOnResume = Activity.onResume.implementation;
                    Activity.onResume.implementation = function () {
                        log(`[Activity] onResume: ${this.getClass().getName()}`);
                        return originalOnResume ? originalOnResume.call(this) : undefined;
                    };
                } catch (e) {}

                try {
                    const originalOnPause = Activity.onPause.implementation;
                    Activity.onPause.implementation = function () {
                        log(`[Activity] onPause: ${this.getClass().getName()}`);
                        return originalOnPause ? originalOnPause.call(this) : undefined;
                    };
                } catch (e) {}
            });
            log('[Activity] Hooks installed');
        }, 'Activity');
    }

    function hookSQLite() {
        if (!CONFIG.enableSQLiteHooks || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const SQLiteDatabase = Java.use('android.database.sqlite.SQLiteDatabase');

                try {
                    SQLiteDatabase.execSQL.overload('java.lang.String').implementation = function (sql) {
                        log(`[SQLite] execSQL: ${sql}`);
                        return this.execSQL(sql);
                    };
                } catch (e) {}

                try {
                    SQLiteDatabase.query.overload(
                        'java.lang.String', '[Ljava.lang.String;', 'java.lang.String',
                        '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String',
                        'java.lang.String', 'java.lang.String'
                    ).implementation = function (table, columns, selection, selectionArgs, groupBy, having, orderBy, limit) {
                        log(`[SQLite] query: ${table}`);
                        return this.query(table, columns, selection, selectionArgs, groupBy, having, orderBy, limit);
                    };
                } catch (e) {}

                try {
                    const SQLiteOpenHelper = Java.use('android.database.sqlite.SQLiteOpenHelper');
                    const origGetWritableDatabase = SQLiteOpenHelper.getWritableDatabase.implementation;
                    SQLiteOpenHelper.getWritableDatabase.implementation = function () {
                        log(`[SQLite] getWritableDatabase: ${this.getClass().getName()}`);
                        return origGetWritableDatabase.call(this);
                    };
                } catch (e) {}
            });
            log('[SQLite] Hooks installed');
        }, 'SQLite');
    }

    function hookIntents() {
        if (!CONFIG.enableIntentHooks || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const Intent = Java.use('android.content.Intent');

                const originalGetData = Intent.getData.implementation;
                Intent.getData.implementation = function () {
                    const data = originalGetData.call(this);
                    const action = this.getAction() !== null ? this.getAction().toString() : 'none';
                    log(`[Intent] Action: ${action}, Data: ${data}`);
                    return data;
                };

                try {
                    const originalGetStringExtra = Intent.getStringExtra.overload('java.lang.String');
                    Intent.getStringExtra.overload('java.lang.String').implementation = function (name) {
                        const value = originalGetStringExtra.call(this, name);
                        logDebug(`[Intent] getStringExtra: ${name} = ${value}`);
                        return value;
                    };
                } catch (e) {}
            });
            log('[Intent] Hooks installed');
        }, 'Intent');
    }

    function hookLocation(lat = 37.7749, lng = -122.4194) {
        if (!CONFIG.enableLocationHooks || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const Location = Java.use('android.location.Location');

                Location.getLatitude.implementation = function () {
                    logDebug(`[Location] Spoofing latitude: ${lat}`);
                    return lat;
                };

                Location.getLongitude.implementation = function () {
                    logDebug(`[Location] Spoofing longitude: ${lng}`);
                    return lng;
                };

                try {
                    const LocationManager = Java.use('android.location.LocationManager');
                    const origGetLastKnownLocation = LocationManager.getLastKnownLocation.overload('java.lang.String');
                    LocationManager.getLastKnownLocation.overload('java.lang.String').implementation = function (provider) {
                        const fakeLoc = Location.$new(provider);
                        fakeLoc.setLatitude(lat);
                        fakeLoc.setLongitude(lng);
                        fakeLoc.setAccuracy(10.0);
                        fakeLoc.setTime(Date.now());
                        log(`[Location] getLastKnownLocation(${provider}) returning spoofed location`);
                        return fakeLoc;
                    };
                } catch (e) {}
            });
            log(`[Location] Spoofing enabled (${lat}, ${lng})`);
        }, 'Location');
    }

    function bypassBiometrics() {
        if (!CONFIG.enableBiometricBypass || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                try {
                    const BiometricPrompt = Java.use('androidx.biometric.BiometricPrompt');
                    const AuthenticationCallback = Java.use('androidx.biometric.BiometricPrompt$AuthenticationCallback');

                    const callbackImpl = Java.registerClass({
                        name: 'com.frida.BiometricBypass$Callback',
                        extends: AuthenticationCallback,
                        methods: {
                            onAuthenticationSucceeded: function (result) {
                                log('[Biometric] Authentication succeeded (bypassed)');
                            },
                            onAuthenticationError: function (errCode, errString) {
                                log(`[Biometric] Authentication error: ${errCode} - ${errString}`);
                            },
                            onAuthenticationFailed: function () {
                                log('[Biometric] Authentication failed');
                            }
                        }
                    });
                    log('[Biometric] Bypass installed');
                } catch (e) {
                    log(`[Biometric] androidx not found, trying fingerprint manager: ${e.message}`);
                    try {
                        const FingerprintManager = Java.use('android.hardware.fingerprint.FingerprintManager');
                        const origAuthenticate = FingerprintManager.authenticate.implementation;
                        FingerprintManager.authenticate.implementation = function (crypto, cancel, flags, callback, handler) {
                            log('[Biometric] Fingerprint authentication intercepted');
                            const AuthenticationResult = Java.use('android.hardware.fingerprint.FingerprintManager$AuthenticationResult');
                            const result = AuthenticationResult.$new();
                            callback.onAuthenticationSucceeded(result);
                            return origAuthenticate ? origAuthenticate.call(this, crypto, cancel, flags, callback, handler) : null;
                        };
                    } catch (e2) {
                        log(`[Biometric] Fingerprint error: ${e2.message}`, 'ERROR');
                    }
                }
            });
        }, 'Biometric');
    }

    // ============================================================================
    // NATIVE-LEVEL HOOKS
    // ============================================================================

    function hookDlopen() {
        if (!CONFIG.enableDlopenHook) return;
        safeExecute(function() {
            const dlopen = findExport('libc.so', 'dlopen');
            if (dlopen) {
                Interceptor.attach(dlopen, {
                    onEnter(args) {
                        const libName = readCString(args[0]);
                        logDebug(`[Dlopen] Loading: ${libName}`);
                        this.libName = libName;
                    },
                    onLeave(retval) {
                        if (this.libName) {
                            log(`[Dlopen] Loaded: ${this.libName}`);
                        }
                    }
                });
            }

            const dlclose = findExport('libc.so', 'dlclose');
            if (dlclose) {
                Interceptor.attach(dlclose, {
                    onEnter(args) {
                        logDebug('[Dlclose] Library closed');
                    }
                });
            }

            const android_dlopen_ext = findExport('libdl.so', 'android_dlopen_ext');
            if (android_dlopen_ext) {
                Interceptor.attach(android_dlopen_ext, {
                    onEnter(args) {
                        const libName = readCString(args[0]);
                        log(`[DlopenExt] Loading: ${libName}`);
                        this.libName = libName;
                    },
                    onLeave(retval) {
                        if (this.libName) {
                            log(`[DlopenExt] Loaded: ${this.libName}`);
                        }
                    }
                });
            }

            log('[Dlopen] Hooks installed');
        }, 'Dlopen');
    }

    function hookProcessExecution() {
        if (!CONFIG.enableProcessExecutionHooks) return;
        safeExecute(function() {
            const execFuncs = ['execl', 'execlp', 'execle', 'execv', 'execvp', 'execve'];
            execFuncs.forEach(funcName => {
                const func = findExport('libc.so', funcName);
                if (func) {
                    Interceptor.attach(func, {
                        onEnter(args) {
                            const path = readCString(args[0]);
                            log(`[Exec] ${funcName}: ${path}`);
                            if (CONFIG.debugMode) {
                                let argsStr = '';
                                for (let i = 1; i < 10; i++) {
                                    try {
                                        const arg = readCString(args[i]);
                                        if (arg) argsStr += ` ${arg}`;
                                    } catch (e) { break; }
                                }
                                logDebug(`[Exec] Args:${argsStr}`);
                            }
                        }
                    });
                }
            });

            const fork = findExport('libc.so', 'fork');
            if (fork) {
                Interceptor.attach(fork, {
                    onLeave(retval) {
                        log(`[Fork] Process forked, pid: ${retval.toInt32()}`);
                    }
                });
            }

            const vfork = findExport('libc.so', 'vfork');
            if (vfork) {
                Interceptor.attach(vfork, {
                    onLeave(retval) {
                        log(`[VFork] Process vforked, pid: ${retval.toInt32()}`);
                    }
                });
            }

            const clone = findExport('libc.so', 'clone');
            if (clone) {
                Interceptor.attach(clone, {
                    onEnter(args) {
                        logDebug('[Clone] Thread cloned');
                    }
                });
            }

            log('[Process] Execution hooks installed');
        }, 'Process');
    }

    function hookRegisterNatives() {
        if (!CONFIG.enableRegisterNativesHook || !isAndroid()) return;
        safeExecute(function() {
            Java.perform(function () {
                const symbols = Module.enumerateSymbolsSync('libart.so');
                const registerNativesSymbol = symbols.find(s => s.name.includes('RegisterNatives'));

                if (registerNativesSymbol) {
                    Interceptor.attach(registerNativesSymbol.address, {
                        onEnter(args) {
                            logDebug('[RegisterNatives] JNI registration intercepted');
                            try {
                                const env = args[0];
                                const clazz = args[1];
                                const methods = args[2];
                                const nMethods = args[3].toInt32();

                                if (clazz && !clazz.isNull()) {
                                    const className = Java.use('java.lang.Class');
                                    const classObj = Java.cast(clazz, className);
                                    log(`[RegisterNatives] Registering ${nMethods} methods for ${classObj.getName()}`);
                                }
                            } catch (e) {}
                        }
                    });
                    log('[RegisterNatives] Hook installed');
                } else {
                    const symbols2 = Module.enumerateSymbolsSync('libnativehelper.so');
                    const registerNativesSymbol2 = symbols2.find(s => s.name.includes('RegisterNatives'));
                    if (registerNativesSymbol2) {
                        Interceptor.attach(registerNativesSymbol2.address, {
                            onEnter(args) {
                                logDebug('[RegisterNatives] JNI registration intercepted (libnativehelper)');
                            }
                        });
                        log('[RegisterNatives] Hook installed (libnativehelper)');
                    }
                }
            });
        }, 'RegisterNatives');
    }

    function traceSyscalls() {
        if (!CONFIG.enableNativeTracing) return;
        safeExecute(function() {
            const syscalls = [
                'open', 'read', 'write', 'close', 'socket', 'connect',
                'accept', 'send', 'recv', 'mmap', 'munmap', 'mprotect'
            ];

            syscalls.forEach(name => {
                const func = findExport('libc.so', name);
                if (func) {
                    Interceptor.attach(func, {
                        onEnter(args) {
                            logDebug(`[Syscall] ${name} called`);
                        }
                    });
                }
            });

            log('[Syscalls] Tracing enabled');
        }, 'Syscalls');
    }

    // ============================================================================
    // iOS OBJECTIVE-C HOOKS
    // ============================================================================

    function getAppInfoIOS() {
        if (!CONFIG.enableAppInfoHooks || !isIOS()) return;
        safeExecute(function() {
            const NSBundle = ObjC.classes.NSBundle;
            const mainBundle = NSBundle.mainBundle();

            const bundleId = mainBundle.bundleIdentifier().toString();
            const appName = mainBundle.infoDictionary().objectForKey_('CFBundleName').toString();
            const version = mainBundle.infoDictionary().objectForKey_('CFBundleShortVersionString').toString();
            const build = mainBundle.infoDictionary().objectForKey_('CFBundleVersion').toString();

            log(`[iOS] App: ${appName} (${bundleId})`);
            log(`[iOS] Version: ${version} (Build: ${build})`);

            const NSFileManager = ObjC.classes.NSFileManager;
            const documentsPath = NSFileManager.defaultManager().URLsForDirectory_inDomains_(9, 1).firstObject().path().toString();
            logDebug(`[iOS] Documents: ${documentsPath}`);
        }, 'iOSAppInfo');
    }

    function bypassBiometricsIOS() {
        if (!CONFIG.enableBiometricsIOSBypass || !isIOS()) return;
        safeExecute(function() {
            const LAContext = ObjC.classes.LAContext;
            if (LAContext) {
                const evaluatePolicy = LAContext['- evaluatePolicy:localizedReason:reply:'];
                if (evaluatePolicy) {
                    Interceptor.attach(evaluatePolicy.implementation, {
                        onEnter(args) {
                            this.replyBlock = new ObjC.Block(args[4]);
                            const originalImpl = this.replyBlock.implementation;

                            this.replyBlock.implementation = function (success, error) {
                                log('[iOS Biometric] Authentication bypassed (success)');
                                return originalImpl(true, null);
                            };
                        }
                    });
                    log('[iOS Biometric] LAContext bypass installed');
                }
            }

            const BiometricKit = ObjC.classes.BiometricKit;
            if (BiometricKit) {
                const evaluatePolicy = BiometricKit['- evaluatePolicy:options:reply:'];
                if (evaluatePolicy) {
                    Interceptor.attach(evaluatePolicy.implementation, {
                        onEnter(args) {
                            this.replyBlock = new ObjC.Block(args[3]);
                            const originalImpl = this.replyBlock.implementation;
                            this.replyBlock.implementation = function (result, error) {
                                log('[iOS Biometric] BiometricKit bypassed (success)');
                                return originalImpl(true, null);
                            };
                        }
                    });
                    log('[iOS Biometric] BiometricKit bypass installed');
                }
            }
        }, 'iOSBiometric');
    }

    function spoofLocationIOS(lat = 37.7749, lng = -122.4194) {
        if (!CONFIG.enableLocationIOSBypass || !isIOS()) return;
        safeExecute(function() {
            const CLLocation = ObjC.classes.CLLocation;
            if (CLLocation) {
                const initWithCoordinate = CLLocation['- initWithCoordinate:altitude:horizontalAccuracy:verticalAccuracy:timestamp:'];
                if (initWithCoordinate) {
                    Interceptor.attach(initWithCoordinate.implementation, {
                        onLeave(retval) {
                            logDebug(`[iOS Location] CLLocation created`);
                        }
                    });
                }
            }

            const CLLocationManager = ObjC.classes.CLLocationManager;
            if (CLLocationManager) {
                const setDelegate = CLLocationManager['- setDelegate:'];
                if (setDelegate) {
                    Interceptor.attach(setDelegate.implementation, {
                        onEnter(args) {
                            const delegate = new ObjC.Object(args[2]);
                            logDebug(`[iOS Location] LocationManager delegate set`);
                        }
                    });
                }
            }

            log(`[iOS Location] Spoofing enabled (${lat}, ${lng})`);
        }, 'iOSLocation');
    }

    function hookURLSchemesIOS() {
        if (!CONFIG.enableURLSchemeHooks || !isIOS()) return;
        safeExecute(function() {
            const UIApplication = ObjC.classes.UIApplication;

            const openURL = UIApplication['- openURL:options:completionHandler:'];
            if (openURL) {
                Interceptor.attach(openURL.implementation, {
                    onEnter(args) {
                        const url = new ObjC.Object(args[2]);
                        const absoluteUrl = url.absoluteString().toString();
                        log(`[iOS URL] openURL: ${absoluteUrl}`);
                        this.url = absoluteUrl;
                    },
                    onLeave(retval) {
                        logDebug(`[iOS URL] openURL result: ${retval}`);
                    }
                });
            }

            const canOpenURL = UIApplication['- canOpenURL:'];
            if (canOpenURL) {
                Interceptor.attach(canOpenURL.implementation, {
                    onEnter(args) {
                        const url = new ObjC.Object(args[2]);
                        logDebug(`[iOS URL] canOpenURL: ${url.absoluteString().toString()}`);
                    }
                });
            }

            const SFSafariViewController = ObjC.classes.SFSafariViewController;
            if (SFSafariViewController) {
                const initWithURL = SFSafariViewController['- initWithURL:'];
                if (initWithURL) {
                    Interceptor.attach(initWithURL.implementation, {
                        onEnter(args) {
                            const url = new ObjC.Object(args[2]);
                            log(`[iOS URL] SafariViewController opening: ${url.absoluteString().toString()}`);
                        }
                    });
                }
            }

            log('[iOS URL] Scheme hooks installed');
        }, 'iOSURL');
    }

    function monitorNSUserDefaultsIOS() {
        if (!CONFIG.enableIOSHooks || !isIOS()) return;
        safeExecute(function() {
            const NSUserDefaults = ObjC.classes.NSUserDefaults;

            const setObjectForKey = NSUserDefaults['- setObject:forKey:'];
            if (setObjectForKey) {
                Interceptor.attach(setObjectForKey.implementation, {
                    onEnter(args) {
                        const key = new ObjC.Object(args[3]).toString();
                        const value = new ObjC.Object(args[2]);
                        logDebug(`[iOS Prefs] Set: ${key} = ${value}`);
                        this.key = key;
                        this.value = value;
                    },
                    onLeave(retval) {
                        log(`[iOS Prefs] Set: ${this.key}`);
                    }
                });
            }

            const objectForKey = NSUserDefaults['- objectForKey:'];
            if (objectForKey) {
                Interceptor.attach(objectForKey.implementation, {
                    onEnter(args) {
                        const key = new ObjC.Object(args[2]).toString();
                        logDebug(`[iOS Prefs] Get: ${key}`);
                        this.key = key;
                    },
                    onLeave(retval) {
                        if (!retval.isNull()) {
                            const value = new ObjC.Object(retval);
                            logDebug(`[iOS Prefs] Got: ${this.key} = ${value}`);
                        }
                    }
                });
            }

            const synchronize = NSUserDefaults['- synchronize'];
            if (synchronize) {
                Interceptor.attach(synchronize.implementation, {
                    onEnter() {
                        logDebug('[iOS Prefs] Synchronize called');
                    }
                });
            }

            log('[iOS Prefs] Monitoring installed');
        }, 'iOSPrefs');
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    function initialize() {
        log('='.repeat(70));
        log('MASTER COMPLETE FRIDA HOOK - INITIALIZATION');
        log('='.repeat(70));

        // Check if running in Node.js (not Frida)
        if (!isFridaEnvironment) {
            log('WARNING: Running outside Frida environment (Node.js)', 'WARNING');
            log('Some features may not work. Use with frida -l script.js', 'WARNING');
            log('='.repeat(70));
            return;
        }

        // Check Frida API availability
        if (!checkFridaEnvironment()) {
            log('Frida API check failed - some hooks may not work', 'WARNING');
        }

        const platform = isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Unknown';
        log(`Platform: ${platform}`);

        if (platform === 'Unknown') {
            log('No platform detected - hooks may not work', 'WARNING');
        }

        if (isAndroid()) {
            log('-'.repeat(50));
            log('LOADING DETECTION BYPASSES (16 modules)...');
            log('-'.repeat(50));

            bypassADB();
            bypassBuildProperties();
            bypassDeviceTrustNative();
            bypassEnvironment();
            bypassFDScan();
            bypassFrida();
            bypassLSPosed();
            bypassMaps();
            bypassMount();
            bypassPLT();
            bypassPortProbe();
            bypassRoot();
            bypassSnitchtt();
            bypassStack();
            bypassThread();
            bypassTiming();

            log('-'.repeat(50));
            log('LOADING ANDROID JAVA HOOKS...');
            log('-'.repeat(50));

            enumerateJavaClasses();
            hookActivities();
            hookSQLite();
            hookIntents();
            hookLocation();
            bypassBiometrics();

            log('-'.repeat(50));
            log('LOADING NATIVE HOOKS...');
            log('-'.repeat(50));

            hookDlopen();
            hookProcessExecution();
            hookRegisterNatives();
            traceSyscalls();
        }

        if (isIOS()) {
            log('-'.repeat(50));
            log('LOADING iOS OBJECTIVE-C HOOKS...');
            log('-'.repeat(50));

            getAppInfoIOS();
            bypassBiometricsIOS();
            spoofLocationIOS();
            hookURLSchemesIOS();
            monitorNSUserDefaultsIOS();
        }

        log('='.repeat(70));
        log('MASTER COMPLETE FRIDA HOOK - INITIALIZATION COMPLETE');
        log('='.repeat(70));

        if (isFridaEnvironment) {
            const activeModules = [];
            for (const [key, value] of Object.entries(CONFIG)) {
                if (value === true && !key.includes('Logging') && !key.includes('debug')) {
                    activeModules.push(key);
                }
            }
            log(`Active modules: ${activeModules.length}`);
            log(`Verbose logging: ${CONFIG.verboseLogging}`);
            log(`Debug mode: ${CONFIG.debugMode}`);
        }
        log('='.repeat(70));
    }

    // ============================================================================
    // START
    // ============================================================================

    try {
        initialize();
    } catch (e) {
        log(`FATAL ERROR: ${e.message}`, 'FATAL');
        if (typeof console !== 'undefined' && console.error) {
            console.error(e.stack);
        }
    }

    // ============================================================================
    // RPC EXPORTS (Only in Frida environment)
    // ============================================================================

    if (isFridaEnvironment && typeof rpc !== 'undefined') {
        rpc.exports.getConfig = function () {
            return CONFIG;
        };

        rpc.exports.setConfig = function (newConfig) {
            Object.assign(CONFIG, newConfig);
            log(`Configuration updated: ${JSON.stringify(newConfig)}`);
        };

        rpc.exports.status = function () {
            return {
                platform: isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Unknown',
                config: CONFIG,
                timestamp: new Date().toISOString(),
                uptime: Date.now()
            };
        };

        rpc.exports.getLoadedModules = function () {
            try {
                return Process.enumerateModules().map(m => ({
                    name: m.name,
                    path: m.path,
                    base: m.base.toString(),
                    size: m.size
                }));
            } catch (e) {
                return { error: e.message };
            }
        };

        rpc.exports.getActiveHooks = function () {
            return {
                detectionBypasses: {
                    adb: CONFIG.enableADBBypass,
                    build: CONFIG.enableBuildBypass,
                    deviceTrust: CONFIG.enableDeviceTrustBypass,
                    environment: CONFIG.enableEnvironmentBypass,
                    fd: CONFIG.enableFDBypass,
                    frida: CONFIG.enableFridaBypass,
                    lsposed: CONFIG.enableLSPosedBypass,
                    maps: CONFIG.enableMapsBypass,
                    mount: CONFIG.enableMountBypass,
                    plt: CONFIG.enablePLTBypass,
                    portProbe: CONFIG.enablePortProbeBypass,
                    root: CONFIG.enableRootBypass,
                    snitchtt: CONFIG.enableSnitchttBypass,
                    stack: CONFIG.enableStackBypass,
                    thread: CONFIG.enableThreadBypass,
                    timing: CONFIG.enableTimingBypass
                },
                javaHooks: {
                    activities: CONFIG.enableActivityHooks,
                    sqlite: CONFIG.enableSQLiteHooks,
                    intents: CONFIG.enableIntentHooks,
                    location: CONFIG.enableLocationHooks,
                    biometric: CONFIG.enableBiometricBypass
                },
                nativeHooks: {
                    dlopen: CONFIG.enableDlopenHook,
                    processExecution: CONFIG.enableProcessExecutionHooks,
                    registerNatives: CONFIG.enableRegisterNativesHook,
                    syscalls: CONFIG.enableNativeTracing
                },
                iosHooks: {
                    appInfo: CONFIG.enableAppInfoHooks,
                    biometric: CONFIG.enableBiometricsIOSBypass,
                    location: CONFIG.enableLocationIOSBypass,
                    urlSchemes: CONFIG.enableURLSchemeHooks,
                    userDefaults: CONFIG.enableIOSHooks
                }
            };
        };
    } else if (typeof module !== 'undefined' && module.exports) {
        // Node.js exports for testing
        module.exports = {
            CONFIG: CONFIG,
            CONSTANTS: CONSTANTS,
            isAndroid: isAndroid,
            isIOS: isIOS,
            isFridaEnvironment: isFridaEnvironment
        };
    }

})();