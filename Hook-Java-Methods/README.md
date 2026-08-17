# Hook-Java-Methods

## Purpose
This folder contains Frida scripts for hooking, intercepting, and manipulating Java methods in Android applications.

## Overview
Java method hooking is the foundation of app analysis. These scripts provide flexible utilities to intercept method calls, modify parameters, change return values, and trace execution flow for security research and debugging.

## Common Use Cases
- **Method Replacement**: Replace method implementations at runtime
- **Parameter Interception**: Log and modify method arguments
- **Return Value Manipulation**: Change method return values
- **Call Tracing**: Track which methods are called
- **Execution Flow Analysis**: Understand application logic
- **Permission Hooking**: Intercept permission checks

## Scripts Included (97 total)

### Key Scripts
- `hook-method-of-class.js` - Generic method hooking template
- `hook-javascript-interfaces.js` - WebView JavaScript interface hooking
- `hookpermissions.js` - Permission check hooking
- `show-all-classes-methods.js` - Discovery and enumeration
- `show-specific-class-methods.js` - Targeted enumeration
- And 92 additional specialized hooks

## Usage Examples

### Basic Method Hook
```bash
# Load generic method hooking script
frida -U -f com.example.app -l hook-method-of-class.js --no-pause
```

### Hook Specific Class
```bash
# Hook all methods of a specific class
frida -U -f com.example.app -l show-specific-class-methods.js --no-pause
```

### Permission Hooking
```bash
# Intercept permission checks
frida -U -f com.example.app -l hookpermissions.js --no-pause
```

### JavaScript Interface (WebView)
```bash
# Hook WebView JavaScript interfaces
frida -U -f com.example.app -l hook-javascript-interfaces.js --no-pause
```

### Combined Analysis
```bash
# Multiple hooking scripts
frida -U -f com.example.app \
  -l hook-method-of-class.js \
  -l hookpermissions.js \
  --no-pause
```

## Key Techniques

### Method Hooking Pattern
```javascript
// Basic hook structure used by scripts
Java.use('com.example.Class').method.implementation = function(arg1, arg2) {
    console.log('[HOOK] Called with:', arg1, arg2);
    
    // Call original method
    let result = this.method(arg1, arg2);
    
    // Modify result if needed
    return result;
}
```

### Advanced Techniques
- **Before/After Hooks**: Execute code before/after original method
- **Override Logic**: Replace entire method implementation
- **Parameter Modification**: Change arguments before method execution
- **Return Value Injection**: Provide custom return values
- **Exception Handling**: Catch and handle method exceptions
- **Conditional Hooking**: Hook based on runtime conditions

## Common Hook Targets

### Authentication
- `login()`
- `authenticate()`
- `validateCredentials()`
- `checkPassword()`

### Security Checks
- `checkPermission()`
- `isDeviceSecure()`
- `verifySignature()`
- `validateToken()`

### Network Operations
- `makeRequest()`
- `sendData()`
- `onResponse()`
- `parseResponse()`

### Crypto Operations
- `encrypt()`
- `decrypt()`
- `hash()`
- `sign()`

## Discovery Workflow

```bash
# Step 1: Enumerate all classes and methods
frida -U -f com.example.app -l show-all-classes-methods.js --no-pause

# Step 2: Identify interesting targets
# Look for: auth, login, check, validate, send, request, crypto

# Step 3: Hook target methods
# Modify scripts to target identified methods

# Step 4: Analyze behavior during app usage
# Observe method calls and parameter values

# Step 5: Modify behavior as needed
# Change return values or parameters
```

## Integration with Other Categories

Combine with these categories:
- **Enumerate-Classes-Methods** - Find methods to hook
- **Intercept-Network-Traffic** - Monitor network calls
- **Intercept-Crypto-Operations** - Hook crypto methods
- **Bypass-Root-Jailbreak-Detection** - Hook security checks

## Hooking Tips

**Tip 1**: Always hook early (during app startup)
```bash
frida -U -f com.example.app -l hook.js --no-pause
```

**Tip 2**: Use `Java.use()` for class access, not `require()`
```javascript
// Correct
Java.use('com.example.Class')

// Wrong
require('com.example.Class')
```

**Tip 3**: Handle method overloading with signatures
```javascript
// Specific overload
Java.use('com.example.Class')
    .method
    .overload('java.lang.String', 'int')
    .implementation = function(str, num) { ... }
```

**Tip 4**: Check return types
```javascript
let original = this.method(arg);
// Ensure return type matches expected value
return original;
```

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Java Instrumentation | **Scripts**: 97 | **Platform**: Android | **Last Updated**: 2025
