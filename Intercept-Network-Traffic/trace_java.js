/*
* trace_java.js - Trace Java method calls matching a class/method pattern.
*
* Set `clsFilter` and `methodFilter` globals (substring match). Example:
*   frida -U -f com.x -l trace_java.js --no-pause \
*     -e "clsFilter='okhttp3'; methodFilter='Request'"
*/
"use strict";
const CLS = typeof clsFilter !== "undefined" ? clsFilter : "";
const MTH = typeof methodFilter !== "undefined" ? methodFilter : "";
Java.perform(function () {
const classes = Java.enumerateLoadedClassesSync()
.filter(c => c.indexOf(CLS) !== -1);
console.log("[trace_java] tracing " + classes.length + " classes");
classes.forEach(function (className) {
let c;
try { c = Java.use(className); } catch (e) { return; }
const methods = c.class.getDeclaredMethods().concat(c.class.getMethods());
methods.forEach(function (m) {
const name = m.getName();
if (MTH && name.indexOf(MTH) === -1) return;
const overloads = c[name].overloads;
overloads.forEach(function (ov) {
ov.implementation = function () {
console.log("[*] " + className + "." + name + "(" +
Array.from(arguments).map(a => JSON.stringify(a)).join(", ") + ")");
return ov.apply(this, arguments);
};
});
});
});
console.log("[trace_java] ready");
});
