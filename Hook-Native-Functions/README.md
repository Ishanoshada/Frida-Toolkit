# Hook-Native-Functions

## Purpose
This folder contains Frida scripts for hooking and instrumenting native C/C++ functions in Android and iOS applications.

## Overview
Many apps use native libraries for performance and security. These scripts enable interception of native function calls, monitoring of system-level operations, and manipulation of native code behavior.

## Common Use Cases
- **libc Function Hooking**: Hook standard C library functions
- **JNI Bridge Monitoring**: Observe Java-Native Interface communication
- **Memory Operation Hooking**: Monitor malloc, free, memcpy
- **System Call Tracing**: Track system calls (syscalls)
- **Native Crypto Hooking**: Intercept native encryption/decryption
- **Library Exploration**: Map native library functions

## Scripts Included (12 total)
- `android-arm64-strace.js` - ARM64 system call tracing
- `android-native-interceptor.js` - Generic native function interception
- `jnitrace.invalid.js.txt` - Preserved invalid legacy source; not runnable
- And 9 additional native hooking utilities

## Usage Examples

### Basic Native Hooking
```bash
# Load native function interceptor
frida -U -f com.example.app -l android-native-interceptor.js --no-pause
```

### JNI Tracing
The bundled `jnitrace` source is preserved as text because it does not parse as
valid JavaScript; it is not a runnable Frida script.

### ARM64 System Call Tracing
```bash
# Monitor system calls on ARM64 devices
frida -U -f com.example.app -l android-arm64-strace.js --no-pause
```

### Combined Native Analysis
```bash
# Native monitoring
frida -U -f com.example.app \
  -l android-native-interceptor.js \
  --no-pause
```

## Key Techniques

### libc Function Hooking
```javascript
// Hook memory allocation
Frida.Interceptor.attach(Module.findExportByName('libc.so', 'malloc'), {
    onEnter: function(args) {
        console.log('[malloc] size:', args[0]);
    },
    onLeave: function(retval) {
        console.log('[malloc] returned:', retval);
    }
});
```

### JNI Function Interception
```javascript
// Hook JNI calls
Java.use('java.lang.Runtime')
    .loadLibrary
    .implementation = function(name) {
        console.log('[JNI] Loading library:', name);
        return this.loadLibrary(name);
    };
```

### System Call Tracing
```javascript
// Monitor system calls
Frida.Interceptor.attach(Module.findExportByName(null, 'syscall'), {
    onEnter: function(args) {
        console.log('[syscall]', args[0]);
    }
});
```

## Common Native Targets

### libc Functions
- `malloc()` - Memory allocation
- `free()` - Memory deallocation
- `memcpy()` - Memory copying
- `strlen()` - String length
- `strncpy()` - String copying

### Android-Specific
- `dlopen()` - Dynamic library loading
- `dlsym()` - Symbol resolution
- `JNI_OnLoad()` - JNI initialization
- `RegisterNatives()` - JNI registration

### Crypto Libraries
- `OpenSSL` functions (SSL_read, SSL_write)
- `mbedTLS` functions
- `Conscrypt` (Android's cryptography provider)
- Native hash functions (MD5, SHA)

## Native Library Analysis

### Finding Libraries
```bash
# List native libraries in app
adb shell find /data/app/com.example.app -name "*.so"

# Or via Frida
frida -U -f com.example.app -l "
Java.perform(function() {
    var mod = Process.getModuleByName('libc.so');
    console.log('libc base:', mod.base);
    console.log('libc size:', mod.size);
});
"
```

### Symbol Discovery
```bash
# Find exported functions
readelf -s libnative.so | grep -i encrypt

# Or in Frida
Module.findExportByName('libnative.so', 'encrypt_data')
```

## ARM/Architecture Considerations

- **ARM64**: Most modern Android devices (64-bit)
- **ARMv7**: Older Android devices (32-bit)
- **x86/x86_64**: Android emulators
- **Apple Silicon**: iOS devices (ARM64)

## Performance Monitoring

Use native hooking to measure:
- Function execution time
- Memory allocation patterns
- CPU usage
- System call frequency
- Network operations

## Integration with Other Categories

Combine with these categories:
- **Intercept-Crypto-Operations** - Analyze native crypto
- **Hook-Java-Methods** - Monitor Java-Native calls
- **Intercept-Network-Traffic** - Trace network syscalls

## Troubleshooting

**Issue**: Can't find native function
```bash
# Use rabin2 or readelf to verify symbols
nm libnative.so | grep function_name
```

**Issue**: Hook not triggering
- Verify library is loaded: `frida -U com.example.app -e "Module.enumerateExports('libc.so')"`
- Check function name/signature
- Verify timing (hook early)

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Native Instrumentation | **Scripts**: 12 | **Platform**: Android, iOS | **Last Updated**: 2025
