const libraryName = "libcommonCrypto.dylib";
const functionName = "CCCryptorCreate";
const CCCryptorCreatePtr = Module.findExportByName(libraryName, functionName);
if (CCCryptorCreatePtr !== null) {
console.log("[*] Hooking " + functionName);
Interceptor.attach(CCCryptorCreatePtr, {
onEnter: function(args) {
console.log("[*] Intercepted CCCryptorCreate");
if (args[1].toInt32() == 0 && args[2].toInt32() == 2) {
console.log("Algorithm used is kCCAlgorithmAES128 and used in kCCOptionECBMode")
}
},
onLeave: function(retval) {
}
});
} else {
console.log("[-] Unable to find " + functionName + " function to hook.");
}
