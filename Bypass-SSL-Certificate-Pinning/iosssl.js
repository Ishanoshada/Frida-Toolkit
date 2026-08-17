if (ObjC.available) {
try {
const suspiciousPaths = [
"/Applications/Cydia.app",
"/Library/MobileSubstrate/MobileSubstrate.dylib",
"/bin/bash",
"/usr/sbin/sshd",
"/etc/apt"
];
var stat = new NativeFunction(Module.findExportByName(null, "stat"), 'int', ['pointer', 'pointer']);
Interceptor.replace(stat, new NativeCallback(function (pathPtr, statPtr) {
var path = Memory.readUtf8String(pathPtr);
for (var i = 0; i < suspiciousPaths.length; i++) {
if (path.indexOf(suspiciousPaths[i]) !== -1) {
console.log("[+] stat() Jailbreak path detected and bypassed: " + path);
return -1;
}
}
return stat(pathPtr, statPtr);
}, 'int', ['pointer', 'pointer']));
var access = new NativeFunction(Module.findExportByName(null, "access"), 'int', ['pointer', 'int']);
Interceptor.replace(access, new NativeCallback(function (pathPtr, amode) {
var path = Memory.readUtf8String(pathPtr);
for (var i = 0; i < suspiciousPaths.length; i++) {
if (path.indexOf(suspiciousPaths[i]) !== -1) {
console.log("[+] access() Jailbreak path detected and bypassed: " + path);
return -1;
}
}
return access(pathPtr, amode);
}, 'int', ['pointer', 'int']));
var forkPtr = Module.findExportByName(null, "fork");
if (forkPtr) {
Interceptor.replace(forkPtr, new NativeCallback(function () {
console.log("[+] fork() called - returning error to bypass jailbreak detection");
return -1;
}, 'int', []));
}
console.log("[+] Jailbreak detection hooks applied successfully");
var SecTrustEvaluate = Module.findExportByName("Security", "SecTrustEvaluate");
if (SecTrustEvaluate) {
Interceptor.attach(SecTrustEvaluate, {
onLeave: function (retval) {
console.log("[+] SecTrustEvaluate bypassed");
retval.replace(0);                 }
});
}
var SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");
if (SecTrustEvaluateWithError) {
Interceptor.attach(SecTrustEvaluateWithError, {
onLeave: function (retval) {
console.log("[+] SecTrustEvaluateWithError bypassed");
retval.replace(1);                 }
});
}
console.log("[+] SSL Pinning hooks applied successfully");
} catch (err) {
console.log("[-] Exception: " + err.message);
}
} else {
console.log("[-] Objective-C Runtime is not available!");
}
