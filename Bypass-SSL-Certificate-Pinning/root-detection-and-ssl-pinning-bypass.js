/*
* This script is a combination of various bypass techniques, successfully tested on TrustManagerImpl (Android > 7) 
* and designed to work reliably in most scenarios.
* by Astik Rawat
*
* Run with:
* frida -U -f <APP_ID> -l root-detection-and-ssl-pinning-bypass.js (Locally)
OR
* frida -U -f <APP_ID> --codeshare ahrixia/root-detection-and-ssl-pinning-bypass (Remote)
*
** References:
* - https: * - https: */
Java.perform(function() {
console.log("[*] Starting Root Detection Bypass");
var RootPackages = ["com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
"com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
"com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
"de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
"com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
"eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
];
var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];
var PackageManager = Java.use("android.app.ApplicationPackageManager");
var NativeFile = Java.use('java.io.File');
var Runtime = Java.use('java.lang.Runtime');
var SystemProperties = Java.use('android.os.SystemProperties');
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
if (RootPackages.indexOf(pname) > -1) {
console.log("[+] Bypassing root check for package: " + pname);
pname = "set.package.name.to.a.fake.one";
}
return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
};
NativeFile.exists.implementation = function() {
var name = NativeFile.getName.call(this);
if (RootBinaries.indexOf(name) > -1) {
console.log("[+] Bypassing binary check for: " + name);
return false;
}
return this.exists.call(this);
};
Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
if (cmd.indexOf("getprop") !== -1 || cmd === "id" || cmd === "su") {
console.log("[+] Bypassing command: " + cmd);
return null;
}
return this.exec.call(this, cmd);
};
SystemProperties.get.overload('java.lang.String').implementation = function(name) {
if (name === "ro.debuggable" || name === "service.adb.root" || name === "ro.secure") {
console.log("[+] Bypassing property: " + name);
return "0";
}
return this.get.call(this, name);
};
console.log("[*] Root Detection Bypass Applied");
});
/*  Android ssl certificate pinning bypass script for various methods
by Maurizio Siddu
*/
setTimeout(function() {
Java.perform(function() {
console.log('');
console.log('======');
console.log('[#] Android Bypass for various Certificate Pinning methods [#]');
console.log('======');
var errDict = {};
var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
var SSLContext = Java.use('javax.net.ssl.SSLContext');
var TrustManager = Java.registerClass({
name: 'dev.asd.test.TrustManager',
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
console.log('[+] Bypassing Trustmanager (Android < 7) pinner');
SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
};
} catch (err) {
console.log('[-] TrustManager (Android < 7) pinner not found');
}
try {
var okhttp3_Activity_1 = Java.use('okhttp3.CertificatePinner');
okhttp3_Activity_1.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
console.log('[+] Bypassing OkHTTPv3 {1}: ' + a);
return;
};
} catch (err) {
console.log('[-] OkHTTPv3 {1} pinner not found');
errDict[err] = ['okhttp3.CertificatePinner', 'check'];
}
try {
var okhttp3_Activity_2 = Java.use('okhttp3.CertificatePinner');
okhttp3_Activity_2.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
console.log('[+] Bypassing OkHTTPv3 {2}: ' + a);
return;
};
} catch (err) {
console.log('[-] OkHTTPv3 {2} pinner not found');
}
try {
var okhttp3_Activity_3 = Java.use('okhttp3.CertificatePinner');
okhttp3_Activity_3.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(a, b) {
console.log('[+] Bypassing OkHTTPv3 {3}: ' + a);
return;
};
} catch (err) {
console.log('[-] OkHTTPv3 {3} pinner not found');
errDict[err] = ['okhttp3.CertificatePinner', 'check'];
}
try {
var okhttp3_Activity_4 = Java.use('okhttp3.CertificatePinner');
okhttp3_Activity_4.check$okhttp.overload('java.lang.String', 'kotlin.jvm.functions.Function0').implementation = function(a, b) {
console.log('[+] Bypassing OkHTTPv3 {4}: ' + a);
return;
};
} catch (err) {
console.log('[-] OkHTTPv3 {4} pinner not found');
errDict[err] = ['okhttp3.CertificatePinner', 'check$okhttp'];
}
try {
var trustkit_Activity_1 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
trustkit_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
console.log('[+] Bypassing Trustkit {1}: ' + a);
return true;
};
} catch (err) {
console.log('[-] Trustkit {1} pinner not found');
errDict[err] = ['com.datatheorem.android.trustkit.pinning.OkHostnameVerifier', 'verify'];
}
try {
var trustkit_Activity_2 = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
trustkit_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
console.log('[+] Bypassing Trustkit {2}: ' + a);
return true;
};
} catch (err) {
console.log('[-] Trustkit {2} pinner not found');
errDict[err] = ['com.datatheorem.android.trustkit.pinning.OkHostnameVerifier', 'verify'];
}
try {
var trustkit_PinningTrustManager = Java.use('com.datatheorem.android.trustkit.pinning.PinningTrustManager');
trustkit_PinningTrustManager.checkServerTrusted.overload('[Ljava.security.cert.X509Certificate;', 'java.lang.String').implementation = function(chain, authType) {
console.log('[+] Bypassing Trustkit {3}');
};
} catch (err) {
console.log('[-] Trustkit {3} pinner not found');
errDict[err] = ['com.datatheorem.android.trustkit.pinning.PinningTrustManager', 'checkServerTrusted'];
}
try {
var array_list = Java.use("java.util.ArrayList");
var TrustManagerImpl_Activity_1 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl_Activity_1.checkTrustedRecursive.implementation = function(certs, ocspData, tlsSctData, host, clientAuth, untrustedChain, trustAnchorChain, used) {
console.log('[+] Bypassing TrustManagerImpl (Android > 7) checkTrustedRecursive check for: ' + host);
return array_list.$new();
};
} catch (err) {
console.log('[-] TrustManagerImpl (Android > 7) checkTrustedRecursive check not found');
errDict[err] = ['com.android.org.conscrypt.TrustManagerImpl', 'checkTrustedRecursive'];
}
try {
var TrustManagerImpl_Activity_2 = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl_Activity_2.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
console.log('[+] Bypassing TrustManagerImpl (Android > 7) verifyChain check for: ' + host);
return untrustedChain;
};
} catch (err) {
console.log('[-] TrustManagerImpl (Android > 7) verifyChain check not found');
errDict[err] = ['com.android.org.conscrypt.TrustManagerImpl', 'verifyChain'];
}
try {
var appcelerator_PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
appcelerator_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
console.log('[+] Bypassing Appcelerator PinningTrustManager');
return;
};
} catch (err) {
console.log('[-] Appcelerator PinningTrustManager pinner not found');
errDict[err] = ['appcelerator.https.PinningTrustManager', 'checkServerTrusted'];
}
try {
var fabric_PinningTrustManager = Java.use('io.fabric.sdk.android.services.network.PinningTrustManager');
fabric_PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
console.log('[+] Bypassing Fabric PinningTrustManager');
return;
};
} catch (err) {
console.log('[-] Fabric PinningTrustManager pinner not found');
errDict[err] = ['io.fabric.sdk.android.services.network.PinningTrustManager', 'checkServerTrusted'];
}
try {
var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certRefs, JavaObject, authMethod) {
console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {1}');
};
} catch (err) {
console.log('[-] OpenSSLSocketImpl Conscrypt {1} pinner not found');
errDict[err] = ['com.android.org.conscrypt.OpenSSLSocketImpl', 'verifyCertificateChain'];
}
try {
var OpenSSLSocketImpl = Java.use('com.android.org.conscrypt.OpenSSLSocketImpl');
OpenSSLSocketImpl.verifyCertificateChain.implementation = function(certChain, authMethod) {
console.log('[+] Bypassing OpenSSLSocketImpl Conscrypt {2}');
};
} catch (err) {
console.log('[-] OpenSSLSocketImpl Conscrypt {2} pinner not found');
errDict[err] = ['com.android.org.conscrypt.OpenSSLSocketImpl', 'verifyCertificateChain'];
}
try {
var OpenSSLEngineSocketImpl_Activity = Java.use('com.android.org.conscrypt.OpenSSLEngineSocketImpl');
OpenSSLEngineSocketImpl_Activity.verifyCertificateChain.overload('[Ljava.lang.Long;', 'java.lang.String').implementation = function(a, b) {
console.log('[+] Bypassing OpenSSLEngineSocketImpl Conscrypt: ' + b);
};
} catch (err) {
console.log('[-] OpenSSLEngineSocketImpl Conscrypt pinner not found');
errDict[err] = ['com.android.org.conscrypt.OpenSSLEngineSocketImpl', 'verifyCertificateChain'];
}
try {
var OpenSSLSocketImpl_Harmony = Java.use('org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl');
OpenSSLSocketImpl_Harmony.verifyCertificateChain.implementation = function(asn1DerEncodedCertificateChain, authMethod) {
console.log('[+] Bypassing OpenSSLSocketImpl Apache Harmony');
};
} catch (err) {
console.log('[-] OpenSSLSocketImpl Apache Harmony pinner not found');
errDict[err] = ['org.apache.harmony.xnet.provider.jsse.OpenSSLSocketImpl', 'verifyCertificateChain'];
}
try {
var phonegap_Activity = Java.use('nl.xservices.plugins.sslCertificateChecker');
phonegap_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
console.log('[+] Bypassing PhoneGap sslCertificateChecker: ' + a);
return true;
};
} catch (err) {
console.log('[-] PhoneGap sslCertificateChecker pinner not found');
errDict[err] = ['nl.xservices.plugins.sslCertificateChecker', 'execute'];
}
try {
var WLClient_Activity_1 = Java.use('com.worklight.wlclient.api.WLClient');
WLClient_Activity_1.getInstance().pinTrustedCertificatePublicKey.overload('java.lang.String').implementation = function(cert) {
console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {1}: ' + cert);
return;
};
} catch (err) {
console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {1} pinner not found');
errDict[err] = ['com.worklight.wlclient.api.WLClient', 'pinTrustedCertificatePublicKey'];
}
try {
var WLClient_Activity_2 = Java.use('com.worklight.wlclient.api.WLClient');
WLClient_Activity_2.getInstance().pinTrustedCertificatePublicKey.overload('[Ljava.lang.String;').implementation = function(cert) {
console.log('[+] Bypassing IBM MobileFirst pinTrustedCertificatePublicKey {2}: ' + cert);
return;
};
} catch (err) {
console.log('[-] IBM MobileFirst pinTrustedCertificatePublicKey {2} pinner not found');
errDict[err] = ['com.worklight.wlclient.api.WLClient', 'pinTrustedCertificatePublicKey'];
}
try {
var worklight_Activity_1 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
worklight_Activity_1.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {1}: ' + a);
return;
};
} catch (err) {
console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {1} pinner not found');
errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
}
try {
var worklight_Activity_2 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
worklight_Activity_2.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {2}: ' + a);
return;
};
} catch (err) {
console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {2} pinner not found');
errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
}
try {
var worklight_Activity_3 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
worklight_Activity_3.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(a, b) {
console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {3}: ' + a);
return;
};
} catch (err) {
console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {3} pinner not found');
errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
}
try {
var worklight_Activity_4 = Java.use('com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning');
worklight_Activity_4.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
console.log('[+] Bypassing IBM WorkLight HostNameVerifierWithCertificatePinning {4}: ' + a);
return true;
};
} catch (err) {
console.log('[-] IBM WorkLight HostNameVerifierWithCertificatePinning {4} pinner not found');
errDict[err] = ['com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning', 'verify'];
}
try {
var conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
conscrypt_CertPinManager_Activity.checkChainPinning.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
console.log('[+] Bypassing Conscrypt CertPinManager: ' + a);
return;
};
} catch (err) {
console.log('[-] Conscrypt CertPinManager pinner not found');
errDict[err] = ['com.android.org.conscrypt.CertPinManager', 'checkChainPinning'];
}
try {
var legacy_conscrypt_CertPinManager_Activity = Java.use('com.android.org.conscrypt.CertPinManager');
legacy_conscrypt_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
console.log('[+] Bypassing Conscrypt CertPinManager (Legacy): ' + a);
return true;
};
} catch (err) {
console.log('[-] Conscrypt CertPinManager (Legacy) pinner not found');
errDict[err] = ['com.android.org.conscrypt.CertPinManager', 'isChainValid'];
}
try {
var cwac_CertPinManager_Activity = Java.use('com.commonsware.cwac.netsecurity.conscrypt.CertPinManager');
cwac_CertPinManager_Activity.isChainValid.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
console.log('[+] Bypassing CWAC-Netsecurity CertPinManager: ' + a);
return true;
};
} catch (err) {
console.log('[-] CWAC-Netsecurity CertPinManager pinner not found');
errDict[err] = ['com.commonsware.cwac.netsecurity.conscrypt.CertPinManager', 'isChainValid'];
}
try {
var androidgap_WLCertificatePinningPlugin_Activity = Java.use('com.worklight.androidgap.plugin.WLCertificatePinningPlugin');
androidgap_WLCertificatePinningPlugin_Activity.execute.overload('java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(a, b, c) {
console.log('[+] Bypassing Worklight Androidgap WLCertificatePinningPlugin: ' + a);
return true;
};
} catch (err) {
console.log('[-] Worklight Androidgap WLCertificatePinningPlugin pinner not found');
errDict[err] = ['com.worklight.androidgap.plugin.WLCertificatePinningPlugin', 'execute'];
}
try {
var netty_FingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
netty_FingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
console.log('[+] Bypassing Netty FingerprintTrustManagerFactory');
};
} catch (err) {
console.log('[-] Netty FingerprintTrustManagerFactory pinner not found');
errDict[err] = ['io.netty.handler.ssl.util.FingerprintTrustManagerFactory', 'checkTrusted'];
}
try {
var Squareup_CertificatePinner_Activity_1 = Java.use('com.squareup.okhttp.CertificatePinner');
Squareup_CertificatePinner_Activity_1.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function(a, b) {
console.log('[+] Bypassing Squareup CertificatePinner {1}: ' + a);
return;
};
} catch (err) {
console.log('[-] Squareup CertificatePinner {1} pinner not found');
errDict[err] = ['com.squareup.okhttp.CertificatePinner', 'check'];
}
try {
var Squareup_CertificatePinner_Activity_2 = Java.use('com.squareup.okhttp.CertificatePinner');
Squareup_CertificatePinner_Activity_2.check.overload('java.lang.String', 'java.util.List').implementation = function(a, b) {
console.log('[+] Bypassing Squareup CertificatePinner {2}: ' + a);
return;
};
} catch (err) {
console.log('[-] Squareup CertificatePinner {2} pinner not found');
errDict[err] = ['com.squareup.okhttp.CertificatePinner', 'check'];
}
try {
var Squareup_OkHostnameVerifier_Activity_1 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
Squareup_OkHostnameVerifier_Activity_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
console.log('[+] Bypassing Squareup OkHostnameVerifier {1}: ' + a);
return true;
};
} catch (err) {
console.log('[-] Squareup OkHostnameVerifier check not found');
errDict[err] = ['com.squareup.okhttp.internal.tls.OkHostnameVerifier', 'verify'];
}
try {
var Squareup_OkHostnameVerifier_Activity_2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
Squareup_OkHostnameVerifier_Activity_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
console.log('[+] Bypassing Squareup OkHostnameVerifier {2}: ' + a);
return true;
};
} catch (err) {
console.log('[-] Squareup OkHostnameVerifier check not found');
errDict[err] = ['com.squareup.okhttp.internal.tls.OkHostnameVerifier', 'verify'];
}
try {
var AndroidWebViewClient_Activity_1 = Java.use('android.webkit.WebViewClient');
AndroidWebViewClient_Activity_1.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
console.log('[+] Bypassing Android WebViewClient check {1}');
};
} catch (err) {
console.log('[-] Android WebViewClient {1} check not found');
errDict[err] = ['android.webkit.WebViewClient', 'onReceivedSslError'];
}
try {
var AndroidWebViewClient_Activity_3 = Java.use('android.webkit.WebViewClient');
AndroidWebViewClient_Activity_3.onReceivedError.implementation = function(view, errCode, description, failingUrl) {
console.log('[+] Bypassing Android WebViewClient check {3}');
};
} catch (err) {
console.log('[-] Android WebViewClient {3} check not found');
errDict[err] = ['android.webkit.WebViewClient', 'onReceivedError'];
}
try {
var AndroidWebViewClient_Activity_4 = Java.use('android.webkit.WebViewClient');
AndroidWebViewClient_Activity_4.onReceivedError.overload('android.webkit.WebView', 'android.webkit.WebResourceRequest', 'android.webkit.WebResourceError').implementation = function(obj1, obj2, obj3) {
console.log('[+] Bypassing Android WebViewClient check {4}');
};
} catch (err) {
console.log('[-] Android WebViewClient {4} check not found');
errDict[err] = ['android.webkit.WebViewClient', 'onReceivedError'];
}
try {
var CordovaWebViewClient_Activity = Java.use('org.apache.cordova.CordovaWebViewClient');
CordovaWebViewClient_Activity.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(obj1, obj2, obj3) {
console.log('[+] Bypassing Apache Cordova WebViewClient check');
obj3.proceed();
};
} catch (err) {
console.log('[-] Apache Cordova WebViewClient check not found');
}
try {
var boye_AbstractVerifier = Java.use('ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier');
boye_AbstractVerifier.verify.implementation = function(host, ssl) {
console.log('[+] Bypassing Boye AbstractVerifier check for: ' + host);
};
} catch (err) {
console.log('[-] Boye AbstractVerifier check not found');
errDict[err] = ['ch.boye.httpclientandroidlib.conn.ssl.AbstractVerifier', 'verify'];
}
try {
var apache_AbstractVerifier_1 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
apache_AbstractVerifier_1.verify.overload('java.lang.String', 'java.security.cert.X509Certificate').implementation = function(a, b) {
console.log('[+] Bypassing Apache AbstractVerifier {1} check for: ' + a);
return;
};
} catch (err) {
console.log('[-] Apache AbstractVerifier {1} check not found');
errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
}
try {
var apache_AbstractVerifier_2 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
apache_AbstractVerifier_2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSocket').implementation = function(a, b) {
console.log('[+] Bypassing Apache AbstractVerifier {2} check for: ' + a);
return;
};
} catch (err) {
console.log('[-] Apache AbstractVerifier {2} check not found');
errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
}
try {
var apache_AbstractVerifier_3 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
apache_AbstractVerifier_3.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(a, b) {
console.log('[+] Bypassing Apache AbstractVerifier {3} check for: ' + a);
return;
};
} catch (err) {
console.log('[-] Apache AbstractVerifier {3} check not found');
errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
}
try {
var apache_AbstractVerifier_4 = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
apache_AbstractVerifier_4.verify.overload('java.lang.String', '[Ljava.lang.String;', '[Ljava.lang.String;', 'boolean').implementation = function(a, b, c, d) {
console.log('[+] Bypassing Apache AbstractVerifier {4} check for: ' + a);
return;
};
} catch (err) {
console.log('[-] Apache AbstractVerifier {4} check not found');
errDict[err] = ['org.apache.http.conn.ssl.AbstractVerifier', 'verify'];
}
try {
var CronetEngineBuilderImpl_Activity = Java.use("org.chromium.net.impl.CronetEngineBuilderImpl");
CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.overload('boolean').implementation = function(a) {
console.log("[+] Disabling Public Key pinning for local trust anchors in Chromium Cronet");
var cronet_obj_1 = CronetEngine_Activity.enablePublicKeyPinningBypassForLocalTrustAnchors.call(this, true);
return cronet_obj_1;
};
CronetEngine_Activity.addPublicKeyPins.overload('java.lang.String', 'java.util.Set', 'boolean', 'java.util.Date').implementation = function(hostName, pinsSha256, includeSubdomains, expirationDate) {
console.log("[+] Bypassing Chromium Cronet pinner: " + hostName);
var cronet_obj_2 = CronetEngine_Activity.addPublicKeyPins.call(this, hostName, pinsSha256, includeSubdomains, expirationDate);
return cronet_obj_2;
};
} catch (err) {
console.log('[-] Chromium Cronet pinner not found')
}
try {
var HttpCertificatePinning_Activity = Java.use('diefferson.http_certificate_pinning.HttpCertificatePinning');
HttpCertificatePinning_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
console.log('[+] Bypassing Flutter HttpCertificatePinning : ' + a);
return true;
};
} catch (err) {
console.log('[-] Flutter HttpCertificatePinning pinner not found');
errDict[err] = ['diefferson.http_certificate_pinning.HttpCertificatePinning', 'checkConnexion'];
}
try {
var SslPinningPlugin_Activity = Java.use('com.macif.plugin.sslpinningplugin.SslPinningPlugin');
SslPinningPlugin_Activity.checkConnexion.overload("java.lang.String", "java.util.List", "java.util.Map", "int", "java.lang.String").implementation = function(a, b, c, d, e) {
console.log('[+] Bypassing Flutter SslPinningPlugin: ' + a);
return true;
};
} catch (err) {
console.log('[-] Flutter SslPinningPlugin pinner not found');
errDict[err] = ['com.macif.plugin.sslpinningplugin.SslPinningPlugin', 'checkConnexion'];
}
try {
for (var key in errDict) {
var errStr = key;
var targetClass = errDict[key][0]
var targetFunc = errDict[key][1]
var retType = Java.use(targetClass)[targetFunc].returnType.type;
if (String(errStr).includes('.overload')) {
overloader(errStr, targetClass, targetFunc, retType);
}
}
} catch (err) {
}
try {
var UnverifiedCertError = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
UnverifiedCertError.$init.implementation = function(reason) {
try {
var stackTrace = Java.use('java.lang.Thread').currentThread().getStackTrace();
var exceptionStackIndex = stackTrace.findIndex(stack =>
stack.getClassName() === "javax.net.ssl.SSLPeerUnverifiedException"
);
var callingFunctionStack = stackTrace[exceptionStackIndex + 1];
var className = callingFunctionStack.getClassName();
var methodName = callingFunctionStack.getMethodName();
var callingClass = Java.use(className);
var callingMethod = callingClass[methodName];
console.log('\x1b[36m[!] Unexpected SSLPeerUnverifiedException occurred related to the method "' + className + '.' + methodName + '"\x1b[0m');
if (className == 'com.android.org.conscrypt.ActiveSession' || className == 'com.google.android.gms.org.conscrypt.ActiveSession') {
throw 'Reason: skipped SSLPeerUnverifiedException bypass since the exception was raised from a (usually) non blocking method on the Android app';
} else {
console.log('\x1b[34m[!] Starting to dynamically circumvent the SSLPeerUnverifiedException for the method "' + className + '.' + methodName + '"...\x1b[0m');
var retTypeName = callingMethod.returnType.type;
if (!(callingMethod.implementation)) {
callingMethod.implementation = function() {
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + className + '.' + methodName + '" via Frida function implementation\x1b[0m');
returner(retTypeName);
}
}
}
} catch (err2) {
if (String(err2).includes('.overload')) {
overloader(err2, className, methodName, retTypeName);
} else {
if (String(err2).includes('SSLPeerUnverifiedException')) {
console.log('\x1b[36m[-] Failed to dynamically circumvent SSLPeerUnverifiedException -> ' + err2 + '\x1b[0m');
} else {
}
}
}
return this.$init(reason);
};
} catch (err1) {
}
});
}, 0);
function returner(typeName) {
if (typeName === undefined || typeName === 'void') {
return;
} else if (typeName === 'boolean') {
return true;
} else {
return null;
}
}
function overloader(errStr, targetClass, targetFunc, retType) {
var tClass = Java.use(targetClass);
var tFunc = tClass[targetFunc];
var params = [];
var argList = [];
var overloads = tFunc.overloads;
var returnTypeName = retType;
var splittedList = String(errStr).split('.overload');
for (var n = 1; n < splittedList.length; n++) {
var extractedOverload = splittedList[n].trim().split('(')[1].slice(0, -1).replaceAll("'", "");
if (extractedOverload.includes('<signature>')) {
continue;
}
console.log('\x1b[34m[!] Found the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"\x1b[0m');
if (!extractedOverload) {
tFunc.overload().implementation = function() {
var printStr = printer();
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else {
if (extractedOverload.includes(',')) {
argList = extractedOverload.split(', ');
}
if (argList.length == 0) {
tFunc.overload(extractedOverload).implementation = function(a) {
var printStr = printer();
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 2) {
tFunc.overload(argList[0], argList[1]).implementation = function(a, b) {
var printStr = printer(a);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 3) {
tFunc.overload(argList[0], argList[1], argList[2]).implementation = function(a, b, c) {
var printStr = printer(a, b);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 4) {
tFunc.overload(argList[0], argList[1], argList[2], argList[3]).implementation = function(a, b, c, d) {
var printStr = printer(a, b, c);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 5) {
tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4]).implementation = function(a, b, c, d, e) {
var printStr = printer(a, b, c, d);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 6) {
tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5]).implementation = function(a, b, c, d, e, f) {
var printStr = printer(a, b, c, d, e);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 7) {
tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5], argList[6]).implementation = function(a, b, c, d, e, f, g) {
var printStr = printer(a, b, c, d, e, f);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
} else if (argList.length == 8) {
tFunc.overload(argList[0], argList[1], argList[2], argList[3], argList[4], argList[5], argList[6], argList[7]).implementation = function(a, b, c, d, e, f, g, h) {
var printStr = printer(a, b, c, d, e, f, g);
console.log('\x1b[34m[+] Bypassing the unusual/obfuscated pinner "' + targetClass + '.' + targetFunc + '(' + extractedOverload + ')"' + printStr + '\x1b[0m');
returner(returnTypeName);
}
}
}
}
}
function printer(a, b, c, d, e, f, g, h) {
var printList = [];
var printStr = '';
if (typeof a === 'string') {
printList.push(a);
}
if (typeof b === 'string') {
printList.push(b);
}
if (typeof c === 'string') {
printList.push(c);
}
if (typeof d === 'string') {
printList.push(d);
}
if (typeof e === 'string') {
printList.push(e);
}
if (typeof f === 'string') {
printList.push(f);
}
if (typeof g === 'string') {
printList.push(g);
}
if (typeof h === 'string') {
printList.push(h);
}
if (printList.length !== 0) {
printStr = ' check for:';
for (var i = 0; i < printList.length; i++) {
printStr += ' ' + printList[i];
}
}
return printStr;
}
