/*
Android SSL Re-pinning frida script v0.4 (Combined Hooks - Crash Fix)
Targets multiple common Java methods for SSL pinning.
Addresses crash by returning correct type from TrustManagerImpl hook.
Requires the CA certificate of your proxy (e.g., mitmproxy, Burp)
in DER format to be placed at /data/local/tmp/cert-der.crt on the device.
Usage:
$ adb push your-proxy-ca-cert.der /data/local/tmp/cert-der.crt
$ frida -U -f your.package.name -l frida-android-repinning-v4.js --no-pause
*/
console.log("[.] Starting Android SSL Pinning Bypass/Re-Pinning v0.4 ...");
setTimeout(function() {
Java.perform(function() {
console.log("[.] Android SSL Re-Pinning v0.4");
var customCaFlag = false;         var customTrustManager; 
try {
var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
var FileInputStream = Java.use("java.io.FileInputStream");
var BufferedInputStream = Java.use("java.io.BufferedInputStream");
var X509Certificate = Java.use("java.security.cert.X509Certificate");
var KeyStore = Java.use("java.security.KeyStore");
var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
var ArrayList = Java.use("java.util.ArrayList"); 
console.log("[+] Loading custom CA certificate from /data/local/tmp/cert-der.crt ...");
var cf = CertificateFactory.getInstance("X.509");
var fileInputStream = FileInputStream.$new("/data/local/tmp/cert-der.crt");
var bufferedInputStream = BufferedInputStream.$new(fileInputStream);
var ca = cf.generateCertificate(bufferedInputStream);
bufferedInputStream.close();
var certInfo = Java.cast(ca, X509Certificate);
console.log("[+] Custom CA Loaded: " + certInfo.getSubjectDN());
console.log("[+] Creating KeyStore with custom CA...");
var keyStoreType = KeyStore.getDefaultType();
var keyStore = KeyStore.getInstance(keyStoreType);
keyStore.load(null, null);
keyStore.setCertificateEntry("ca", ca);
console.log("[+] Creating TrustManagerFactory trusting the custom CA...");
var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
tmf.init(keyStore);
customTrustManager = tmf.getTrustManagers();             customCaFlag = true;             console.log("[+] Custom TrustManager array created successfully.");
} catch (e) {
console.error("[!] Failed to load custom CA certificate. Re-pinning might not work.");
console.error("    Error: " + e);
console.error("    Ensure /data/local/tmp/cert-der.crt exists and is a valid DER certificate.");
}
try {
var SSLContext = Java.use("javax.net.ssl.SSLContext");
SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(keyManagers, trustManagers, secureRandom) {
console.log("[+] Intercepted SSLContext.init(KeyManager[], TrustManager[], SecureRandom)");
if (customCaFlag) {
console.log("    >> Replacing TrustManager with custom one(s).");
SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, keyManagers, customTrustManager, secureRandom);
console.log("    >> SSLContext initialized with custom TrustManager.");
} else {
console.log("    >> Custom CA not loaded, calling original init method.");
SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, keyManagers, trustManagers, secureRandom);
}
};
console.log("[+] SSLContext.init hook installed.");
} catch (e) {
console.warn("[!] Failed to hook SSLContext.init: " + e);
}
try {
var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
TrustManagerFactory.init.overload("java.security.KeyStore").implementation = function(keystore) {
console.log("[+] Intercepted TrustManagerFactory.init(KeyStore)");
TrustManagerFactory.init.overload("java.security.KeyStore").call(this, keystore);
};
console.log("[+] TrustManagerFactory.init hook installed.");
} catch(e) {
console.warn("[!] Failed to hook TrustManagerFactory.init: " + e);
}
try {
var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
var ArrayList = Java.use("java.util.ArrayList"); 
var methods = TrustManagerImpl.class.getDeclaredMethods();
var hookedCount = 0;
methods.forEach(function(method) {
if (method.getName() === "checkServerTrusted") {
var overload = method.getParameterTypes().map(function(type) { return type.getName(); });
console.log("    Attempting to hook TrustManagerImpl.checkServerTrusted overload: (" + overload.join(", ") + ")");
TrustManagerImpl.checkServerTrusted.overload.apply(TrustManagerImpl.checkServerTrusted, overload).implementation = function() {
var args = Array.from(arguments);
var authType = args[1];                         var hostOrSocketOrEngine = args[args.length - 1]; 
console.log("[+] Intercepted TrustManagerImpl.checkServerTrusted (" + overload.join(", ") + ")");
if (typeof hostOrSocketOrEngine === 'string') {                              console.log("    >> Host: " + hostOrSocketOrEngine);
}
console.log("    >> AuthType: " + authType);
console.log("    >> CRASH FIX: Returning empty ArrayList instead of void.");
return ArrayList.$new();
};
hookedCount++;
}
});
if (hookedCount > 0) {
console.log("[+] TrustManagerImpl.checkServerTrusted hooks installed (" + hookedCount + " overloads).");
} else {
console.warn("[!] No checkServerTrusted methods found or hooked in TrustManagerImpl.");
}
} catch (e) {
console.warn("[!] Failed to hook TrustManagerImpl methods. App might use a different TrustManager implementation. Error: " + e);
}
try {
var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
X509TrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function (chain, authType) {
console.log("[+] Intercepted X509TrustManager(Interface).checkServerTrusted(chain, authType): " + authType);
console.log("    >> Bypassing check (returning void). Primary re-pinning via SSLContext.init if active.");
return;
};
console.log("[+] X509TrustManager (Interface) checkServerTrusted hook installed.");
} catch (err_intf) {
console.warn("[!] Failed to hook checkServerTrusted (Interface): " + err_intf);
}
try {
var CertificatePinner = Java.use("okhttp3.CertificatePinner");
CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
console.log("[+] Intercepted okhttp3.CertificatePinner.check for hostname: " + hostname);
console.log("    >> Bypassing OkHttp3 Certificate Pinning check.");
return;             };
try {
CertificatePinner.check.overload("java.lang.String", "[Ljava.security.cert.Certificate;").implementation = function(hostname, peerCertificates) {
console.log("[+] Intercepted okhttp3.CertificatePinner.check (Cert Array) for hostname: " + hostname);
console.log("    >> Bypassing OkHttp3 Certificate Pinning check.");
return;
};
} catch (e_arr) {  }
console.log("[+] OkHttp3 CertificatePinner.check hook installed.");
} catch (e) {
console.warn("[!] Failed to hook OkHttp3 CertificatePinner.check (App might not use OkHttp3 or uses different version): " + e);
}
try {
var OkHttpClientBuilder = Java.use("okhttp3.OkHttpClient$Builder");
try {
OkHttpClientBuilder.sslSocketFactory.overload("javax.net.ssl.SSLSocketFactory", "javax.net.ssl.X509TrustManager").implementation = function(sslSocketFactory, trustManager) {
console.log("[+] Intercepted OkHttpClient.Builder.sslSocketFactory(SSLSocketFactory, X509TrustManager)");
if (customCaFlag) {
console.log("    >> Replacing TrustManager with custom one.");
var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");                         return OkHttpClientBuilder.sslSocketFactory.overload("javax.net.ssl.SSLSocketFactory", "javax.net.ssl.X509TrustManager").call(this, sslSocketFactory, Java.cast(customTrustManager[0], X509TrustManager));
} else {
console.log("    >> Custom CA not loaded, allowing original call.");
return OkHttpClientBuilder.sslSocketFactory.overload("javax.net.ssl.SSLSocketFactory", "javax.net.ssl.X509TrustManager").call(this, sslSocketFactory, trustManager);
}
};
} catch (e_ssf_tm) {
console.warn("   - Failed to hook Builder.sslSocketFactory(ssf, tm): " + e_ssf_tm);
}
try {
OkHttpClientBuilder.sslSocketFactory.overload("javax.net.ssl.SSLSocketFactory").implementation = function(sslSocketFactory) {
console.log("[+] Intercepted OkHttpClient.Builder.sslSocketFactory(SSLSocketFactory) [Deprecated]");
console.log("    >> WARNING: Cannot inject custom TrustManager here easily. Allowing original call.");
return OkHttpClientBuilder.sslSocketFactory.overload("javax.net.ssl.SSLSocketFactory").call(this, sslSocketFactory);
};
} catch(e_dep) {  }
try {
OkHttpClientBuilder.hostnameVerifier.overload("javax.net.ssl.HostnameVerifier").implementation = function(hostnameVerifier) {
console.log("[+] Intercepted OkHttpClient.Builder.hostnameVerifier(HostnameVerifier)");
console.log("    >> Replacing HostnameVerifier with one that ALLOWS ALL hostnames.");
var permissiveVerifier = Java.registerClass({
name: 'com.example.bypass.PermissiveHostnameVerifier',                          implements: [Java.use('javax.net.ssl.HostnameVerifier')],
methods: {
verify: [{
returnType: 'boolean',
argumentTypes: ['java.lang.String', 'javax.net.ssl.SSLSession'],
implementation: function(hostname, session) {
console.log("    >> PermissiveHostnameVerifier.verify called for: " + hostname + ". Allowing.");
return true;
}
}]
}
}).$new();
return OkHttpClientBuilder.hostnameVerifier.overload("javax.net.ssl.HostnameVerifier").call(this, permissiveVerifier);
};
} catch(e_hv) {
console.warn("   - Failed to hook Builder.hostnameVerifier: " + e_hv);
}
console.log("[+] OkHttpClient$Builder hooks installed.");
} catch(e) {
console.warn("[!] Failed to hook OkHttpClient$Builder methods (App might not use OkHttp3): " + e);
}
try {
var HostnameVerifier = Java.use("javax.net.ssl.HostnameVerifier");
HostnameVerifier.verify.overload("java.lang.String", "javax.net.ssl.SSLSession").implementation = function(hostname, session) {
console.log("[+] Intercepted HostnameVerifier.verify for hostname: " + hostname);
console.log("    >> Allowing hostname (returning true).");
return true;
}
console.log("[+] HostnameVerifier.verify hook installed.");
} catch (e) {
console.warn("[!] Failed to hook HostnameVerifier.verify: " + e);
}
console.log("[+] All hooks installed. Waiting for network activity...");
}); }, 0);
