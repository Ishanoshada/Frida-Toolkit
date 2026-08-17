/*
https:
****************************************
killSSL.js Frida script
by Dima Kovalenko
****************************************
Usage:
1. Run Viber on the device
2. Inject the script to the process:
$ frida -U -n Viber  -l path/to/killSSL.js
3. SSL pinning in Viber HTTPs is
disabled. Now you can intercept
Viber HTTPs requests, e.g. with
mitmproxy.
*/
function disable_SecTrustEvaluate() {
DEBUG = true;
var SecTrustEvaluate_prt = Module.findExportByName("Security", "SecTrustEvaluate");
if (SecTrustEvaluate_prt == null) {
console.log("[!] Security!SecTrustEvaluate(...) not found!");
return;
}
var SecTrustEvaluate = new NativeFunction(SecTrustEvaluate_prt, "int", ["pointer", "pointer"]);
Interceptor.replace(SecTrustEvaluate_prt, new NativeCallback(function(trust, result) {
if (DEBUG) console.log("[*] SecTrustEvaluate(...) hit!");
var osstatus = SecTrustEvaluate(trust, result);
Memory.writeU8(result, 1);
return 0;
}, "int", ["pointer", "pointer"]));
console.log("[*] SecTrustEvaluate(...) hooked. SSL should be pinning disabled.");
}
