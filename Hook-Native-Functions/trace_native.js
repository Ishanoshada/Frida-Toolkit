/*
* trace_native.js - Trace native function calls using Interceptor.
*
* Set `moduleName` and `symbol` globals. Leave `symbol` empty to trace every
* exported symbol of `moduleName`.
*/
"use strict";
const MOD = typeof moduleName !== "undefined" ? moduleName : "libc.so";
const SYM = typeof symbol !== "undefined" ? symbol : "";
function trace(sym, addr) {
Interceptor.attach(addr, {
onEnter: function (args) {
this.caller = Thread.backtrace(this.context, Backtracer.ACCURATE)
.map(DebugSymbol.fromAddress).join(" <- ");
console.log("[native] -> " + sym + "  called from " + this.caller);
},
onLeave: function (ret) {
console.log("[native] <- " + sym + "  ret=" + ret);
}
});
}
function run() {
const m = Process.getModuleByName(MOD);
console.log("[trace_native] module " + m.name + " @ " + m.base);
const exports = m.enumerateExports();
let n = 0;
exports.forEach(function (e) {
if (SYM && e.name.indexOf(SYM) === -1) return;
try { trace(e.name, e.address); n++; } catch (err) {}
});
console.log("[trace_native] attached to " + n + " exports");
}
setTimeout(run, 300);
