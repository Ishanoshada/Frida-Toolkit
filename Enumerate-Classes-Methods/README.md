# Enumerate-Classes-Methods

## Purpose
This folder contains Frida scripts for discovering and enumerating Java classes, methods, fields, and application structure.

## Overview
App analysis often requires understanding the application structure. These scripts enumerate loaded classes, list available methods, dump class hierarchies, and extract metadata for reverse engineering and security analysis.

## Common Use Cases
- **Class Discovery**: Find all loaded classes in application
- **Method Enumeration**: List methods of specific classes
- **DEX File Analysis**: Dump and analyze DEX files
- **Class Hierarchy**: Understand inheritance and class relationships
- **Memory Analysis**: Discover objects in application memory
- **API Surface**: Identify public APIs and entry points

## Scripts Included (12 total)
- `dump_classes.js` - Dump all loaded classes
- `dump_memory.js` - Memory dump utilities
- `dump_methods.js` - Method enumeration
- And 9 additional analysis scripts

## Usage Examples

### Dump All Classes
```bash
# Export all loaded classes to file
frida -U -f com.example.app -l dump_classes.js --no-pause | tee classes.txt

# Or directly save to file during analysis
frida -U -f com.example.app -l dump_classes.js --no-pause > app_classes.log
```

### Enumerate Methods
```bash
# List all methods of a specific class
frida -U -f com.example.app -l dump_methods.js --no-pause
```

### Memory Analysis
```bash
# Analyze loaded objects in memory
frida -U -f com.example.app -l dump_memory.js --no-pause
```

### Comprehensive Enumeration
```bash
# Complete app structure analysis
frida -U -f com.example.app \
  -l dump_classes.js \
  -l dump_methods.js \
  -l dump_memory.js \
  --no-pause
```

## Key Techniques

- **Java Runtime Reflection**: Use Java reflection to enumerate classes
- **Class Loader Enumeration**: Access all ClassLoaders and their classes
- **Method Discovery**: Extract method signatures, modifiers, annotations
- **Field Enumeration**: List instance and static fields
- **DEX Parsing**: Parse DEX bytecode for direct analysis
- **Memory Scanning**: Search for objects matching patterns

## Analysis Workflow

```bash
# Step 1: Dump classes
frida -U -f com.example.app -l dump_classes.js --no-pause > classes.txt

# Step 2: Identify target classes
grep "com.example" classes.txt | grep -i "auth\|login\|crypto"

# Step 3: Enumerate target class methods
# Use dump_methods.js on specific class

# Step 4: Hook identified methods
# Use Hook-Java-Methods scripts for further analysis
```

## Output Analysis

### Classes Format
```
com.example.app.MainActivity
com.example.app.AuthManager
com.example.app.crypto.CryptoUtils
android.content.Context
...
```

### Methods Format
```
com.example.app.AuthManager
  - login(String, String): boolean
  - validateToken(String): boolean
  - logout(): void
...
```

## Integration with Other Categories

Combine with these categories:
- **Hook-Java-Methods** - Hook discovered methods
- **Intercept-Crypto-Operations** - Analyze discovered crypto classes
- **Intercept-Network-Traffic** - Track network-related classes
- **File-System-Access** - Find file access methods

## Common Use Cases

**Security Audit**: 
```bash
frida -U -f com.example.app -l dump_classes.js | grep -i "auth\|security\|crypto"
```

**API Mapping**: 
```bash
frida -U -f com.example.app -l dump_methods.js | grep "public"
```

**Vulnerability Search**: 
```bash
frida -U -f com.example.app -l dump_classes.js | grep -i "vulnerable\|deprecated\|unsafe"
```

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Discovery & Analysis | **Scripts**: 12 | **Platform**: Android | **Last Updated**: 2025
