/*
* dump_memory.js - Dump a process memory range to /sdcard/frida_dump.bin.
*
* Set `base` (hex string) and `size` (decimal) globals before loading.
*/
"use strict";
const BASE = typeof base !== "undefined" ? ptr(base) : NULL;
const SIZE = typeof size !== "undefined" ? size : 0x1000;
function dump() {
if (BASE.isNull()) { console.log("[dump_memory] no base set"); return; }
const bytes = BASE.readByteArray(SIZE);
const fs = require("fs");
fs.writeFileSync("/sdcard/frida_dump.bin", bytes);
console.log("[dump_memory] dumped " + SIZE + " bytes from " + BASE +
" -> /sdcard/frida_dump.bin");
}
setTimeout(dump, 500);
