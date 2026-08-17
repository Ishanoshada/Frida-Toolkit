# Intercept-Crypto-Operations

## Purpose
This folder contains Frida scripts to hook and intercept cryptographic operations including encryption, decryption, hashing, and digital signatures.

## Overview
Cryptographic operations are often the key to understanding data protection in apps. These scripts intercept crypto calls to observe keys, plaintext, and ciphertext for security analysis.

## Common Use Cases
- **AES Encryption/Decryption**: Intercept symmetric encryption operations
- **RSA Key Operations**: Monitor asymmetric cryptography
- **Hash Computation**: Observe MD5, SHA-1, SHA-256 hashing
- **Cipher Monitoring**: Track cipher initialization and usage
- **Key Extraction**: Observe cryptographic keys in memory
- **SSL/TLS Monitoring**: Intercept SSL operations

## Scripts Included (37 total)

### Key Scripts
- `aes-crypto-universal.js` - Universal AES encryption/decryption hooking
- `cipher.js` - Generic cipher operations hooking
- `frida-universal-pinning-bypasser.js` - Comprehensive crypto bypass
- And 34 additional crypto-specific implementations

## Usage Examples

### Universal AES Hooking
```bash
# Hook all AES operations
frida -U -f com.example.app -l aes-crypto-universal.js --no-pause
```

### Generic Cipher Monitoring
```bash
# Monitor all cipher operations
frida -U -f com.example.app -l cipher.js --no-pause
```

### Combined Crypto Analysis
```bash
# Monitor multiple crypto operations
frida -U -f com.example.app \
  -l aes-crypto-universal.js \
  -l cipher.js \
  --no-pause
```

### With SSL Pinning Bypass
```bash
# Crypto analysis + SSL pinning bypass
frida -U -f com.example.app \
  -l frida-universal-pinning-bypasser.js \
  -l aes-crypto-universal.js \
  --no-pause
```

## Key Techniques

### AES Encryption Interception
```javascript
// Hook AES cipher operations
Java.use('javax.crypto.Cipher')
    .getInstance
    .overload('java.lang.String')
    .implementation = function(algorithm) {
        console.log('[Cipher] Algorithm:', algorithm);
        return this.getInstance(algorithm);
    };
```

### Key Extraction
```javascript
// Monitor key generation and usage
Java.use('javax.crypto.KeyGenerator')
    .generateKey
    .implementation = function() {
        let key = this.generateKey();
        console.log('[KeyGen] Generated key');
        return key;
    };
```

### Hash Monitoring
```javascript
// Hook message digest operations
Java.use('java.security.MessageDigest')
    .digest
    .implementation = function(input) {
        console.log('[Hash] Input length:', input.length);
        return this.digest(input);
    };
```

## Common Crypto Libraries

### Android
- **javax.crypto** - Java crypto package
  - AES, RSA, DES operations
  - Cipher, KeyGenerator, MessageDigest
  
- **android.security.keystore** - Android KeyStore
  - Hardware-backed keys
  - Key attestation
  
- **Bouncy Castle** - Third-party crypto library
  - Enhanced algorithms
  - Custom implementations

- **OpenSSL** - Native crypto library
  - TLS/SSL operations
  - Native crypto functions

### iOS
- **CommonCrypto** - iOS crypto framework
- **Security.framework** - System security APIs
- **CryptoKit** - Modern crypto framework

## Crypto Algorithm Categories

### Symmetric Encryption
- **AES** (Advanced Encryption Standard)
  - Modes: ECB, CBC, CTR, GCM
  - Key sizes: 128, 192, 256 bits
  
- **DES/3DES** (Deprecated, legacy apps)

### Asymmetric Encryption
- **RSA** - Public key cryptography
  - Key sizes: 1024, 2048, 4096 bits
  
- **ECDSA** - Elliptic Curve signatures

### Hashing
- **MD5** (Deprecated, weak)
- **SHA-1** (Deprecated, weak)
- **SHA-256** (Recommended)
- **SHA-512** (Recommended)

### Message Authentication
- **HMAC** - Keyed hashing
- **CMAC** - Cipher-based authentication

## Data Collection Workflow

```bash
# 1. Start hooking crypto operations
frida -U -f com.example.app -l aes-crypto-universal.js --no-pause

# 2. Use app to trigger encryption
# (Login, send message, save data)

# 3. Observe logged keys and data
# Monitor console output for plaintext/ciphertext

# 4. Save output for analysis
frida -U -f com.example.app -l aes-crypto-universal.js > crypto_log.txt

# 5. Analyze with grep and parsing scripts
grep "plaintext" crypto_log.txt | sort | uniq
```

## Key Extraction Implications

### Security Impact
- **Plaintext Recovery**: See unencrypted data
- **Key Compromise**: Extract cryptographic keys
- **Integrity Bypass**: Forge valid data
- **Authentication Bypass**: Spoof signatures

### Usage
- ✅ Testing your own applications
- ✅ Security research with permission
- ✅ Penetration testing (authorized)
- ❌ Unauthorized access
- ❌ Intellectual property theft

## Integration with Other Categories

Combine with these categories:
- **Intercept-Network-Traffic** - Monitor encrypted network data
- **File-System-Access** - Extract encrypted storage
- **Hook-Java-Methods** - Trace crypto method calls
- **Bypass-SSL-Certificate-Pinning** - Intercept TLS crypto

## Performance Considerations

Crypto hooking can slow apps significantly:
- Use targeted hooking when possible
- Filter by class/method
- Minimize console output
- Consider batch logging

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Cryptography Analysis | **Scripts**: 37 | **Platform**: Android, iOS | **Last Updated**: 2025
