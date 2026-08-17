function bypass_SecTrustEvaluates() {
var SecTrustEvaluateWithErrorHandle = Module.findExportByName('Security', 'SecTrustEvaluateWithError');
if (SecTrustEvaluateWithErrorHandle) {
var SecTrustEvaluateWithError = new NativeFunction(SecTrustEvaluateWithErrorHandle, 'int', ['pointer', 'pointer']);
Interceptor.replace(SecTrustEvaluateWithErrorHandle,
new NativeCallback(function(trust, error) {
console.log('[!] Hooking SecTrustEvaluateWithError()');
SecTrustEvaluateWithError(trust, NULL);
if (error != 0) {
Memory.writeU8(error, 0);
}
return 1;
}, 'int', ['pointer', 'pointer']));
}
var SecTrustGetTrustResultHandle = Module.findExportByName("Security", "SecTrustGetTrustResult");
if (SecTrustGetTrustResultHandle) {
Interceptor.replace(SecTrustGetTrustResultHandle, new NativeCallback(function(trust, result) {
console.log("[!] Hooking SecTrustGetTrustResult");
Memory.writeU8(result, 1);
return 0;
}, "int", ["pointer", "pointer"]));
}
var SecTrustEvaluateHandle = Module.findExportByName("Security", "SecTrustEvaluate");
if (SecTrustEvaluateHandle) {
var SecTrustEvaluate = new NativeFunction(SecTrustEvaluateHandle, "int", ["pointer", "pointer"]);
Interceptor.replace(SecTrustEvaluateHandle, new NativeCallback(function(trust, result) {
console.log("[!] Hooking SecTrustEvaluate");
var osstatus = SecTrustEvaluate(trust, result);
Memory.writeU8(result, 1);
return 0;
}, "int", ["pointer", "pointer"]));
}
}
if (ObjC.available) {
bypass_SecTrustEvaluates();
} else {
send("error: Objective-C Runtime is not available!");
}
