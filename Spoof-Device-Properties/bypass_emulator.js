/*
* bypass_emulator.js - Spoof hardware / build properties that apps use to
* detect emulators (AVD, BlueStacks, Genymotion, etc.).
*
* Overwrites Build.* fields and TelephonyManager derived values with
* plausible physical-device values.
*/
"use strict";
const SPOOF = {
"android.os.Build": {
BOARD: "goldfish",               BRAND: "google",
DEVICE: "blueline",
MANUFACTURER: "Google",
MODEL: "Pixel 3",
PRODUCT: "blueline",
HARDWARE: "blueline",
FINGERPRINT: "google/blueline/blueline:13/TP1A.220624.014/8907221:user/release-keys",
SERIAL: "1A2B3C4D5E6F"
},
"android.os.Build$VERSION": {
BASE_OS: "",
SECURITY_PATCH: "2023-07-05"
}
};
function patchClass(className, fields) {
try {
const c = Java.use(className);
Object.keys(fields).forEach(k => { c[k].value = fields[k]; });
console.log("[bypass_emulator] patched " + className);
} catch (e) {
console.log("[bypass_emulator] skip " + className + ": " + e);
}
}
Java.perform(function () {
Object.keys(SPOOF).forEach(cls => patchClass(cls, SPOOF[cls]));
const Tm = Java.use("android.telephony.TelephonyManager");
["getDeviceId", "getImei", "getMeid"].forEach(n => {
if (Tm[n]) {
Tm[n].overloads.forEach(fn => {
fn.implementation = function () { return "358240051111111"; };
});
}
});
console.log("[bypass_emulator] ready");
});
