/*
* deobfuscate_reflect.js - Resolve reflection-based method invocation which
* obfuscators use to hide the real target. Logs class/method/args and the
* return value of every reflective call.
*/
"use strict";
Java.perform(function () {
const Method = Java.use("java.lang.reflect.Method");
Method.invoke.implementation = function (obj, args) {
const decl = this.getDeclaringClass().getName() + "." + this.getName();
console.log("[reflect] " + decl + "(" +
(args ? Array.from(args).map(a => JSON.stringify(a)).join(", ") : "") + ")");
const r = this.invoke(obj, args);
console.log("[reflect]   => " + (r === null ? "null" : r.toString()));
return r;
};
const Class = Java.use("java.lang.Class");
Class.forName.overloads.forEach(function (ov) {
ov.implementation = function () {
console.log("[reflect] Class.forName(" + Array.from(arguments).join(", ") + ")");
return ov.apply(this, arguments);
};
});
console.log("[deobfuscate_reflect] reflective-call tracer installed");
});
