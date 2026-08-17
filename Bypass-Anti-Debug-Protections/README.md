# Bypass-Anti-Debug-Protections

## Purpose
This folder contains Frida scripts to bypass debugger detection and anti-debug protections in Android and iOS applications.

## Overview
Many applications implement detection mechanisms to prevent debuggers from attaching. These scripts help security researchers and developers bypass such protections for legitimate penetration testing and security research purposes.

## Common Use Cases
- **Debugger Detection Bypass**: Bypass `isDebuggerConnected()` and similar checks
- **Debug Port Detection**: Evade checks for open debug ports
- **Debugging Capability Checks**: Disable capability checks for debugging features
- **Anti-Tampering**: Bypass anti-tampering protections that trigger on debug mode

## Scripts Included (24 total)
- `android-debug-mode-bypass.js` - Generic Android debug mode bypass
- `anti-debug-bypass.js` - Core anti-debug protection bypass
- `app-context-bypass.js` - Application context manipulation
- `backtraces.js` - Backtrace analysis and logging
- `cordova-enable-webview-debugging.js` - Enable Cordova WebView debugging
- `cryptoswiftsha1.js` - Swift crypto/SHA1 hooks
- `debug-webview.js` - WebView debug interface
- `dynamichooks.js` - Dynamic hook loading
- `everything.js` - Comprehensive bypass script
- `ios-app-static-analysis.js` - iOS static analysis hooks
- `ios-backtrace-http-req.js` - iOS HTTP request backtraces
- `ios-hook-classes-methods.js` - iOS class/method hooking
- `ios-sqlite3.js` - iOS SQLite3 operations
- `ipa-dynamic-check.js` - IPA dynamic checking bypass
- `jailmonkey-bypass.js` - JailMonkey detection bypass
- `logall.js` - Comprehensive logging mechanism
- `native-request-module-offset-finder.js` - Native module offset discovery
- `onerule-by-h4rithd.js` - Custom bypass implementation
- `script.js` - Generic bypass script
- `stalker-event-parser.js` - Event stalking and parsing
- `swiftstring.js` - Swift string manipulation
- `trace-registernatives.js` - Native function registration tracing
- `uncrackable1-solution.js` - Uncrackable app solution
- `virtual-cam-decrypt.js` - Virtual camera decryption

## Usage Examples

### Basic Usage
```bash
# Load anti-debug bypass on Android device
frida -U -f com.example.app -l anti-debug-bypass.js --no-pause

# Comprehensive bypass
frida -U -f com.example.app -l everything.js --no-pause
```

### iOS-Specific
```bash
# iOS anti-debug bypass
frida -U -f com.example.app -l ios-app-static-analysis.js --no-pause
```

### Multiple Protections
```bash
# Combine multiple bypass techniques
frida -U -f com.example.app \
  -l anti-debug-bypass.js \
  -l logall.js \
  --no-pause
```

### With Logging
```bash
# Enable verbose logging while bypassing
frida -U -f com.example.app \
  -l anti-debug-bypass.js \
  -l stalker-event-parser.js \
  --no-pause
```

## Key Techniques

- **Hook Detection Methods**: Intercept debugger detection function calls
- **Return Value Manipulation**: Force detection methods to return "not debugged"
- **Native Function Patching**: Patch native-level debug detection
- **Event Monitoring**: Observe debug-related system events
- **Context Manipulation**: Alter application context to hide debug state

## Integration with Other Categories

Combine with these categories for comprehensive app analysis:
- **Hook-Java-Methods** - For generic method hooking
- **Hook-Native-Functions** - For native-level debugging
- **Bypass-Root-Jailbreak-Detection** - For device integrity checks

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Security Bypass | **Scripts**: 24 | **Platform**: Android, iOS | **Last Updated**: 2025
