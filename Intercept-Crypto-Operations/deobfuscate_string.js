/*
* deobfuscate_string.js - Hook common string-decryption entry points so the
* deobfuscated plain-text is revealed at runtime.
*
* Many obfuscators (e.g. string-to-byte + XOR/AES at first use) route through
* a single helper. Hook the candidate methods listed below and log the result.
*/
"use strict";
const CANDIDATES = [
"decrypt", "decode", "decodeString", "a", "b", "z",
"stringFromJNI", "nativeDecode", "dec"
];
Java.perform(function () {
const classes = Java.enumerateLoadedClassesSync();
classes.forEach(function (cls) {
CANDIDATES.forEach(function (m) {
try {
const c = Java.use(cls);
const target = c[m];
if (!target || !target.overloads) return;
target.overloads.forEach(function (ov) {
ov.implementation = function () {
const r = ov.apply(this, arguments);
const inStr = Array.from(arguments)
.map(a => (typeof a === "string" ? a : "")).join("|");
console.log("[deobf] " + cls + "." + m + "(" + inStr +
") => " + (typeof r === "string" ? r : "<non-string>"));
return r;
};
});
} catch (e) {  }
});
});
console.log("[deobfuscate_string] hooks installed on candidates: " +
CANDIDATES.join(", "));
});
