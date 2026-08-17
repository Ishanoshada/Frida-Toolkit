# Bypass-Biometric-Authentication

## Purpose
This folder contains Frida scripts to bypass biometric authentication mechanisms including fingerprint, face recognition, and Touch ID/Face ID on Android and iOS applications.

## Overview
Biometric authentication is a strong security measure, but security researchers need ways to test application behavior when biometric verification fails or is bypassed. These scripts intercept and modify biometric authentication flows.

## Common Use Cases
- **Fingerprint Bypass**: Bypass fingerprint recognition without enrollment
- **Face Unlock Bypass**: Bypass face recognition authentication
- **Touch ID/Face ID Bypass**: iOS biometric authentication bypass
- **Biometric Object Nullification**: Null out biometric crypto objects
- **Authentication Flow Testing**: Test app behavior on biometric failures

## Scripts Included (13 total)
- `fingerprint-bypass.js` - Generic fingerprint recognition bypass
- `ios-touch-id-bypass.js` - iOS Touch ID bypass
- `biometric-authentication-bypass.js` - Universal biometric bypass
- `universal-android-biometric-bypass.js` - Android biometric universal bypass
- And 9 additional specialized implementations

## Usage Examples

### Android Fingerprint Bypass
```bash
# Load fingerprint bypass script
frida -U -f com.example.app -l fingerprint-bypass.js --no-pause

# Universal Android biometric bypass
frida -U -f com.example.app -l universal-android-biometric-bypass.js --no-pause
```

### iOS Touch ID/Face ID Bypass
```bash
# iOS Touch ID bypass
frida -U -f com.example.app -l ios-touch-id-bypass.js --no-pause

# iOS universal biometric
frida -U -f com.example.app -l biometric-authentication-bypass.js --no-pause
```

### Testing Authentication Flow
```bash
# Test app behavior with biometric bypass
frida -U -f com.example.app \
  -l biometric-authentication-bypass.js \
  --no-pause
```

## Key Techniques

- **BiometricPrompt Hooking**: Intercept BiometricPrompt authentication callbacks
- **Authentication Callback Interception**: Force successful authentication callbacks
- **Crypto Object Manipulation**: Nullify or replace biometric crypto operations
- **System Authentication Service Hooking**: Direct system service interception
- **Keystore Integration**: Bypass keystore-backed biometric verification

## Common Targets

### Android
- `android.hardware.biometrics.BiometricPrompt`
- `androidx.biometric.BiometricPrompt`
- `com.android.internal.os.Zygote`
- Fingerprint verification callbacks

### iOS
- `LocalAuthentication.framework`
- `Touch ID` APIs
- `Face ID` APIs
- LAContext methods

## Integration with Other Categories

Combine with these categories for comprehensive testing:
- **Hook-Java-Methods** - For Android method interception
- **Bypass-Root-Jailbreak-Detection** - For device integrity
- **Hook-Native-Functions** - For native-level auth hooks

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Authentication Bypass | **Scripts**: 13 | **Platform**: Android, iOS | **Last Updated**: 2025
