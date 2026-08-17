/* 
Android SSL Re-pinning frida script v0.1 @masbog 
$ frida -U -f it.app.mobile -l frida-android-unpinning-ssl.js
$ [Samsung GT-I9500::it.app.mobile]-> %resume
or
$ frida --codeshare masbog/frida-android-unpinning-ssl
$ [Samsung GT-I9500::it.app.mobile]-> %resume
TODO: bypass kony android application
original source code from: https:   
*/
setTimeout(function() {
Java.perform(function() {
console.log("");
console.log("[.] Android Cert Pinning Bypass");
var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
var FileInputStream = Java.use("java.io.FileInputStream");
var BufferedInputStream = Java.use("java.io.BufferedInputStream");
var X509Certificate = Java.use("java.security.cert.X509Certificate");
var KeyStore = Java.use("java.security.KeyStore");
var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
var SSLContext = Java.use("javax.net.ssl.SSLContext");
var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
console.log("[.] TrustManagerImpl Android 7+ detection...");
try {
var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
console.log("[+] (Android 7+) TrustManagerImpl verifyChain() called. Not throwing an exception.");
return untrustedChain;
}
PinningTrustManager.checkServerTrusted.implementation = function() {
console.log("[+] Appcelerator checkServerTrusted() called. Not throwing an exception.");
}
} catch (err) {
console.log("[-] TrustManagerImpl Not Found");
}
console.log("[.] TrustManager Android < 7 detection...");
var TrustManager = Java.registerClass({
name: 'com.sensepost.test.TrustManager',
implements: [X509TrustManager],
methods: {
checkClientTrusted: function(chain, authType) {},
checkServerTrusted: function(chain, authType) {},
getAcceptedIssuers: function() {
return [];
}
}
});
var TrustManagers = [TrustManager.$new()];
var SSLContext_init = SSLContext.init.overload(
'[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom');
try {
SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
console.log("[+] Overriding SSLContext.init() with the custom TrustManager android < 7");
SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
};
} catch (err) {
console.log("[-] TrustManager Not Found");
}
console.log("[.] OkHTTP 3.x detection...");
try {
var CertificatePinner = Java.use('okhttp3.CertificatePinner');
console.log("[+] OkHTTP 3.x Found");
CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
console.log("[+] OkHTTP 3.x check() called. Not throwing an exception.");
};
} catch (err) {
console.log("[-] OkHTTP 3.x Not Found")
}
console.log("[.] Appcelerator Titanium detection...");
try {
var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
console.log("[+] Appcelerator Titanium Found");
PinningTrustManager.checkServerTrusted.implementation = function() {
console.log("[+] Appcelerator checkServerTrusted() called. Not throwing an exception.");
}
} catch (err) {
console.log("[-] Appcelerator Titanium Not Found");
}
});
}, 0);
