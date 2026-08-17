# Dynamic-Loading

## Purpose
This folder contains Frida scripts for dynamic code loading, framework injection, and runtime code modification.

## Overview
These scripts enable runtime injection of code, loading external frameworks, and dynamic class/method instantiation. Useful for testing custom plugins, dynamically loaded modules, and framework injection scenarios.

## Common Use Cases
- **Codeshare Script Loading**: Load community Frida scripts at runtime
- **Class Loader Manipulation**: Dynamically load classes and frameworks
- **Plugin Framework Hooks**: Intercept plugin loading mechanisms
- **Framework Injection**: Inject custom frameworks into running apps
- **Module Discovery**: Detect and hook dynamically loaded modules

## Scripts Included (4 total)
- Framework-specific dynamic loaders
- Codeshare integration scripts
- Plugin system hooks
- Runtime class loading utilities

## Usage Examples

### Basic Dynamic Loading
```bash
# Load dynamic loading script
frida -U -f com.example.app -l "path/to/dynamic-loader.js" --no-pause
```

### With External Codeshare Scripts
```bash
# Load and execute community scripts dynamically
frida -U -f com.example.app \
  -l codeshare-loader.js \
  --no-pause
```

### Plugin Framework Hooking
```bash
# Monitor and hook plugin loading
frida -U -f com.example.app \
  -l plugin-framework-hooks.js \
  --no-pause
```

## Key Capabilities

- **Dynamic Class Loading**: Load classes via ClassLoader at runtime
- **Codeshare Integration**: Execute Frida Codeshare scripts
- **Framework Loading**: Load and hook dynamic frameworks
- **Module Monitoring**: Track module load events
- **Class Path Manipulation**: Modify application class paths

## Integration with Other Categories

Combine with these categories:
- **Hook-Java-Methods** - For hooking dynamically loaded classes
- **Enumerate-Classes-Methods** - For discovering loaded modules
- **Specialized-App-Bypasses** - For app-specific dynamic features

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Code Loading | **Scripts**: 4 | **Platform**: Android | **Last Updated**: 2025
