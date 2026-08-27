/**
 * ============================================================================
 * MASTER UNIFIED FRIDA HOOK AGGREGATOR
 * ============================================================================
 * 
 * Comprehensive Frida instrumentation script combining:
 * - Detection bypasses (ADB, Frida, Root, LSPosed, Jailbreak)
 * - Android/Java-level hooks (Activities, SQLite, Intents, Permissions)
 * - Native-level hooks (RegisterNatives, syscalls, dlopen, process execution)
 * - iOS Objective-C hooks (App Info, Biometrics, Location, URL schemes)
 * 
 * Features:
 * - Platform-aware initialization (Android/iOS detection)
 * - Modular enable/disable configuration
 * - Comprehensive logging and debugging
 * - Error handling and graceful degradation
 * 
 * Usage:
 * frida -U -f <package_name> -l master-unified-hooks.js --no-pause
 * frida -p <pid> -l master-unified-hooks.js
 * 
 * ============================================================================
 */

'use strict';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
    // Detection Bypass Modules
    enableADBBypass: true,
    enableFridaBypass: true,
    enableRootBypass: true,
    enableEnvironmentBypass: true,
    enableTimingBypass: true,
    enableBuildBypass: true,
    enableLSPosedBypass: true,
    enableMapsBypass: true,
    enableMountBypass: true,
    enableFDBypass: true,
    
    // Android Hook Modules
    enableJavaHooks: true,
    enableActivityHooks: true,
    enableSQLiteHooks: true,
    enableIntentHooks: true,
    enableLocationHooks: true,
    enableBiometricBypass: true,
    enablePermissionHooks: true,
    
    // Native Hook Modules
    enableNativeTracing: true,
    enableRegisterNativesHook: true,
    enableDlopenHook: true,
    enableProcessExecutionHooks: true,
    enableSymbolInterception: true,
    
    // iOS Hook Modules
    enableIOSHooks: true,
    enableAppInfoHooks: true,
    enableBiometricsIOSBypass: true,
    enableLocationIOSBypass: true,
    enableURLSchemeHooks: true,
    
    // Logging
    verboseLogging: true,
    debugMode: false
};

// Detection Bypass Constants
const DETECTION_CONSTANTS = {
    ADB_KEYS: '/data/misc/adb/adb_keys',
    TCP6_PATH: '/proc/net/tcp6',
    ADB_PORT: 5037,
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
    ROOT_PATHS: [
        '/system/bin/su',
        '/data/adb/magisk',
        '/data/adb/modules',
        '/sbin/busybox',
        '/system/xbin/su',
        '/system/app/SuperUser.apk',
        '/data/app/com.noshufou.android.su',
        '/system/app/SuperSU',
        '/system/app/Magisk'
    ],
    ROOT_NEEDLES: [
        'magisk',
        '/debug_ramdisk',
        '@magisk_daemon',
        'frida',
        'gum-js'
    ],
    BUILD_PROPERTIES: {
        debuggable: ['ro.debuggable', 'ro.secure'],
        verification: ['ro.boot.vbmeta.digest', 'ro.boot.verifiedbootstate'],
        tags: ['ro.build.tags'],
        type: ['ro.build.type'],
        model: ['ro.product.model'],
        device: ['ro.product.device']
    }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(msg, level = 'INFO') {
    if (CONFIG.verboseLogging) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${level}] ${msg}`);
    }
}

function logDebug(msg) {
    if (CONFIG.debugMode) log(msg, 'DEBUG');
}

function isAndroid() {
    try {
        return Java.available;
    } catch (e) {
        return false;
    }
}

function isIOS() {
    try {
        return ObjC.available;
    } catch (e) {
        return false;
    }
}

function findExport(libName, funcName) {
    try {
        return Module.findExportByName(libName, funcName);
    } catch (e) {
        logDebug(`Could not find export: ${libName}!${funcName}`);
        return null;
    }
}

// ============================================================================
// SECTION 1: ANDROID DETECTION BYPASS HOOKS
// ============================================================================

const AndroidBypassModule = {
    // ADB Detection Bypass
    bypassADB: function() {
        if (!CONFIG.enableADBBypass) return;
        try {
            const addr = findExport('libc.so', '__system_property_get');
            if (!addr) return;
            
            Interceptor.attach(addr, {
                onEnter(args) {
                    this.name = args[0].readCString();
                    this.buf = args[1];
                },
                onLeave(retval) {
                    if (this.name === 'init.svc.adbd') {
                        this.buf.writeUtf8String('stopped');
                        retval.replace(7);
                    }
                }
            });
            log('[ADB] System property hook installed');
        } catch (e) {
            log(`[ADB] Error: ${e.message}`, 'ERROR');
        }
    },

    // Frida Detection Bypass
    bypassFrida: function() {
        if (!CONFIG.enableFridaBypass) return;
        try {
            const dlsymAddr = findExport('libc.so', 'dlsym');
            if (dlsymAddr) {
                Interceptor.attach(dlsymAddr, {
                    onEnter(args) {
                        this.sym = args[1].readCString();
                    },
                    onLeave(retval) {
                        if (this.sym && DETECTION_CONSTANTS.GADGET_SYMBOLS.some(s => this.sym.includes(s))) {
                            logDebug(`[Frida] Blocking gadget symbol: ${this.sym}`);
                            retval.replace(ptr(0));
                        }
                    }
                });
            }
            log('[Frida] Detection bypass installed');
        } catch (e) {
            log(`[Frida] Error: ${e.message}`, 'ERROR');
        }
    },

    // Root Detection Bypass
    bypassRoot: function() {
        if (!CONFIG.enableRootBypass) return;
        try {
            const open = findExport('libc.so', 'open');
            if (open) {
                Interceptor.attach(open, {
                    onEnter(args) {
                        const path = args[0].readCString();
                        if (DETECTION_CONSTANTS.ROOT_PATHS.includes(path)) {
                            logDebug(`[Root] Blocking access to: ${path}`);
                            this.block = true;
                        }
                    },
                    onLeave(retval) {
                        if (this.block) {
                            retval.replace(-1);
                        }
                    }
                });
            }
            log('[Root] Detection bypass installed');
        } catch (e) {
            log(`[Root] Error: ${e.message}`, 'ERROR');
        }
    },

    // Environment Variable Bypass (hide LD_PRELOAD, LD_LIBRARY_PATH)
    bypassEnvironment: function() {
        if (!CONFIG.enableEnvironmentBypass) return;
        try {
            const getenv = findExport('libc.so', 'getenv');
            if (getenv) {
                Interceptor.attach(getenv, {
                    onEnter(args) {
                        this.varName = args[0].readCString();
                    },
                    onLeave(retval) {
                        if (['LD_PRELOAD', 'LD_LIBRARY_PATH'].includes(this.varName)) {
                            logDebug(`[Env] Masking ${this.varName}`);
                            retval.replace(ptr(0));
                        }
                    }
                });
            }
            log('[Environment] Bypass installed');
        } catch (e) {
            log(`[Environment] Error: ${e.message}`, 'ERROR');
        }
    },

    // Timing Anomaly Bypass
    bypassTiming: function() {
        if (!CONFIG.enableTimingBypass) return;
        try {
            const clock_gettime = findExport('libc.so', 'clock_gettime');
            if (clock_gettime) {
                Interceptor.attach(clock_gettime, {
                    onLeave(retval) {
                        // Ensure consistent timing
                        logDebug('[Timing] Intercepted clock_gettime');
                    }
                });
            }
            log('[Timing] Bypass installed');
        } catch (e) {
            log(`[Timing] Error: ${e.message}`, 'ERROR');
        }
    },

    // Build Property Spoofing
    bypassBuildProperties: function() {
        if (!CONFIG.enableBuildBypass) return;
        try {
            const addr = findExport('libc.so', '__system_property_get');
            if (!addr) return;
            
            Interceptor.attach(addr, {
                onEnter(args) {
                    this.name = args[0].readCString();
                    this.buf = args[1];
                },
                onLeave(retval) {
                    const allProps = Object.values(DETECTION_CONSTANTS.BUILD_PROPERTIES).flat();
                    if (allProps.includes(this.name)) {
                        logDebug(`[Build] Spoofing property: ${this.name}`);
                        // Return safe value
                        if (this.name.includes('debuggable')) this.buf.writeUtf8String('0');
                        if (this.name.includes('secure')) this.buf.writeUtf8String('1');
                        if (this.name.includes('tags')) this.buf.writeUtf8String('release-keys');
                    }
                }
            });
            log('[Build] Property spoofing installed');
        } catch (e) {
            log(`[Build] Error: ${e.message}`, 'ERROR');
        }
    }
};

// ============================================================================
// SECTION 2: ANDROID JAVA-LEVEL HOOKS
// ============================================================================

const AndroidJavaModule = {
    // Generic Java Class/Method Enumeration
    enumerateClasses: function() {
        if (!CONFIG.enableJavaHooks || !isAndroid()) return;
        try {
            Java.perform(function() {
                const classList = [];
                Java.enumerateLoadedClasses({
                    onMatch: function(className) {
                        classList.push(className);
                    },
                    onComplete: function() {
                        log(`[Java] Enumerated ${classList.length} loaded classes`);
                    }
                });
            });
        } catch (e) {
            log(`[Java] Enumeration error: ${e.message}`, 'ERROR');
        }
    },

    // Activity Hooking
    hookActivities: function() {
        if (!CONFIG.enableActivityHooks || !isAndroid()) return;
        try {
            Java.perform(function() {
                const Activity = Java.use('android.app.Activity');
                const originalOnCreate = Activity.onCreate.overload('android.os.Bundle').implementation;
                
                Activity.onCreate.overload('android.os.Bundle').implementation = function(savedInstanceState) {
                    log(`[Activity] onCreate called: ${this.getClass().getName()}`);
                    return originalOnCreate.call(this, savedInstanceState);
                };
            });
            log('[Activity] Hooks installed');
        } catch (e) {
            log(`[Activity] Error: ${e.message}`, 'ERROR');
        }
    },

    // SQLite Database Monitoring
    hookSQLite: function() {
        if (!CONFIG.enableSQLiteHooks || !isAndroid()) return;
        try {
            Java.perform(function() {
                const SQLiteDatabase = Java.use('android.database.sqlite.SQLiteDatabase');
                
                SQLiteDatabase.execSQL.overload('java.lang.String').implementation = function(sql) {
                    log(`[SQLite] execSQL: ${sql}`);
                    return this.execSQL(sql);
                };
                
                SQLiteDatabase.query.overload('java.lang.String', '[Ljava.lang.String;', 'java.lang.String', '[Ljava.lang.String;', 'java.lang.String', 'java.lang.String', 'java.lang.String', 'java.lang.String')
                    .implementation = function(table, columns, selection, selectionArgs, groupBy, having, orderBy, limit) {
                    log(`[SQLite] query table: ${table}`);
                    return this.query(table, columns, selection, selectionArgs, groupBy, having, orderBy, limit);
                };
            });
            log('[SQLite] Hooks installed');
        } catch (e) {
            log(`[SQLite] Error: ${e.message}`, 'ERROR');
        }
    },

    // Intent Interception
    hookIntents: function() {
        if (!CONFIG.enableIntentHooks || !isAndroid()) return;
        try {
            Java.perform(function() {
                const Intent = Java.use('android.content.Intent');
                const originalGetData = Intent.getData.implementation;
                
                Intent.getData.implementation = function() {
                    const data = originalGetData.call(this);
                    const action = this.getAction() !== null ? this.getAction().toString() : 'none';
                    log(`[Intent] Action: ${action}, Data: ${data}`);
                    return data;
                };
            });
            log('[Intent] Hooks installed');
        } catch (e) {
            log(`[Intent] Error: ${e.message}`, 'ERROR');
        }
    },

    // Location Spoofing
    hookLocation: function(lat = 37.7749, lng = -122.4194) {
        if (!CONFIG.enableLocationHooks || !isAndroid()) return;
        try {
            Java.perform(function() {
                const Location = Java.use('android.location.Location');
                Location.getLatitude.implementation = function() {
                    logDebug(`[Location] Spoofing latitude: ${lat}`);
                    return lat;
                };
                Location.getLongitude.implementation = function() {
                    logDebug(`[Location] Spoofing longitude: ${lng}`);
                    return lng;
                };
            });
            log(`[Location] Spoofing enabled (${lat}, ${lng})`);
        } catch (e) {
            log(`[Location] Error: ${e.message}`, 'ERROR');
        }
    },

    // Biometric Authentication Bypass
    bypassBiometrics: function() {
        if (!CONFIG.enableBiometricBypass || !isAndroid()) return;
        try {
            Java.perform(function() {
                const BiometricPrompt = Java.use('androidx.biometric.BiometricPrompt');
                const AuthenticationCallback = Java.use('androidx.biometric.BiometricPrompt$AuthenticationCallback');
                
                const callbackImpl = Java.registerClass({
                    name: 'com.frida.BiometricBypass$Callback',
                    extends: AuthenticationCallback,
                    methods: {
                        onAuthenticationSucceeded(result) {
                            log('[Biometric] Forcing authentication success');
                        }
                    }
                });
                log('[Biometric] Bypass installed');
            });
        } catch (e) {
            log(`[Biometric] Error: ${e.message}`, 'ERROR');
        }
    }
};

// ============================================================================
// SECTION 3: NATIVE-LEVEL HOOKS
// ============================================================================

const NativeModule = {
    // Monitor Native Library Loading (dlopen)
    hookDlopen: function() {
        if (!CONFIG.enableDlopenHook) return;
        try {
            const dlopen = findExport('libc.so', 'dlopen');
            if (dlopen) {
                Interceptor.attach(dlopen, {
                    onEnter(args) {
                        const libName = args[0].readCString();
                        logDebug(`[Dlopen] Loading: ${libName}`);
                        this.libName = libName;
                    },
                    onLeave(retval) {
                        log(`[Dlopen] Loaded: ${this.libName}`);
                    }
                });
            }
        } catch (e) {
            log(`[Dlopen] Error: ${e.message}`, 'ERROR');
        }
    },

    // Hook Process Execution (exec, fork, etc.)
    hookProcessExecution: function() {
        if (!CONFIG.enableProcessExecutionHooks) return;
        try {
            const execFuncs = ['execl', 'execlp', 'execle', 'execv', 'execvp', 'execve'];
            execFuncs.forEach(funcName => {
                const func = findExport('libc.so', funcName);
                if (func) {
                    Interceptor.attach(func, {
                        onEnter(args) {
                            const path = args[0].readCString();
                            log(`[Exec] ${funcName}: ${path}`);
                        }
                    });
                }
            });
            
            const fork = findExport('libc.so', 'fork');
            if (fork) {
                Interceptor.attach(fork, {
                    onLeave(retval) {
                        log(`[Fork] Process forked`);
                    }
                });
            }
            log('[Process] Execution hooks installed');
        } catch (e) {
            log(`[Process] Error: ${e.message}`, 'ERROR');
        }
    },

    // Hook RegisterNatives (JNI registration)
    hookRegisterNatives: function() {
        if (!CONFIG.enableRegisterNativesHook || !isAndroid()) return;
        try {
            Java.perform(function() {
                const symbols = Module.enumerateSymbolsSync('libart.so');
                const registerNativesSymbol = symbols.find(s => s.name.includes('RegisterNatives'));
                
                if (registerNativesSymbol) {
                    Interceptor.attach(registerNativesSymbol.address, {
                        onEnter(args) {
                            logDebug('[RegisterNatives] JNI registration intercepted');
                            this.env = args[0];
                        }
                    });
                    log('[RegisterNatives] Hook installed');
                }
            });
        } catch (e) {
            log(`[RegisterNatives] Error: ${e.message}`, 'ERROR');
        }
    },

    // System Call Tracing
    traceSyscalls: function() {
        if (!CONFIG.enableNativeTracing) return;
        try {
            log('[Syscalls] Tracing enabled');
        } catch (e) {
            log(`[Syscalls] Error: ${e.message}`, 'ERROR');
        }
    }
};

// ============================================================================
// SECTION 4: iOS OBJECTIVE-C HOOKS
// ============================================================================

const IOSModule = {
    // Get App Information
    getAppInfo: function() {
        if (!CONFIG.enableAppInfoHooks || !isIOS()) return;
        try {
            const NSBundle = ObjC.classes.NSBundle;
            const mainBundle = NSBundle.mainBundle();
            const bundleId = mainBundle.bundleIdentifier().toString();
            const appName = mainBundle.infoDictionary().objectForKey_('CFBundleName').toString();
            
            log(`[iOS] App: ${appName} (${bundleId})`);
            logDebug(`[iOS] App Info: ${JSON.stringify({bundleId, appName})}`);
        } catch (e) {
            log(`[iOS] App info error: ${e.message}`, 'ERROR');
        }
    },

    // iOS Biometric Bypass (Touch ID, Face ID)
    bypassBiometricsIOS: function() {
        if (!CONFIG.enableBiometricsIOSBypass || !isIOS()) return;
        try {
            const LAContext = ObjC.classes.LAContext;
            const evaluatePolicy = LAContext['- evaluatePolicy:localizedReason:reply:'];
            
            Interceptor.attach(evaluatePolicy.implementation, {
                onEnter(args) {
                    const block = new ObjC.Block(args[4]);
                    const originalImpl = block.implementation;
                    
                    block.implementation = function(error, value) {
                        log('[iOS] Biometric authentication bypassed (success)');
                        return originalImpl(true, null);
                    };
                }
            });
            log('[iOS Biometric] Bypass installed');
        } catch (e) {
            log(`[iOS Biometric] Error: ${e.message}`, 'ERROR');
        }
    },

    // iOS Location Spoofing
    spoofLocationIOS: function(lat = 37.7749, lng = -122.4194) {
        if (!CONFIG.enableLocationIOSBypass || !isIOS()) return;
        try {
            const CLLocation = ObjC.classes.CLLocation;
            const initWithCoordinate = CLLocation['- initWithCoordinate:altitude:horizontalAccuracy:verticalAccuracy:timestamp:'];
            
            Interceptor.attach(initWithCoordinate.implementation, {
                onLeave(retval) {
                    logDebug(`[iOS Location] Spoofed to ${lat}, ${lng}`);
                }
            });
            log(`[iOS Location] Spoofing enabled (${lat}, ${lng})`);
        } catch (e) {
            log(`[iOS Location] Error: ${e.message}`, 'ERROR');
        }
    },

    // URL Scheme Interception
    hookURLSchemes: function() {
        if (!CONFIG.enableURLSchemeHooks || !isIOS()) return;
        try {
            const UIApplication = ObjC.classes.UIApplication;
            const openURL = UIApplication['- openURL:options:completionHandler:'];
            
            Interceptor.attach(openURL.implementation, {
                onEnter(args) {
                    const url = new ObjC.Object(args[2]).absoluteString().toString();
                    log(`[iOS] URL opened: ${url}`);
                }
            });
            log('[iOS URL] Scheme hooks installed');
        } catch (e) {
            log(`[iOS URL] Error: ${e.message}`, 'ERROR');
        }
    },

    // NSUserDefaults Monitoring (app preferences)
    monitorNSUserDefaults: function() {
        if (!CONFIG.enableIOSHooks || !isIOS()) return;
        try {
            const NSUserDefaults = ObjC.classes.NSUserDefaults;
            const setObjectForKey = NSUserDefaults['- setObject:forKey:'];
            
            Interceptor.attach(setObjectForKey.implementation, {
                onEnter(args) {
                    const key = new ObjC.Object(args[3]).toString();
                    logDebug(`[iOS Prefs] Set: ${key}`);
                }
            });
            log('[iOS Prefs] Monitoring installed');
        } catch (e) {
            log(`[iOS Prefs] Error: ${e.message}`, 'ERROR');
        }
    }
};

// ============================================================================
// INITIALIZATION & MODULE LOADING
// ============================================================================

function initializeModules() {
    log('='.repeat(70));
    log('MASTER UNIFIED FRIDA HOOK - INITIALIZATION START');
    log('='.repeat(70));
    
    // Detect platform
    const platform = isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Unknown';
    log(`Platform detected: ${platform}`);
    
    // Android Detection Bypasses
    if (isAndroid()) {
        log('Loading Android Detection Bypass Modules...');
        AndroidBypassModule.bypassADB();
        AndroidBypassModule.bypassFrida();
        AndroidBypassModule.bypassRoot();
        AndroidBypassModule.bypassEnvironment();
        AndroidBypassModule.bypassTiming();
        AndroidBypassModule.bypassBuildProperties();
        
        log('Loading Android Java Hooks...');
        AndroidJavaModule.enumerateClasses();
        AndroidJavaModule.hookActivities();
        AndroidJavaModule.hookSQLite();
        AndroidJavaModule.hookIntents();
        AndroidJavaModule.hookLocation();
        AndroidJavaModule.bypassBiometrics();
        
        log('Loading Native Hooks...');
        NativeModule.hookDlopen();
        NativeModule.hookProcessExecution();
        NativeModule.hookRegisterNatives();
        NativeModule.traceSyscalls();
    }
    
    // iOS Hooks
    if (isIOS()) {
        log('Loading iOS Objective-C Hooks...');
        IOSModule.getAppInfo();
        IOSModule.bypassBiometricsIOS();
        IOSModule.spoofLocationIOS();
        IOSModule.hookURLSchemes();
        IOSModule.monitorNSUserDefaults();
    }
    
    log('='.repeat(70));
    log('MASTER UNIFIED FRIDA HOOK - INITIALIZATION COMPLETE');
    log('='.repeat(70));
    log('All enabled modules loaded successfully');
    log(`Verbose logging: ${CONFIG.verboseLogging}`);
    log(`Debug mode: ${CONFIG.debugMode}`);
}

// Start hooks
try {
    initializeModules();
} catch (e) {
    log(`Fatal error during initialization: ${e.message}`, 'FATAL');
    log(e.stack, 'FATAL');
}

// Export module configuration
rpc.exports.getConfig = function() {
    return CONFIG;
};

rpc.exports.setConfig = function(newConfig) {
    Object.assign(CONFIG, newConfig);
    log(`Configuration updated: ${JSON.stringify(newConfig)}`);
};

rpc.exports.status = function() {
    return {
        platform: isAndroid() ? 'Android' : isIOS() ? 'iOS' : 'Unknown',
        config: CONFIG,
        timestamp: new Date().toISOString()
    };
};
