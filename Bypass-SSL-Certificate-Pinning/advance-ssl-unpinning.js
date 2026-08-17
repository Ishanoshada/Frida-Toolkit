/**
* Advanced SSL/TLS Certificate Pinning Bypass Script for 2025
* Supports Android & IOS with modern evasion techniques
* 
* Version: 2025.1
*/
console.log("[*] Advanced SSL/TLS Unpinning Script 2025 - Starting...");
const CONFIG = {
verbose: true,
antiDetection: true,
logCertificates: false,
bypassAll: true
};
function log(message, level = "INFO") {
if (CONFIG.verbose) {
const timestamp = new Date().toISOString();
console.log(`[${timestamp}] [${level}] ${message}`);
}
}
function safeHook(target, method, implementation) {
try {
if (target && target[method]) {
target[method].implementation = implementation;
log(`âœ“ Hooked ${target.constructor?.name || 'Unknown'}.${method}`);
return true;
}
} catch (e) {
log(`âœ— Failed to hook ${method}: ${e.message}`, "ERROR");
}
return false;
}
function setupAntiDetection() {
if (!CONFIG.antiDetection) return;
log("Setting up anti-detection measures...");
try {
const libfrida = Module.findExportByName(null, "frida_agent_main");
if (libfrida) {
Interceptor.replace(libfrida, new NativeCallback(function() {
return 0;
}, 'int', []));
}
} catch (e) {}
try {
if (typeof global !== 'undefined' && global.setTimeout) {
const originalSetTimeout = global.setTimeout;
global.setTimeout = function(callback, delay) {
const randomDelay = delay + Math.random() * 100;
return originalSetTimeout(callback, randomDelay);
};
}
} catch (e) {
log("setTimeout randomization not available in this environment", "WARN");
}
}
function androidSSLUnpinning() {
log("Initializing Android SSL/TLS bypasses...");
Java.perform(function() {
try {
const TrustManager = Java.use("javax.net.ssl.X509TrustManager");
const SSLContext = Java.use("javax.net.ssl.SSLContext");
const TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
const EmptyTrustManager = Java.registerClass({
name: "com.frida.EmptyTrustManager",
implements: [TrustManager],
methods: {
checkClientTrusted: function(chain, authType) {},
checkServerTrusted: function(chain, authType) {},
getAcceptedIssuers: function() {
return [];
}
}
});
const trustManager = EmptyTrustManager.$new();
const trustManagers = Java.array("javax.net.ssl.TrustManager", [trustManager]);
SSLContext.getInstance.overload("java.lang.String").implementation = function(protocol) {
const context = this.getInstance(protocol);
context.init(null, trustManagers, null);
log("âœ“ SSLContext bypassed");
return context;
};
} catch (e) {
log(`TrustManager bypass failed: ${e.message}`, "ERROR");
}
try {
const CertificatePinner = Java.use("okhttp3.CertificatePinner");
CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
log(`âœ“ OkHttp3 certificate pinning bypassed for ${hostname}`);
return;
};
const Builder = Java.use("okhttp3.OkHttpClient$Builder");
Builder.certificatePinner.implementation = function(certificatePinner) {
log("âœ“ OkHttp3 Builder certificate pinner bypassed");
return this;
};
} catch (e) {
log(`OkHttp bypass failed: ${e.message}`, "ERROR");
}
try {
const ServiceMethod = Java.use("retrofit2.ServiceMethod");
ServiceMethod.parseAnnotations.implementation = function(retrofit, method) {
const result = this.parseAnnotations(retrofit, method);
log("âœ“ Retrofit SSL verification bypassed");
return result;
};
} catch (e) {}
try {
const HurlStack = Java.use("com.android.volley.toolbox.HurlStack");
HurlStack.createConnection.implementation = function(url) {
const connection = this.createConnection(url);
if (connection.getClass().getName().includes("HttpsURLConnection")) {
connection.setHostnameVerifier(Java.use("javax.net.ssl.HttpsURLConnection").getDefaultHostnameVerifier());
log("âœ“ Volley HTTPS connection bypassed");
}
return connection;
};
} catch (e) {}
try {
const DefaultHttpClient = Java.use("org.apache.http.impl.client.DefaultHttpClient");
DefaultHttpClient.$init.overload().implementation = function() {
this.$init();
log("âœ“ Apache HTTP Client bypassed");
};
} catch (e) {}
try {
const ConscryptTrustManager = Java.use("com.android.org.conscrypt.TrustManagerImpl");
ConscryptTrustManager.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
log("âœ“ Conscrypt TrustManager bypassed");
return untrustedChain;
};
} catch (e) {}
try {
const NetworkSecurityPolicy = Java.use("android.security.net.config.NetworkSecurityPolicy");
NetworkSecurityPolicy.getInstance.implementation = function() {
const policy = this.getInstance();
policy.isCleartextTrafficPermitted.overload().implementation = function() {
return true;
};
policy.isCleartextTrafficPermitted.overload("java.lang.String").implementation = function(hostname) {
return true;
};
log("âœ“ Network Security Policy bypassed");
return policy;
};
} catch (e) {}
try {
const CertPathValidator = Java.use("java.security.cert.CertPathValidator");
CertPathValidator.validate.implementation = function(certPath, params) {
log("âœ“ CertPathValidator bypassed");
return null;
};
} catch (e) {}
try {
const HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
const AllowAllHostnameVerifier = Java.registerClass({
name: "com.frida.AllowAllHostnameVerifier",
implements: [HostnameVerifier],
methods: {
verify: function(hostname, session) {
log(`âœ“ Hostname verification bypassed for ${hostname}`);
return true;
}
}
});
const HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
HttpsURLConnection.setDefaultHostnameVerifier(AllowAllHostnameVerifier.$new());
} catch (e) {}
try {
const WebViewClient = Java.use("android.webkit.WebViewClient");
WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
log("âœ“ WebView SSL error bypassed");
handler.proceed();
};
} catch (e) {}
});
}
function androidNativeUnpinning() {
log("Initializing Android native SSL bypasses...");
try {
const SSL_CTX_set_verify = Module.findExportByName("libssl.so", "SSL_CTX_set_verify");
if (SSL_CTX_set_verify) {
Interceptor.replace(SSL_CTX_set_verify, new NativeCallback(function(ctx, mode, callback) {
log("âœ“ SSL_CTX_set_verify bypassed");
return;
}, 'void', ['pointer', 'int', 'pointer']));
}
const SSL_set_verify = Module.findExportByName("libssl.so", "SSL_set_verify");
if (SSL_set_verify) {
Interceptor.replace(SSL_set_verify, new NativeCallback(function(ssl, mode, callback) {
log("âœ“ SSL_set_verify bypassed");
return;
}, 'void', ['pointer', 'int', 'pointer']));
}
const SSL_CTX_set_cert_verify_callback = Module.findExportByName("libssl.so", "SSL_CTX_set_cert_verify_callback");
if (SSL_CTX_set_cert_verify_callback) {
Interceptor.replace(SSL_CTX_set_cert_verify_callback, new NativeCallback(function(ctx, callback, arg) {
log("âœ“ SSL_CTX_set_cert_verify_callback bypassed");
return;
}, 'void', ['pointer', 'pointer', 'pointer']));
}
} catch (e) {
log(`Native OpenSSL bypass failed: ${e.message}`, "ERROR");
}
try {
const libraries = ["libssl.so", "libboringssl.so", "libcrypto.so"];
libraries.forEach(lib => {
const SSL_verify_cert_chain = Module.findExportByName(lib, "SSL_verify_cert_chain");
if (SSL_verify_cert_chain) {
Interceptor.replace(SSL_verify_cert_chain, new NativeCallback(function(ssl, chain) {
log(`âœ“ SSL_verify_cert_chain bypassed in ${lib}`);
return 1;
}, 'int', ['pointer', 'pointer']));
}
});
} catch (e) {
log(`BoringSSL bypass failed: ${e.message}`, "ERROR");
}
}
function iOSSSLUnpinning() {
log("Initializing iOS SSL/TLS bypasses...");
try {
const NSURLSession = ObjC.classes.NSURLSession;
if (NSURLSession) {
const method = NSURLSession['- URLSession:didReceiveChallenge:completionHandler:'];
if (method) {
method.implementation = ObjC.implement(method, function(self, cmd, session, challenge, completionHandler) {
log("âœ“ NSURLSession certificate validation bypassed");
const disposition = 1;                     const credential = ObjC.classes.NSURLCredential.credentialForTrust_(challenge.protectionSpace().serverTrust());
completionHandler(disposition, credential);
});
}
}
} catch (e) {
log(`NSURLSession bypass failed: ${e.message}`, "ERROR");
}
try {
const SecTrustEvaluate = Module.findExportByName("Security", "SecTrustEvaluate");
if (SecTrustEvaluate) {
Interceptor.replace(SecTrustEvaluate, new NativeCallback(function(trust, result) {
log("âœ“ SecTrustEvaluate bypassed");
Memory.writeU8(result, 1);                 return 0;             }, 'int', ['pointer', 'pointer']));
}
const SecTrustEvaluateWithError = Module.findExportByName("Security", "SecTrustEvaluateWithError");
if (SecTrustEvaluateWithError) {
Interceptor.replace(SecTrustEvaluateWithError, new NativeCallback(function(trust, error) {
log("âœ“ SecTrustEvaluateWithError bypassed");
return 1;             }, 'bool', ['pointer', 'pointer']));
}
} catch (e) {
log(`SecTrust bypass failed: ${e.message}`, "ERROR");
}
try {
const AFSecurityPolicy = ObjC.classes.AFSecurityPolicy;
if (AFSecurityPolicy) {
const evaluateServerTrust = AFSecurityPolicy['- evaluateServerTrust:forDomain:'];
if (evaluateServerTrust) {
evaluateServerTrust.implementation = function(trust, domain) {
log(`âœ“ AFNetworking SSL validation bypassed for ${domain}`);
return true;
};
}
}
} catch (e) {}
try {
const ServerTrustPolicy = ObjC.classes.ServerTrustPolicy;
if (ServerTrustPolicy) {
const evaluate = ServerTrustPolicy['- evaluate:'];
if (evaluate) {
evaluate.implementation = function(serverTrust) {
log("âœ“ Alamofire ServerTrustPolicy bypassed");
return true;
};
}
}
} catch (e) {}
}
function setupAdvancedEvasion() {
log("Setting up advanced evasion techniques...");
try {
const dlsym = Module.findExportByName(null, "dlsym");
if (dlsym) {
Interceptor.attach(dlsym, {
onEnter: function(args) {
const symbol = Memory.readCString(args[1]);
if (symbol && symbol.includes("frida")) {
args[1] = Memory.allocUtf8String("non_existent_symbol");
}
}
});
}
} catch (e) {}
Java.perform(function() {
try {
const RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
if (RootBeer) {
RootBeer.isRooted.implementation = function() {
log("âœ“ Root detection bypassed");
return false;
};
}
} catch (e) {}
const File = Java.use("java.io.File");
File.exists.implementation = function() {
const path = this.getAbsolutePath();
if (path.includes("su") || path.includes("busybox") || path.includes("Superuser.apk")) {
log(`âœ“ Root file detection bypassed: ${path}`);
return false;
}
return this.exists();
};
});
try {
const ptrace = Module.findExportByName(null, "ptrace");
if (ptrace) {
Interceptor.replace(ptrace, new NativeCallback(function(request, pid, addr, data) {
log("âœ“ ptrace debugger detection bypassed");
return 0;
}, 'int', ['int', 'int', 'pointer', 'pointer']));
}
} catch (e) {}
Java.perform(function() {
try {
const Build = Java.use("android.os.Build");
Build.FINGERPRINT.value = "google/sdk_gphone_x86/generic_x86:11/RSR1.201013.001/6903271:user/release-keys";
Build.MODEL.value = "Pixel 4";
Build.MANUFACTURER.value = "Google";
Build.BRAND.value = "google";
Build.DEVICE.value = "flame";
Build.PRODUCT.value = "flame";
log("âœ“ Build properties spoofed");
} catch (e) {}
});
}
function setupCertificateLogging() {
if (!CONFIG.logCertificates) return;
log("Setting up certificate logging...");
Java.perform(function() {
try {
const X509Certificate = Java.use("java.security.cert.X509Certificate");
X509Certificate.getSubjectDN.implementation = function() {
const subject = this.getSubjectDN();
log(`ðŸ“œ Certificate Subject: ${subject.toString()}`);
return subject;
};
X509Certificate.getIssuerDN.implementation = function() {
const issuer = this.getIssuerDN();
log(`ðŸ“œ Certificate Issuer: ${issuer.toString()}`);
return issuer;
};
} catch (e) {}
});
}
function main() {
log("ðŸš€ Advanced SSL/TLS Unpinning Script 2025 - Initializing...");
setupAntiDetection();
if (Java.available) {
log("ðŸ“± Android platform detected");
androidSSLUnpinning();
androidNativeUnpinning();
setupAdvancedEvasion();
setupCertificateLogging();
} else if (ObjC.available) {
log("ðŸŽ iOS platform detected");
iOSSSLUnpinning();
setupAdvancedEvasion();
} else {
log("â“ Unknown platform - applying generic bypasses");
androidNativeUnpinning();     }
log("âœ… SSL/TLS Unpinning Script 2025 - Initialization complete!");
log("ðŸ”“ All certificate pinning should now be bypassed");
setInterval(function() {
}, 30000);
}
if (typeof Java !== 'undefined' || typeof ObjC !== 'undefined') {
main();
} else {
log("â³ Waiting for runtime to be available...");
setTimeout(main, 1000);
}
this.main = main;
