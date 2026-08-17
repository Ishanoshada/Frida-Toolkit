# Spoof-Device-Properties

## Purpose
This folder contains Frida scripts for spoofing and modifying device properties including IMEI, Android ID, build information, and device fingerprint.

## Overview
Apps often check device properties for validation, analytics, and fraud detection. These scripts enable modification of device identifiers and properties for testing app behavior under different device configurations.

## Common Use Cases
- **IMEI Spoofing**: Change International Mobile Equipment Identity
- **Android ID Modification**: Modify unique device identifier
- **Build Property Spoofing**: Change device brand, model, Android version
- **Device Fingerprint Alteration**: Spoof unique device fingerprint
- **Emulator Detection Bypass**: Hide emulator signatures
- **Device Property Replacement**: Override system property queries

## Scripts Included (6 total)
- `device-parameter.js` - Generic device parameter modification
- `bypass_emulator.js` - Emulator detection bypass
- And 4 additional device spoofing implementations

## Usage Examples

### Basic Device Property Spoofing
```bash
# Spoof device properties
frida -U -f com.example.app -l device-parameter.js --no-pause
```

### Emulator Detection Bypass
```bash
# Hide emulator signatures
frida -U -f com.example.app -l bypass_emulator.js --no-pause
```

### Combined Device Spoofing
```bash
# Multiple property modifications
frida -U -f com.example.app \
  -l device-parameter.js \
  -l bypass_emulator.js \
  --no-pause
```

## Key Techniques

### IMEI Spoofing
```javascript
// Hook IMEI retrieval
Java.use('android.telephony.TelephonyManager')
    .getDeviceId
    .implementation = function() {
        let spoofed = '123456789012345';
        console.log('[IMEI] Spoofed to:', spoofed);
        return spoofed;
    };
```

### Android ID Modification
```javascript
// Spoof Android ID
Java.use('android.provider.Settings$Secure')
    .getString
    .overload('android.content.ContentResolver', 'java.lang.String')
    .implementation = function(resolver, key) {
        if (key == 'android_id') {
            let spoofed = '1234567890abcdef';
            console.log('[AndroidID] Spoofed');
            return spoofed;
        }
        return this.getString(resolver, key);
    };
```

### Build Property Spoofing
```javascript
// Modify build properties
Java.use('android.os.Build')
    .BRAND
    .value = 'SpoofedBrand';

Java.use('android.os.Build')
    .MODEL
    .value = 'SpoofedModel';
```

## Device Properties

### IMEI (International Mobile Equipment Identity)
- **Length**: 15 digits
- **Format**: RRRRR MMMMMMM SSSSSS C
  - RRRRR: Type Allocation Code (TAC)
  - MMMMMMM: Manufacturer
  - SSSSSS: Serial number
  - C: Check digit
- **Usage**: Device identification, carrier networks

### Android ID
- **Format**: 16 hexadecimal characters
- **Generated**: At first boot
- **Storage**: Settings.Secure.ANDROID_ID
- **Usage**: Unique device identifier

### Build Properties
- **BRAND**: Device manufacturer brand
- **MODEL**: Device model number
- **DEVICE**: Device codename
- **FINGERPRINT**: Build fingerprint (unique identifier)
- **VERSION**: Android version

### IMSI (International Mobile Subscriber Identity)
- **Carrier**: SIM card identifier
- **Provider**: Mobile network operator
- **Accessible**: Via TelephonyManager

## Emulator Detection

### Common Emulator Signatures
- **Files**: `/system/bin/qemu-props`
- **Devices**: `/dev/qemu_pipe`
- **Build**: ro.kernel.qemu, ro.emulator
- **Properties**: ro.boot.serialno contains "emulator"
- **Features**: Missing NFC, missing camera hardware

### Bypass Techniques
```javascript
// Hide emulator signatures
Java.use('android.os.Build')
    .FINGERPRINT
    .value = 'realdevice/fingerprint/valid:11/RP1A.200720.011/1234567:user/release-keys';

Java.use('android.os.Build')
    .PRODUCT
    .value = 'realdevice';
```

## Analytics & Fraud Detection

### Apps Using Device Properties
- **Fraud detection**: Check for emulator/spoofed devices
- **Analytics**: Track unique users
- **Device management**: Identify device type
- **Regional restriction**: Check device model availability
- **DRM protection**: Hardware validation

## Device Property Queries

### Common Query Methods
```java
// IMEI
TelephonyManager.getDeviceId()

// Android ID
Settings.Secure.getString(context.getContentResolver(), "android_id")

// Build properties
android.os.Build.BRAND
android.os.Build.MODEL
android.os.Build.DEVICE
android.os.Build.FINGERPRINT

// Serial number
Build.SERIAL
Build.getSerial()
```

## Integration with Other Categories

Combine with these categories:
- **Bypass-Root-Jailbreak-Detection** - Combined device spoofing
- **Hook-Java-Methods** - Hook property access methods
- **Spoof-Device-Properties** - Multiple property modification

## Testing Workflow

```bash
# Step 1: Identify device properties app queries
frida -U -f com.example.app \
  -l hook-device-queries.js \
  --no-pause

# Step 2: Note which properties are checked
# (Observe console output)

# Step 3: Load spoofing scripts
frida -U -f com.example.app \
  -l device-parameter.js \
  --no-pause

# Step 4: Use app features that depend on properties
# (Test emulator detection, analytics, etc.)

# Step 5: Verify spoofing successful
# (App should treat device differently)
```

## Legal & Ethical Considerations

### Legitimate Uses
- ✅ Testing your own applications
- ✅ Security research (authorized)
- ✅ Emulator usage for development
- ✅ Testing app on different device types
- ✅ Fraud detection testing

### Problematic Uses
- ❌ Bypassing device-based licensing
- ❌ Fraud: creating fake accounts
- ❌ Evading security measures
- ❌ Terms of Service violations
- ❌ Unauthorized access

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Device Spoofing | **Scripts**: 6 | **Platform**: Android | **Last Updated**: 2025
