# Memory-Operations

## Purpose
This folder contains Frida scripts for memory dumping, analysis, manipulation, and heap inspection.

## Overview
Understanding application memory is crucial for reverse engineering. These scripts enable memory reading/writing, heap analysis, object inspection, and memory dump extraction for forensic analysis.

## Common Use Cases
- **Memory Dumping**: Extract application memory to analyze
- **Heap Analysis**: Inspect heap objects and structures
- **Memory Search**: Find specific patterns or values in memory
- **Memory Modification**: Write values to memory at runtime
- **Object Inspection**: Examine Java/native objects in memory
- **Leak Detection**: Identify memory leaks and unused objects

## Scripts Included (10 total)
- Memory read/write utilities
- Heap analysis tools
- Memory dump extractors
- Pattern searchers
- Memory forensics utilities

## Usage Examples

### Memory Dump
```bash
# Extract application memory
frida -U -f com.example.app -l memory-dumper.js --no-pause > memory.bin
```

### Heap Analysis
```bash
# Analyze heap structures
frida -U -f com.example.app -l heap-analyzer.js --no-pause
```

### Memory Search
```bash
# Search for patterns in memory
frida -U -f com.example.app -l memory-search.js --no-pause
```

### Combined Memory Analysis
```bash
# Comprehensive memory inspection
frida -U -f com.example.app \
  -l memory-dumper.js \
  -l heap-analyzer.js \
  --no-pause
```

## Key Techniques

### Memory Reading
```javascript
// Read memory at specific address
let ptr = ptr('0x1234');
let value = Memory.readInt(ptr);
console.log('Value at 0x1234:', value);
```

### Memory Writing
```javascript
// Write to memory
Memory.writeInt(ptr('0x1234'), 0x42);
console.log('Written to memory');
```

### Heap Enumeration
```javascript
// Enumerate Java objects on heap
Java.choose('com.example.TargetClass', {
    onMatch: function(instance) {
        console.log('Found instance:', instance);
    },
    onComplete: function() {
        console.log('Enumeration complete');
    }
});
```

## Memory Structure Analysis

### Address Space
- **Code segment**: Program instructions
- **Data segment**: Global variables
- **Heap**: Dynamic allocations
- **Stack**: Local variables, function calls
- **Memory-mapped regions**: Libraries, files

### Heap Objects
- **Java Objects**: Allocated on Java heap
- **Native Objects**: Allocated by C/C++ code
- **String Objects**: Interned or dynamic
- **Array Objects**: Fixed-size memory blocks

## Data Extraction Examples

### Extract Strings from Memory
```bash
# Find readable strings in memory dump
strings memory.bin | grep -i password | head -20
strings memory.bin | grep -i token | head -20
```

### Search for Keys
```bash
# Look for cryptographic keys
hexdump -C memory.bin | grep -E "[0-9a-f]{32,64}"
```

### Pattern Matching
```bash
# Search for specific patterns
python3 << 'EOF'
import re
with open('memory.bin', 'rb') as f:
    data = f.read()
    # Search for potential API keys (16+ hex chars)
    matches = re.findall(rb'[0-9a-f]{32,}', data)
    for match in matches[:10]:
        print(match)
EOF
```

## Memory Forensics Workflow

```bash
# Step 1: Dump process memory
frida -U -f com.example.app -l memory-dumper.js --no-pause > memory.bin

# Step 2: Extract strings
strings memory.bin > memory_strings.txt

# Step 3: Search for sensitive data
grep -i "password\|token\|key\|secret" memory_strings.txt

# Step 4: Hex analysis
hexdump -C memory.bin | head -100

# Step 5: Pattern matching
grep -E "[0-9]{16}" memory_strings.txt  # Credit card patterns
```

## Memory Analysis Tools

### External Tools
- **Volatility**: Memory forensics framework
- **Rekall**: Memory analysis tool
- **Ghidra**: Binary analysis (includes memory inspection)
- **radare2**: Binary analysis framework
- **WinDbg**: Windows debugging (memory analysis)

### Integration with Frida
```bash
# Combine Frida dumps with forensics tools
frida -U -f com.example.app -l dumper.js > dump.bin
volatility -f dump.bin <analysis_plugin>
```

## Performance Considerations

**Warning**: Memory dumping can be slow
- Large memory dumps take time
- Dump at strategic points
- Consider targeting specific regions
- Filter unnecessary data

## Integration with Other Categories

Combine with these categories:
- **Enumerate-Classes-Methods** - Identify objects to dump
- **Hook-Java-Methods** - Trigger memory allocations
- **Intercept-Crypto-Operations** - Find cryptographic keys in memory

## Privacy & Security

**Important**: Memory dumps may contain:
- ✅ Passwords and credentials (own app)
- ✅ Personal data (authorized testing)
- ✅ Keys and tokens (security research)
- ❌ Other users' private data
- ❌ Confidential business information

## Related Documentation
See main collection: [Collection-Ishan README](../README-COMPLETE.md)

---

**Category**: Memory Analysis | **Scripts**: 10 | **Platform**: Android, iOS | **Last Updated**: 2025
