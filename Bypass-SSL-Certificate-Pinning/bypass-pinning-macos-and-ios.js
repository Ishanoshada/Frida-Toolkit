console.log("[*] Starting iOS SSL Pinning Bypass Script");
function getFuncPtr(moduleName, funcName) {
const ptr = Module.findExportByName(moduleName, funcName);
if (!ptr) {
return null;
}
return ptr;
}
function bypassAFNetworking() {
if (!ObjC.classes.AFHTTPSessionManager || !ObjC.classes.AFSecurityPolicy) {
return;
}
console.log("[+] Found AFNetworking, attempting to hook pinning methods...");
const {
AFSecurityPolicy
} = ObjC.classes;
try {
const setSSLPinningMode = AFSecurityPolicy["- setSSLPinningMode:"];
Interceptor.attach(setSSLPinningMode.implementation, {
onEnter: function(args) {
const originalMode = args[2].toUInt32();
console.log(`[*] Called -[AFSecurityPolicy setSSLPinningMode:] with mode ${originalMode}`);
if (originalMode !== 0) {
console.log(`[*]   >> Overriding mode to 0 (AFSSLPinningModeNone)`);
args[2] = ptr(0);
}
},
});
console.log("[+] Hooked -[AFSecurityPolicy setSSLPinningMode:]");
} catch (err) {
console.log("[-] Failed to hook -[AFSecurityPolicy setSSLPinningMode:]: " + err.message);
}
try {
const setAllowInvalidCertificates = AFSecurityPolicy["- setAllowInvalidCertificates:"];
Interceptor.attach(setAllowInvalidCertificates.implementation, {
onEnter: function(args) {
const originalAllow = args[2].toUInt32();
console.log(`[*] Called -[AFSecurityPolicy setAllowInvalidCertificates:] with allow ${originalAllow}`);
if (originalAllow === 0) {
console.log(`[*]   >> Overriding allow to 1 (YES)`);
args[2] = ptr(1);
}
},
});
console.log("[+] Hooked -[AFSecurityPolicy setAllowInvalidCertificates:]");
} catch (err) {
console.log("[-] Failed to hook -[AFSecurityPolicy setAllowInvalidCertificates:]: " + err.message);
}
try {
const policyWithPinningMode = AFSecurityPolicy["+ policyWithPinningMode:"];
Interceptor.attach(policyWithPinningMode.implementation, {
onEnter: function(args) {
const originalMode = args[2].toUInt32();
console.log(`[*] Called +[AFSecurityPolicy policyWithPinningMode:] with mode ${originalMode}`);
if (originalMode !== 0) {
console.log(`[*]   >> Overriding mode to 0 (AFSSLPinningModeNone)`);
args[2] = ptr(0);
}
},
});
console.log("[+] Hooked +[AFSecurityPolicy policyWithPinningMode:]");
} catch (err) {
console.log("[-] Failed to hook +[AFSecurityPolicy policyWithPinningMode:]: " + err.message);
}
try {
if (AFSecurityPolicy.hasOwnProperty("+ policyWithPinningMode:withPinnedCertificates:")) {
const policyWithPinningModeCerts = AFSecurityPolicy["+ policyWithPinningMode:withPinnedCertificates:"];
Interceptor.attach(policyWithPinningModeCerts.implementation, {
onEnter: function(args) {
const originalMode = args[2].toUInt32();
console.log(
`[*] Called +[AFSecurityPolicy policyWithPinningMode:withPinnedCertificates:] with mode ${originalMode}`,
);
if (originalMode !== 0) {
console.log(`[*]   >> Overriding mode to 0 (AFSSLPinningModeNone)`);
args[2] = ptr(0);
}
},
});
console.log("[+] Hooked +[AFSecurityPolicy policyWithPinningMode:withPinnedCertificates:]");
} else {
}
} catch (err) {
console.log("[-] Failed to hook +[AFSecurityPolicy policyWithPinningMode:withPinnedCertificates:]: " + err.message);
}
}
function bypassNSURLSession() {
console.log("[*] Searching for NSURLSession delegate methods...");
const resolver = new ApiResolver("objc");
const matches = resolver.enumerateMatches("-[* URLSession:didReceiveChallenge:completionHandler:]");
if (matches.length === 0) {
console.log("[-] No NSURLSession delegate methods found matching the pattern.");
return;
}
console.log(`[+] Found ${matches.length} potential NSURLSession delegate method(s). Hooking...`);
matches.forEach(function(match) {
Interceptor.attach(match.address, {
onEnter: function(args) {
try {
const receiver = new ObjC.Object(args[0]);
const selector = ObjC.selectorAsString(args[1]);
const challenge = new ObjC.Object(args[3]);
const protectionSpace = challenge.protectionSpace();
const authMethod = protectionSpace.authenticationMethod();
if (authMethod.toString() === "NSURLAuthenticationMethodServerTrust") {
console.log(`[*] Called -[${receiver.$className} ${selector}] for Server Trust challenge`);
const completionHandler = new ObjC.Block(args[4]);
const originalCompletionHandler = completionHandler.implementation;
completionHandler.implementation = function(disposition, credential) {
console.log(`[*]   >> Intercepting completionHandler for -[${receiver.$className} ${selector}]`);
const NSURLCredential = ObjC.classes.NSURLCredential;
const trustCredential = NSURLCredential.credentialForTrust_(protectionSpace.serverTrust());
console.log(`[*]   >> Calling original completionHandler with UseCredential (0)`);
originalCompletionHandler(0, trustCredential);                         };
console.log(`[+] Patched completionHandler for -[${receiver.$className} ${selector}]`);
} else {
}
} catch (err) {
console.log(`[-] Error in NSURLSession hook for ${match.name}: ${err.message}`);
}
},
});
console.log(`[+] Hooked ${match.name}`);
});
}
function bypassTrustKit() {
if (!ObjC.classes.TSKPinningValidator) {
return;
}
console.log("[+] Found TrustKit, attempting to hook pinning validation...");
try {
const evaluateTrust = ObjC.classes.TSKPinningValidator["- evaluateTrust:forHostname:"];
Interceptor.attach(evaluateTrust.implementation, {
onLeave: function(retval) {
const originalResult = retval.toInt32();
console.log(`[*] Called -[TSKPinningValidator evaluateTrust:forHostname:], original result: ${originalResult}`);
if (originalResult !== 0) {
console.log(`[*]   >> Overriding result to 0 (Success)`);
retval.replace(ptr(0));
}
},
});
console.log("[+] Hooked -[TSKPinningValidator evaluateTrust:forHostname:]");
} catch (err) {
console.log("[-] Failed to hook -[TSKPinningValidator evaluateTrust:forHostname:]: " + err.message);
}
}
function bypassCordovaPlugin() {
if (!ObjC.classes.CustomURLConnectionDelegate) {
return;
}
console.log("[+] Found Cordova SSLCertificateChecker-PhoneGap-Plugin, attempting to hook...");
try {
const isFingerprintTrusted = ObjC.classes.CustomURLConnectionDelegate["- isFingerprintTrusted:"];
Interceptor.attach(isFingerprintTrusted.implementation, {
onLeave: function(retval) {
const originalTrusted = retval.toUInt32();
console.log(
`[*] Called -[CustomURLConnectionDelegate isFingerprintTrusted:], original result: ${originalTrusted}`,
);
if (originalTrusted === 0) {
console.log(`[*]   >> Overriding result to 1 (YES)`);
retval.replace(ptr(1));
}
},
});
console.log("[+] Hooked -[CustomURLConnectionDelegate isFingerprintTrusted:]");
} catch (err) {
console.log("[-] Failed to hook -[CustomURLConnectionDelegate isFingerprintTrusted:]: " + err.message);
}
}
function bypassSecurityFramework() {
console.log("[*] Hooking low-level Security framework functions...");
const kSSLSessionOptionBreakOnServerAuth = 0;
const errSSLServerAuthCompleted = -9841;     const noErr = 0;
const SSLSetSessionOptionPtr = getFuncPtr("Security", "SSLSetSessionOption");
if (SSLSetSessionOptionPtr) {
const SSLSetSessionOption = new NativeFunction(SSLSetSessionOptionPtr, "int", ["pointer", "int", "bool"]);
Interceptor.replace(
SSLSetSessionOptionPtr,
new NativeCallback(
function(context, option, value) {
if (option === kSSLSessionOptionBreakOnServerAuth) {
console.log(
"[*] Called SSLSetSessionOption with kSSLSessionOptionBreakOnServerAuth, preventing server auth break.",
);
return noErr;                     }
return SSLSetSessionOption(context, option, value);
},
"int", ["pointer", "int", "bool"],
),
);
console.log("[+] Replaced SSLSetSessionOption");
} else {
console.log("[-] SSLSetSessionOption not found.");
}
const SSLCreateContextPtr = getFuncPtr("Security", "SSLCreateContext");
if (SSLCreateContextPtr && SSLSetSessionOptionPtr) {
const SSLCreateContext = new NativeFunction(SSLCreateContextPtr, "pointer", ["pointer", "int", "int"]);
const SSLSetSessionOption = new NativeFunction(SSLSetSessionOptionPtr, "int", ["pointer", "int", "bool"]);         Interceptor.replace(
SSLCreateContextPtr,
new NativeCallback(
function(alloc, protocolSide, connectionType) {
console.log("[*] Called SSLCreateContext");
const sslContext = SSLCreateContext(alloc, protocolSide, connectionType);
if (sslContext) {
const result = SSLSetSessionOption(sslContext, kSSLSessionOptionBreakOnServerAuth, 1);                         console.log(
`[*]   >> Setting kSSLSessionOptionBreakOnServerAuth on new context: ${result === noErr ? "Success" : "Fail (" + result + ")"}`,
);
}
return sslContext;
},
"pointer", ["pointer", "int", "int"],
),
);
console.log("[+] Replaced SSLCreateContext");
} else {
console.log("[-] SSLCreateContext (or dependency SSLSetSessionOption) not found.");
}
const SSLHandshakePtr = getFuncPtr("Security", "SSLHandshake");
if (SSLHandshakePtr) {
const SSLHandshake = new NativeFunction(SSLHandshakePtr, "int", ["pointer"]);
Interceptor.replace(
SSLHandshakePtr,
new NativeCallback(
function(context) {
console.log("[*] Called SSLHandshake");
const result = SSLHandshake(context);
if (result === errSSLServerAuthCompleted) {
console.log(`[*]   >> SSLHandshake returned ${result} (errSSLServerAuthCompleted), retrying handshake...`);
const retryResult = SSLHandshake(context);
console.log(`[*]   >> Retry result: ${retryResult}`);
return retryResult;
}
console.log(`[*]   >> SSLHandshake result: ${result}`);
return result;
},
"int", ["pointer"],
),
);
console.log("[+] Replaced SSLHandshake");
} else {
console.log("[-] SSLHandshake not found.");
}
}
function bypassTls() {
console.log("[*] Hooking low-level TLS functions (iOS 10+)...");
const noErr = 0;
const tlsHelperCreatePeerTrustPtr = getFuncPtr("libcoretls_cfhelpers.dylib", "tls_helper_create_peer_trust");
if (tlsHelperCreatePeerTrustPtr) {
Interceptor.replace(
tlsHelperCreatePeerTrustPtr,
new NativeCallback(
function(hdsk, server,  trustRefPtr) {
console.log("[*] Called tls_helper_create_peer_trust, returning noErr (0) to bypass trust evaluation.");
return noErr;
},
"int", ["pointer", "bool", "pointer"],
),
);
console.log("[+] Replaced tls_helper_create_peer_trust");
} else {
}
const nwTlsCreatePeerTrustPtr = getFuncPtr("libnetwork.dylib", "nw_tls_create_peer_trust");
if (nwTlsCreatePeerTrustPtr) {
Interceptor.attach(nwTlsCreatePeerTrustPtr, {
onEnter: function(args) {
console.log(
"[*] Called nw_tls_create_peer_trust (Note: Bypass for this is complex and not fully implemented here, logging only).",
);
},
});
console.log("[+] Attached to nw_tls_create_peer_trust (logging only)");
} else {
}
}
function bypassBoringSSL() {
console.log("[*] Hooking low-level BoringSSL functions (iOS 11+)...");
const SSL_VERIFY_NONE = 0;
let setCustomVerifyPtr = getFuncPtr("libboringssl.dylib", "SSL_set_custom_verify");
let isCtxVariant = false;
if (!setCustomVerifyPtr) {
console.log("[-] SSL_set_custom_verify not found, trying SSL_CTX_set_custom_verify...");
setCustomVerifyPtr = getFuncPtr("libboringssl.dylib", "SSL_CTX_set_custom_verify");
isCtxVariant = true;
}
if (setCustomVerifyPtr) {
const funcName = isCtxVariant ? "SSL_CTX_set_custom_verify" : "SSL_set_custom_verify";
const setCustomVerify = new NativeFunction(setCustomVerifyPtr, "void", ["pointer", "int", "pointer"]);
const customVerifyCallback = new NativeCallback(
function(ssl,  out_alert) {
console.log(`[*] Called custom BoringSSL verify callback for ${funcName}, returning SSL_VERIFY_NONE (0).`);
return SSL_VERIFY_NONE;
},
"int", ["pointer", "pointer"],
);
Interceptor.replace(
setCustomVerifyPtr,
new NativeCallback(
function(sslOrCtx, mode, callback) {
console.log(`[*] Called ${funcName}, replacing callback with one that always returns success.`);
setCustomVerify(sslOrCtx, mode, customVerifyCallback);
},
"void", ["pointer", "int", "pointer"],
),
);
console.log(`[+] Replaced ${funcName}`);
} else {
console.log("[-] Neither SSL_set_custom_verify nor SSL_CTX_set_custom_verify found in libboringssl.");
}
const getPskIdentityPtr = getFuncPtr("libboringssl.dylib", "SSL_get_psk_identity");
if (getPskIdentityPtr) {
Interceptor.replace(
getPskIdentityPtr,
new NativeCallback(
function(ssl) {
console.log("[*] Called SSL_get_psk_identity, returning dummy PSK identity 'fakePSKidentity'.");
return Memory.allocUtf8String("fakePSKidentity");
},
"pointer", ["pointer"],
),
);
console.log("[+] Replaced SSL_get_psk_identity");
} else {
}
}
if (ObjC.available) {
console.log("[*] Objective-C Runtime detected. Proceeding with hooks...");
bypassAFNetworking();
bypassNSURLSession();
bypassTrustKit();
bypassCordovaPlugin();
bypassSecurityFramework();
bypassTls();
bypassBoringSSL();
console.log("[*] iOS SSL Pinning Bypass script finished applying hooks.");
} else {
console.log("[-] Objective-C Runtime is not available. This script is designed for iOS.");
}
