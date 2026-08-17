/*
* bypass_root.js - Neutralise common root-detection logic on Android.
*
* Strategies:
*   1. java.io.File.exists() -> false for su / Superuser / Magisk / busybox paths
*   2. Runtime.exec(...)     -> throw for su / which / busybox invocations
*   3. android.os.Build.TAGS / TYPE -> "release-keys" / "user"
*
* Attach:  frida -U -f com.target.app -l scripts/bypass/bypass_root.js
*/
"use strict";
const ROOT_PATH_FRAGMENTS = ["su", "Superuser", "Magisk", "busybox", "xposed"];
function install() {
const File = Java.use("java.io.File");
File.exists.implementation = function () {
const p = this.getAbsolutePath();
if (p && ROOT_PATH_FRAGMENTS.some(f => p.indexOf(f) !== -1)) {
console.log("[bypass_root] File.exists -> false : " + p);
return false;
}
return this.exists();
};
const Runtime = Java.use("java.lang.Runtime");
Runtime.exec.overloads.forEach(fn => {
fn.implementation = function () {
const arg = arguments[0];
const cmd = (typeof arg === "string") ? arg
: (arg && arg.hasOwnProperty("length")) ? Array.from(arg).join(" ") : "";
if (cmd && (cmd.indexOf("su") !== -1 || cmd.indexOf("which") !== -1
|| cmd.indexOf("busybox") !== -1)) {
console.log("[bypass_root] Runtime.exec blocked: " + cmd);
throw new java.io.IOException("blocked by bypass_root");
}
return fn.apply(this, arguments);
};
});
try {
const Build = Java.use("android.os.Build");
Build.TAGS.value = "release-keys";
Build.TYPE.value = "user";
console.log("[bypass_root] Patched Build.TAGS/TYPE");
} catch (e) {
console.log("[bypass_root] Build patch failed: " + e);
}
}
Java.perform(install);
