console.log("[*] Starting Universal iOS Hooking Script (SSL Bypass + iOS Version Bypass + AES Hooking)...");
try {
var sysctl = Module.findExportByName(null, "sysctlbyname");
if (sysctl) {
Interceptor.attach(sysctl, {
onEnter: function (args) {
var name = Memory.readUtf8String(args[0]);
if (name.indexOf("kern.osversion") !== -1 || name.indexOf("hw.machine") !== -1) {
console.log("[+] Bypassing iOS Version Check...");
this.shouldBypass = true;
this.bufferPtr = args[1];
}
},
onLeave: function (retval) {
if (this.shouldBypass && !this.bufferPtr.isNull()) {
Memory.writeUtf8String(this.bufferPtr, "18.1.3");                     console.log("[+] iOS Version Bypass Applied: 18.1.3");
}
}
});
}
} catch (e) {
console.log("[!] iOS Version Bypass Failed: " + e);
}
if (ObjC.available) {
try {
var UIDevice = ObjC.classes.UIDevice;
if (UIDevice) {
Interceptor.attach(UIDevice["- systemVersion"].implementation, {
onLeave: function (retval) {
console.log("[+] Overriding iOS Version Check (Objective-C)");
var newVersion = ObjC.classes.NSString.stringWithString_("18.1.3");
retval.replace(newVersion);
}
});
}
} catch (e) {
console.log("[!] Failed to override UIDevice systemVersion: " + e);
}
}
if (ObjC.available) {
try {
console.log("[+] Hooking all known SSL pinning methods...");
function hookSSL() {
var SSLDelegates = [
"NSURLSessionDelegate",
"NSURLSessionTaskDelegate",
"NSURLConnectionDelegate"
];
SSLDelegates.forEach(function(cls) {
if (ObjC.classes.hasOwnProperty(cls)) {
console.log("[+] Patching: " + cls);
var methods = [
"- URLSession:didReceiveChallenge:completionHandler:",
"- connection:willSendRequestForAuthenticationChallenge:"
];
methods.forEach(function(method) {
if (ObjC.classes[cls] && ObjC.classes[cls][method]) {
try {
Interceptor.attach(ObjC.classes[cls][method].implementation, {
onEnter: function(args) {
console.log("[âœ”] SSL Bypass: " + cls + " -> " + method);
var completionHandler = new ObjC.Block(args[2]);
completionHandler.implementation = function(challenge, credential) {
console.log("[*] SSL Challenge Bypassed!");
var trust = challenge[2];
var trustCredential = ObjC.classes.NSURLCredential.credentialForTrust_(trust);
completionHandler.call(this, 0, trustCredential);
};
}
});
} catch (err) {
console.log("[-] Failed to hook " + method + " in " + cls + ": " + err);
}
}
});
}
});
console.log("[âœ”] Universal SSL Unpinning Successfully Applied!");
}
var retryCount = 5;
var interval = setInterval(function() {
console.log("[*] Checking if SSL classes are loaded...");
if (retryCount === 0) {
console.log("[!] Max retries reached, stopping SSL unpinning attempts.");
clearInterval(interval);
}
if (ObjC.classes.NSURLSession || ObjC.classes.NSURLConnection) {
console.log("[âœ”] SSL classes loaded, hooking now...");
hookSSL();
clearInterval(interval);
}
retryCount--;
}, 2000);
} catch (error) {
console.log("[!] Error: " + error);
}
} else {
console.log("[!] ObjC runtime is not available!");
}
var CCCryptorCreate = Module.findExportByName("libcommonCrypto.dylib", "CCCryptorCreate");
var CCCryptorUpdate = Module.findExportByName("libcommonCrypto.dylib", "CCCryptorUpdate");
if (CCCryptorCreate) {
Interceptor.attach(CCCryptorCreate, {
onEnter: function (args) {
console.log("\n[+] CCCryptorCreate Called!");
var operation = args[0].toInt32();
var algo = args[1].toInt32();
var options = args[2].toInt32();
var keyPtr = args[3];
var keyLength = args[4].toInt32();
var ivPtr = args[5];
console.log("    â”œâ”€â”€ Operation:", operation === 0 ? "Decrypt" : "Encrypt");
console.log("    â”œâ”€â”€ Algorithm:", algo === 0 ? "AES" : "Unknown");
console.log("    â”œâ”€â”€ Padding:", options & 1 ? "PKCS7" : "None");
if (!keyPtr.isNull()) {
var key = Memory.readByteArray(keyPtr, keyLength);
console.log("    â”œâ”€â”€ AES Key:", bytesToHex(key));
}
if (!ivPtr.isNull()) {
var iv = Memory.readByteArray(ivPtr, 16);
console.log("    â”œâ”€â”€ AES IV:", bytesToHex(iv));
}
}
});
} else {
console.log("[!] CCCryptorCreate not found!");
}
if (CCCryptorUpdate) {
Interceptor.attach(CCCryptorUpdate, {
onEnter: function (args) {
console.log("\n[+] CCCryptorUpdate Called!");
var inputPtr = args[1];
var inputLength = args[2].toInt32();
if (inputLength > 0) {
var inputData = Memory.readByteArray(inputPtr, inputLength);
console.log("    â”œâ”€â”€ AES Input Data:", bytesToHex(inputData));
}
},
onLeave: function (retval) {
console.log("    â”œâ”€â”€ AES Function Returned:", retval.toInt32());
console.log("[+] AES Hook Execution Completed.\n");
}
});
} else {
console.log("[!] CCCryptorUpdate not found!");
}
console.log("[*] Final iOS Hooking Script Loaded Successfully!");
function bytesToHex(byteArray) {
return Array.prototype.map.call(new Uint8Array(byteArray), x => ('00' + x.toString(16)).slice(-2)).join('');
}
