# Bypass-SSL-Certificate-Pinning

## Purpose
This folder contains Frida scripts to bypass SSL/TLS certificate pinning mechanisms used by Android and iOS applications.

## Overview
Certificate pinning is a security mechanism that prevents man-in-the-middle attacks by hardcoding expected certificates. However, security researchers need to intercept traffic for legitimate testing purposes. These scripts bypass pinning implementations across various HTTP clients and frameworks.

## Common Use Cases
- **OkHttp Pinning Bypass**: Bypass OkHttp certificate pinning (used by Instagram, Facebook, Snapchat)
- **Custom Pinning Bypass**: Evade custom certificate pinning implementations
- **Alamofire/Flutter**: Bypass framework-specific SSL pinning
- **macOS/iOS SSL Bypass**: iOS app SSL certificate pinning bypass
- **Network Traffic Interception**: Enable proxy interception for HTTPS traffic
- **API Testing**: Test backend APIs without certificate issues

## Scripts Included (140 total)

### Key Scripts
- `android-ssl-pinning-bypass.js` - Generic Android SSL pinning bypass
- `okhttp3-certificate-pinner-bypass.js` - OkHttp3 specific bypass (most common)
- `universal-ssl-pinning-bypass.js` - Universal approach covering multiple libraries
- `ios-ssl-bypass.js` - iOS app SSL bypass
- `flutter-ssl-pinning-bypass.js` - Flutter framework bypass
- `alamofire-ssl-bypass.js` - Alamofire framework bypass

### Additional Implementations (140 total)
- App-specific bypasses (Instagram, Facebook, Snapchat variants)
- Framework variations (AndroidX, legacy Android)
- Platform-specific implementations

## Usage Examples

### Universal SSL Pinning Bypass
```bash
# Most compatible approach - works on many apps
frida -U -f com.example.app -l universal-ssl-pinning-bypass.js --no-pause
```

### OkHttp3 Specific
```bash
# For apps using OkHttp3 (very common)
frida -U -f com.example.app -l okhttp3-certificate-pinner-bypass.js --no-pause
```

### Combined with HTTP Proxy
```bash
# Run Frida bypass + setup Burp Suite or Mitmproxy
frida -U -f com.example.app \
  -l universal-ssl-pinning-bypass.js \
  --no-pause

# Then configure device proxy in Settings -> Wi-Fi -> Proxy
```

### iOS SSL Bypass
```bash
# iOS-specific pinning bypass
frida -U -f com.example.app -l ios-ssl-bypass.js --no-pause
```

### Flutter Apps
```bash
# Flutter framework SSL bypass
frida -U -f com.example.app -l flutter-ssl-pinning-bypass.js --no-pause
```

## Targeted Frameworks & Libraries

### Android
- **OkHttp3** (Most Common)
  - Used by: Instagram, Facebook, Snapchat, YouTube, Twitter
  - Method: Hook `CertificatePinner.check()`
  
- **Retrofit** (HTTP client based on OkHttp)
  - Used by many APIs
  - Method: Bypass underlying OkHttp

- **Volley**
  - Used by older Google apps
  - Method: HTTP stack interception

- **Custom Implementations**
  - App-specific pinning logic
  - Method: Framework-specific hooks

### iOS
- **NSURLSession**
  - URLSessionDelegate certificate validation
  - Method: Delegate interception

- **Alamofire**
  - Third-party framework
  - Method: ServerTrustPolicy bypass

- **Custom Pinning**
  - Proprietary implementations
  - Method: Certificate validation hooking

### Cross-Platform
- **Flutter**
  - Dart-level pinning
  - Method: HttpClient override

## Key Techniques

- **Certificate Validation Hook**: Intercept certificate validation methods
- **Trust Manager Replacement**: Replace system trust manager
- **Pinning Store Modification**: Modify pinned certificate list
- **Delegate Interception**: Override URLSessionDelegate methods
- **Network Stack Patching**: Patch lower-level network libraries
- **Return Value Manipulation**: Force validation to always succeed

## Integration with Other Categories

Combine with these categories for complete network analysis:
- **Intercept-Network-Traffic** - Log HTTP requests/responses
- **Intercept-Crypto-Operations** - Analyze encryption
- **Hook-Java-Methods** - Generic method hooking
- **Hook-Native-Functions** - Native TLS hooking

## Testing Workflow

```bash
# 1. Bypass SSL pinning
frida -U -f com.example.app -l universal-ssl-pinning-bypass.js --no-pause

# 2. Configure proxy on device
# Settings -> Wi-Fi -> Modify -> Proxy: 192.168.x.x:8080

# 3. Start Burp Suite or Mitmproxy listening on 8080

# 4. Use app normally - all HTTPS traffic now visible in proxy

# 5. (Optional) Intercept and modify requests
```

## Troubleshooting

**Issue**: Script loads but traffic still pinned
- Try `okhttp3-certificate-pinner-bypass.js` specifically
- Load script BEFORE app network requests

**Issue**: SSL certificate error in proxy
- Install Burp/Mitmproxy CA certificate in device settings
- Accept certificate warnings in app

**Issue**: Script not hooking methods
- Verify target framework with `adb logcat`
- Check script logs: `frida ... 2>&1 | grep -i "hook\|error"`

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Network Security | **Scripts**: 140 | **Platform**: Android, iOS, Flutter | **Last Updated**: 2025
