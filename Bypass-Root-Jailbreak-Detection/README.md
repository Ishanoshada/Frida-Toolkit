# Bypass-Root-Jailbreak-Detection

## Purpose
This folder contains Frida scripts to bypass root detection, jailbreak detection, and anti-tampering protections on Android and iOS devices.

## Overview
Many applications refuse to run on rooted/jailbroken devices or implement countermeasures when tampering is detected. These scripts help security researchers and developers bypass such protections for legitimate security testing purposes.

## Common Use Cases
- **RootBeer Detection**: Bypass RootBeer library checks
- **Custom Root Checks**: Evade app-specific root detection
- **Frida Detection**: Hide Frida runtime from detection
- **ADB Detection**: Bypass ADB presence detection
- **SELinux/SafetyNet**: Bypass system integrity checks
- **Anti-Tampering**: Disable anti-tampering protections

## Scripts Included (113 total)

### Key Scripts
- `anti-root.js` - Generic anti-root bypass
- `bypass-root-detection.js` - Root detection general bypass
- `rootbeer-root-detection-bypass.js` - RootBeer library bypass
- `anti-frida-bypass.js` - Frida detection evasion
- `gantix-jail-monkey-anti-root-anti-frida-anti-adb-bypass.js` - Comprehensive multi-detection bypass

### Additional Implementations
- Various app-specific root detection bypasses (113 total scripts)
- Custom implementations for different frameworks
- Platform-specific variations

## Usage Examples

### Basic Root Detection Bypass
```bash
# Generic anti-root bypass
frida -U -f com.example.app -l anti-root.js --no-pause

# Alternative approach
frida -U -f com.example.app -l bypass-root-detection.js --no-pause
```

### RootBeer Specific
```bash
# RootBeer library bypass
frida -U -f com.example.app -l rootbeer-root-detection-bypass.js --no-pause
```

### Comprehensive Multi-Detection Bypass
```bash
# Bypass root, frida, and ADB detection simultaneously
frida -U -f com.example.app \
  -l gantix-jail-monkey-anti-root-anti-frida-anti-adb-bypass.js \
  --no-pause
```

### Combined Protections
```bash
# Multiple layers of bypass
frida -U -f com.example.app \
  -l anti-root.js \
  -l anti-frida-bypass.js \
  --no-pause
```

## Detection Types

### Root Detection Methods
- **File System Checks**: Bypassing `/system/su`, `/system/bin/su`
- **System Properties**: Modifying ro.secure, ro.debuggable
- **Process Lists**: Hiding root-related processes
- **SELinux Context**: Spoofing SELinux context
- **Build Fingerprint**: Spoofing device build info

### Jailbreak Detection (iOS)
- **File Existence**: Hiding Cydia, Substrate
- **URL Schemes**: Spoofing scheme availability
- **Process Inspection**: Hiding jailbreak processes
- **Sandbox Violations**: Masking sandbox escape attempts

### Runtime Detection
- **Frida Detection**: Process name/port hiding
- **ADB Detection**: ADB daemon presence
- **Debugger Detection**: Debugging capability masks
- **Tool Detection**: Xposed, SuperSU, Magisk detection

## Common Bypass Techniques

- **Hook System APIs**: Intercept system property queries
- **Return Value Manipulation**: Force "not rooted" responses
- **File System Manipulation**: Hide sensitive files/directories
- **Process Name Spoofing**: Rename detected processes
- **Build Property Modification**: Alter device properties
- **Native Function Patching**: Patch native-level checks

## Integration with Other Categories

Combine with these categories:
- **Hook-Java-Methods** - For Java-level detection bypass
- **Hook-Native-Functions** - For native-level detection
- **Bypass-Anti-Debug-Protections** - For debugger detection
- **Spoof-Device-Properties** - For device property manipulation

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Integrity Bypass | **Scripts**: 113 | **Platform**: Android, iOS | **Last Updated**: 2025
