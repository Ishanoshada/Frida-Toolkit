# File-System-Access

## Purpose
This folder contains Frida scripts for accessing and manipulating file systems, databases, and application storage.

## Overview
Applications store sensitive data in files, databases, and preferences. These scripts enable access to SQLite databases, file operations, storage permissions, and keychain/keystore data for security testing.

## Common Use Cases
- **SQLite Database Access**: Read and extract SQLite databases
- **File System Monitoring**: Hook file read/write operations
- **Shared Preferences Access**: Extract app configuration and secrets
- **Keychain/Keystore Access**: Access stored credentials and keys
- **File Permission Hooks**: Monitor and modify file access patterns
- **Storage Directory Traversal**: Navigate application storage directories

## Scripts Included (12 total)
- SQLite database access utilities
- File permission hooking scripts
- Storage monitoring tools
- Keychain access utilities
- SharedPreferences extractors

## Usage Examples

### SQLite Database Access
```bash
# Access and monitor SQLite database operations
frida -U -f com.example.app -l sqlite-database.js --no-pause
```

### Monitor File Operations
```bash
# Hook file read/write operations
frida -U -f com.example.app -l file-permission-hooks.js --no-pause
```

### Extract Shared Preferences
```bash
# Access app's shared preferences storage
frida -U -f com.example.app -l sharedpreferences-extractor.js --no-pause
```

### Combined Storage Analysis
```bash
# Comprehensive storage monitoring
frida -U -f com.example.app \
  -l sqlite-database.js \
  -l file-permission-hooks.js \
  --no-pause
```

## Key Techniques

- **SQLite Query Hooking**: Intercept database queries
- **File I/O Interception**: Hook file open/read/write operations
- **Permission Checking**: Bypass or monitor permission checks
- **Keystore Integration**: Access system keystore
- **Shared Preferences Parsing**: Extract preference XML
- **Content Provider Hooking**: Intercept ContentProvider queries

## Storage Locations

### Android
```
/data/data/com.example.app/          - App private directory
/data/data/com.example.app/databases  - SQLite databases
/data/data/com.example.app/shared_prefs - SharedPreferences XML
/data/data/com.example.app/files      - App files
/sdcard/Android/data/com.example.app  - External storage
```

### iOS
```
~/Documents/   - App documents
~/Library/     - App library (caches, preferences)
~/tmp/         - Temporary files
~/Library/Caches/com.sqlite.db - SQLite databases
```

## Database Analysis Workflow

```bash
# 1. Hook SQLite operations
frida -U -f com.example.app -l sqlite-database.js --no-pause

# 2. Use app normally to trigger database access

# 3. Extract database via adb
adb pull /data/data/com.example.app/databases/app.db ./

# 4. Open in SQLite browser
sqlite3 app.db
> .tables
> SELECT * FROM sensitive_table;
```

## Integration with Other Categories

Combine with these categories:
- **Intercept-Crypto-Operations** - Analyze encrypted data in storage
- **Hook-Java-Methods** - Hook specific file operations
- **Enumerate-Classes-Methods** - Find storage-related classes

## Common Sensitive Data

- **Credentials**: Login tokens, API keys
- **Personal Info**: User ID, email, phone
- **Payment Data**: Credit card info, payment tokens
- **Device ID**: IMEI, Android ID, device fingerprint
- **Session Data**: Session tokens, cache

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Storage Access | **Scripts**: 12 | **Platform**: Android, iOS | **Last Updated**: 2025
