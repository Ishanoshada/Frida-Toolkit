# iOS-Specific-Hooks

## Purpose
This folder contains Frida scripts specifically designed for iOS and Objective-C application analysis and manipulation.

## Overview
iOS apps have unique security mechanisms and frameworks. These scripts target iOS-specific APIs, Objective-C runtime features, and common iOS security checks for penetration testing and security research.

## Common Use Cases
- **Jailbreak Detection Bypass**: Bypass detection of jailbroken devices
- **iOS-Specific SSL Pinning**: Bypass certificate pinning on iOS
- **Touch ID/Face ID Bypass**: Bypass biometric authentication
- **App Store Checks**: Bypass app store validity checks
- **Objective-C Method Hooking**: Intercept Objective-C method calls
- **iOS Native Crypto**: Hook iOS cryptographic operations

## Scripts Included (30 total)

### Key Scripts
- `ios-jailbreak-detection-bypass.js` - iOS jailbreak detection bypass
- `ios-ssl-bypass.js` - iOS SSL/TLS certificate pinning bypass
- `ios-biometric-bypass.js` - Touch ID/Face ID bypass
- `ios-app-all-classes-methods-hooks.js` - Comprehensive class/method enumeration
- And 26 additional iOS-specific implementations

## Usage Examples

### Jailbreak Detection Bypass
```bash
# Bypass iOS jailbreak detection
frida -U -f com.example.app -l ios-jailbreak-detection-bypass.js --no-pause
```

### SSL Pinning Bypass
```bash
# Bypass iOS SSL certificate pinning
frida -U -f com.example.app -l ios-ssl-bypass.js --no-pause
```

### Biometric Bypass
```bash
# Bypass Touch ID/Face ID
frida -U -f com.example.app -l ios-biometric-bypass.js --no-pause
```

### Enumerate All Classes
```bash
# List all loaded classes and methods
frida -U -f com.example.app \
  -l ios-app-all-classes-methods-hooks.js \
  --no-pause
```

### Comprehensive iOS Analysis
```bash
# Multiple iOS-specific hooks
frida -U -f com.example.app \
  -l ios-jailbreak-detection-bypass.js \
  -l ios-ssl-bypass.js \
  -l ios-biometric-bypass.js \
  --no-pause
```

## iOS-Specific Frameworks

### Security Frameworks
- **LocalAuthentication.framework** - Touch ID/Face ID
- **Security.framework** - Cryptography and certificates
- **CommonCrypto** - Low-level crypto operations
- **CryptoKit** - Modern crypto APIs (iOS 13+)

### Network Frameworks
- **Foundation.framework** - URLSession, NSURLRequest
- **Network.framework** - Modern networking (iOS 12+)
- **CFNetwork** - Lower-level networking

### Storage Frameworks
- **Foundation.framework** - UserDefaults, file system
- **CoreData** - Structured data storage
- **SQLite3** - Direct database access
- **Keychain Services** - Secure credential storage

## Objective-C Runtime

### Key Concepts
- **ObjC Classes**: Represented as pointers in memory
- **ObjC Methods**: SEL (selector) + IMP (implementation)
- **ObjC Runtime**: Reflection and dynamic method calls
- **Message Passing**: `[object method:param]` → objc_msgSend()

### Hooking ObjC Methods
```javascript
// Hook Objective-C method
ObjC.classes.NSURLSession['dataTaskWithRequest:']
    .implementation = SwiftUtils.wrap(
        function(request) {
            console.log('[URLSession] Request:', request);
            return this['dataTaskWithRequest:'](request);
        }
    );
```

## Common Jailbreak Indicators

### File System Checks
- `/Applications/Cydia.app` - Cydia package manager
- `/usr/sbin/sshd` - SSH daemon
- `/private/var/lib/apt/` - Package management
- `/var/cache/apt` - APT package cache

### Process Checks
- `launchd` - Jailbreak tweaks
- `Substrate` - Code injection framework
- `SSH` processes - Remote access

### Functionality Checks
- URL schemes (cydia://)
- File read permissions
- Dynamic library injection capability

## iOS SSL Pinning Bypass

### NSURLSessionDelegate
```javascript
// Override URLSessionDelegate methods
ObjC.classes.NSURLSessionDelegate
    .certificateValidation
    .implementation = function() {
        console.log('[SSL] Certificate validation bypassed');
        return true;  // Always trust
    };
```

### URLSessionDelegate Protocol
```javascript
// Implement URLSessionDelegate
ObjC.classes.URLSessionDelegate['URLSession:didReceiveChallenge:completionHandler:']
    .implementation = function(session, challenge, handler) {
        console.log('[SSL] Challenge received');
        handler(NSURLSessionAuthChallengeUseCredential, 
                NSURLCredentialCreate(/*...*/));
    };
```

## Touch ID/Face ID Bypass

### LocalAuthentication Framework
```javascript
// Hook LAContext
ObjC.classes.LAContext['evaluatePolicy:localizedReason:reply:']
    .implementation = function(policy, reason, reply) {
        console.log('[Biometric] Bypassed');
        reply(true, null);  // Success
    };
```

## iOS Version Considerations

- **iOS 14+**: Increased privacy restrictions
- **iOS 13+**: CryptoKit framework introduced
- **iOS 12+**: Network.framework available
- **iOS 11+**: UserNotificationCenter framework
- **Older**: Different API availability

## Frida on iOS

### Requirements
- Jailbroken device (for Frida server)
- Frida tools on computer
- Network connectivity

### Connection Methods
```bash
# SSH connection
frida-ls-devices

# USB connection
frida -U -l script.js

# Remote connection
frida -H 192.168.1.100:27042 -l script.js
```

## SwiftUI vs UIKit

### UIKit (Traditional)
- `UIViewController`
- `UIView`
- Delegate patterns

### SwiftUI (Modern)
- Struct-based views
- Different hooking approach
- Swift runtime differences

## Integration with Other Categories

Combine with these categories:
- **Bypass-Root-Jailbreak-Detection** - General jailbreak bypass
- **Bypass-SSL-Certificate-Pinning** - SSL pinning bypass
- **Bypass-Biometric-Authentication** - Biometric bypass
- **Hook-Native-Functions** - Native iOS hooking

## Testing Workflow

```bash
# 1. Prepare Frida on jailbroken device
# SSH to device, start Frida server

# 2. Launch app with bypass scripts
frida -U -f com.example.app \
  -l ios-jailbreak-detection-bypass.js \
  --no-pause

# 3. Use app features
# (Login, access protected features)

# 4. Analyze behavior
# Observe whether protections are bypassed

# 5. Modify as needed
# Adjust scripts for app-specific checks
```

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: iOS Analysis | **Scripts**: 30 | **Platform**: iOS | **Last Updated**: 2025
