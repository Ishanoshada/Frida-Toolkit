var errDict = {};
function addUniversalSSLPinningBypass() {
Java.perform(function() {
try {
var WebViewClient = Java.use('android.webkit.WebViewClient');
WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
console.log('[+] WebViewClient.onReceivedSslError() bypassed');
handler.proceed();
};
} catch (e) {}
try {
var OkHostnameVerifier = Java.use('okhttp3.internal.tls.OkHostnameVerifier');
OkHostnameVerifier.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(host, session) {
console.log('[+] OkHttp3 OkHostnameVerifier.verify() bypassed for host: ' + host);
return true;
};
} catch (e) {}
try {
var OkHostnameVerifier2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
OkHostnameVerifier2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(host, session) {
console.log('[+] OkHttp2 OkHostnameVerifier.verify() bypassed for host: ' + host);
return true;
};
} catch (e) {}
try {
var conscrypt_TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
conscrypt_TrustManagerImpl.checkTrustedRecursive.implementation = function() {
console.log('[+] Conscrypt TrustManagerImpl.checkTrustedRecursive() bypassed');
return [];
};
} catch (e) {}
try {
var bouncy_TrustManager = Java.use('org.bouncycastle.jsse.provider.BouncyCastleJsseProvider');
bouncy_TrustManager.checkServerTrusted.implementation = function() {
console.log('[+] BouncyCastle checkServerTrusted() bypassed');
};
} catch (e) {}
Java.enumerateLoadedClasses({
onMatch: function(className) {
var lc = className.toLowerCase();
if (
lc.indexOf('pin') !== -1 ||
lc.indexOf('trust') !== -1 ||
lc.indexOf('cert') !== -1 ||
lc.indexOf('ssl') !== -1 ||
lc.indexOf('verify') !== -1 ||
lc.indexOf('chain') !== -1
) {
try {
var klass = Java.use(className);
['checkServerTrusted', 'checkClientTrusted', 'verify', 'verifyCertificateChain', 'onReceivedError'].forEach(function(method) {
if (klass[method]) {
klass[method].implementation = function() {
console.log('[+] Universal dynamic SSL bypass: ' + className + '.' + method + '()');
if (method === 'verify') return true;
if (method === 'onReceivedError') return;
return;
};
}
});
} catch (e) {}
}
},
onComplete: function() {}
});
try {
var SSLPeerUnverifiedException = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
SSLPeerUnverifiedException.$init.implementation = function(reason) {
console.log('[+] Universal SSLPeerUnverifiedException bypassed: ' + reason);
return this.$init('');
};
} catch (e) {}
try {
var AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
AbstractVerifier.verify.implementation = function(host, ssl) {
console.log('[+] Apache HttpClient AbstractVerifier.verify() bypassed for: ' + host);
};
} catch (e) {}
try {
var NettyFingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
NettyFingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
console.log('[+] Netty FingerprintTrustManagerFactory.checkTrusted() bypassed');
};
} catch (e) {}
try {
var SSLParametersImpl = Java.use('com.android.org.conscrypt.SSLParametersImpl');
SSLParametersImpl.setEndpointIdentificationAlgorithm.implementation = function(alg) {
console.log('[+] SSLParametersImpl.setEndpointIdentificationAlgorithm() bypassed');
};
} catch (e) {}
try {
var SSLSocketFactory = Java.use('javax.net.ssl.SSLSocketFactory');
SSLSocketFactory.createSocket.overload('java.net.Socket', 'java.lang.String', 'int', 'boolean').implementation = function() {
console.log('[+] SSLSocketFactory.createSocket() bypassed');
return this.createSocket.apply(this, arguments);
};
} catch (e) {}
try {
var TrustManagerFactory = Java.use('javax.net.ssl.TrustManagerFactory');
TrustManagerFactory.init.overload('java.security.KeyStore').implementation = function(ks) {
console.log('[+] TrustManagerFactory.init() bypassed');
return this.init(ks);
};
} catch (e) {}
try {
var KeyManagerFactory = Java.use('javax.net.ssl.KeyManagerFactory');
KeyManagerFactory.init.overload('java.security.KeyStore', '[C').implementation = function(ks, pwd) {
console.log('[+] KeyManagerFactory.init() bypassed');
return this.init(ks, pwd);
};
} catch (e) {}
try {
var CordovaWebViewClient = Java.use('org.apache.cordova.CordovaWebViewClient');
CordovaWebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
console.log('[+] CordovaWebViewClient.onReceivedSslError() bypassed');
handler.proceed();
};
} catch (e) {}
try {
var UnityWebRequest = Java.use('com.unity3d.player.UnityWebRequest');
UnityWebRequest.setCertificateHandler.implementation = function(handler) {
console.log('[+] UnityWebRequest.setCertificateHandler() bypassed');
};
} catch (e) {}
try {
var sslctx_custom_verify = Module.findExportByName('libssl.so', 'SSL_CTX_set_custom_verify');
if (sslctx_custom_verify) {
Interceptor.attach(sslctx_custom_verify, {
onEnter: function(args) {
console.log('[+] Native SSL_CTX_set_custom_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
var sslctx_set_verify = Module.findExportByName('libssl.so', 'SSL_CTX_set_verify');
if (sslctx_set_verify) {
Interceptor.attach(sslctx_set_verify, {
onEnter: function(args) {
console.log('[+] Native SSL_CTX_set_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
var mbedtls_ssl_conf_authmode = Module.findExportByName(null, 'mbedtls_ssl_conf_authmode');
if (mbedtls_ssl_conf_authmode) {
Interceptor.attach(mbedtls_ssl_conf_authmode, {
onEnter: function(args) {
console.log('[+] mbedtls_ssl_conf_authmode called, bypassing');
args[1] = 0;                     }
});
}
} catch (e) {}
try {
var boringssl_set_custom_verify = Module.findExportByName(null, 'SSL_set_custom_verify');
if (boringssl_set_custom_verify) {
Interceptor.attach(boringssl_set_custom_verify, {
onEnter: function(args) {
console.log('[+] boringssl SSL_set_custom_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
Interceptor.attach(Module.findExportByName(null, 'SSL_get_verify_result'), {
onLeave: function(retval) {
console.log('[+] Native SSL_get_verify_result bypassed');
retval.replace(0);                 }
});
} catch (e) {}
});
}
function addUniversalRootBypass() {
Java.perform(function() {
var rootPackages = [
"com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
"com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
"com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
"de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
"com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
"eu.chainfire.supersu.pro", "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN", "com.topjohnwu.magisk"
];
var rootBinaries = ["su", "which", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];
try {
var PackageManager = Java.use("android.app.ApplicationPackageManager");
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
if (rootPackages.indexOf(pname) > -1) {
console.log("[+] Universal root bypass: getPackageInfo for " + pname);
pname = "safe.package.fake";
}
return this.getPackageInfo.call(this, pname, flags);
};
} catch (e) {}
try {
var NativeFile = Java.use('java.io.File');
NativeFile.exists.implementation = function() {
var name = NativeFile.getName.call(this);
if (rootBinaries.indexOf(name) > -1) {
console.log("[+] Universal root bypass: File.exists for " + name);
return false;
} else {
return this.exists.call(this);
}
};
} catch (e) {}
try {
var Runtime = Java.use('java.lang.Runtime');
Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
if (cmd == "su") {
console.log("[+] Universal root bypass: Runtime.exec for su");
return null;
} else {
return this.exec.call(this, cmd);
}
};
} catch (e) {}
try {
var SystemProperties = Java.use('android.os.SystemProperties');
SystemProperties.get.overload('java.lang.String').implementation = function(name) {
if (name === 'ro.build.selinux' || name === 'ro.debuggable' || name === 'service.adb.root' || name === 'ro.secure') {
console.log("[+] Universal root bypass: SystemProperties.get for " + name);
return '0';
} else {
return this.get.call(this, name);
}
};
} catch (e) {}
try {
var BufferedReader = Java.use('java.io.BufferedReader');
BufferedReader.readLine.overload().implementation = function() {
var line = this.readLine.call(this);
if (line && line.indexOf("ro.build.tags=test-keys") > -1) {
console.log("[+] Universal root bypass: build.prop test-keys");
line = line.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
}
return line;
};
} catch (e) {}
try {
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);
if (cmd && cmd.indexOf("su") > -1) {
console.log("[+] Universal root bypass: ProcessBuilder for su");
cmd = ["fakecmd"];
this.command.call(this, cmd);
}
return this.start.call(this);
};
} catch (e) {}
Java.enumerateLoadedClasses({
onMatch: function(className) {
var lc = className.toLowerCase();
if (
lc.indexOf('root') !== -1 ||
lc.indexOf('su') !== -1 ||
lc.indexOf('magisk') !== -1 ||
lc.indexOf('xposed') !== -1 ||
lc.indexOf('substrate') !== -1
) {
try {
var klass = Java.use(className);
['isRooted', 'checkRoot', 'detectRoot', 'isDeviceRooted', 'isJailbroken', 'isRootAvailable', 'isRoot'].forEach(function(method) {
if (klass[method]) {
klass[method].implementation = function() {
console.log('[+] Universal dynamic root bypass: ' + className + '.' + method + '()');
return false;
};
}
});
} catch (e) {}
}
},
onComplete: function() {}
});
});
}
Java.perform(function() {
var RootPackages = [
"com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
"com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su", "com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
"com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro", "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
"de.robv.android.xposed.installer", "com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
"com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot", "me.phh.superuser",
"eu.chainfire.supersu.pro", "com.kingouser.com", "com.android.vending.billing.InAppBillingService.COIN", "com.topjohnwu.magisk"
];
var RootBinaries = ["su", "which", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];
var RootProperties = {
"ro.build.selinux": "1",
"ro.debuggable": "0",
"service.adb.root": "0",
"ro.secure": "1"
};
var PackageManager = Java.use("android.app.ApplicationPackageManager");
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
if (RootPackages.indexOf(pname) > -1) {
console.log("Bypass root check for package: " + pname);
pname = "safe.package.fake";
}
return this.getPackageInfo.call(this, pname, flags);
};
var NativeFile = Java.use('java.io.File');
NativeFile.exists.implementation = function() {
var name = NativeFile.getName.call(this);
if (RootBinaries.indexOf(name) > -1) {
console.log("Bypass NativeFile.exists for binary: " + name);
return false;
} else {
return this.exists.call(this);
}
};
var Runtime = Java.use('java.lang.Runtime');
Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
if (cmd == "su") {
console.log("Bypass Runtime.exec for command: " + cmd);
return null;
} else {
return this.exec.call(this, cmd);
}
};
var SystemProperties = Java.use('android.os.SystemProperties');
SystemProperties.get.overload('java.lang.String').implementation = function(name) {
if (RootProperties[name]) {
console.log("Bypass SystemProperties.get for: " + name);
return RootProperties[name];
} else {
return this.get.call(this, name);
}
};
var BufferedReader = Java.use('java.io.BufferedReader');
BufferedReader.readLine.overload().implementation = function() {
var line = this.readLine.call(this);
if (line && line.indexOf("ro.build.tags=test-keys") > -1) {
console.log("Bypass build.prop test-keys");
line = line.replace("ro.build.tags=test-keys", "ro.build.tags=release-keys");
}
return line;
};
Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
onEnter: function(args) {
var path = Memory.readCString(args[0]);
if (path.indexOf("build.prop") > -1) {
console.log("Bypass fopen for build.prop");
Memory.writeUtf8String(args[0], "/fake/path/build.prop");
}
}
});
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);
if (cmd && cmd.indexOf("su") > -1) {
console.log("Bypass ProcessBuilder for su");
cmd = ["fakecmd"];
this.command.call(this, cmd);
}
return this.start.call(this);
};
if (Java.androidVersion.startsWith('5') || Java.androidVersion.startsWith('6') || Java.androidVersion.startsWith('7') || Java.androidVersion.startsWith('8') || Java.androidVersion.startsWith('9') || Java.androidVersion.startsWith('10')) {
var KeyInfo = Java.use('android.security.keystore.KeyInfo');
KeyInfo.isInsideSecureHardware.implementation = function() {
console.log("Bypass KeyInfo.isInsideSecureHardware");
return false;
};
}
var openPtr = Module.findExportByName("libc.so", "open");
var accessPtr = Module.findExportByName("libc.so", "access");
var open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
var access = new NativeFunction(accessPtr, 'int', ['pointer', 'int']);
Interceptor.replace(openPtr, new NativeCallback(function(path, flags) {
if (Memory.readUtf8String(path).endsWith("/su")) {
return -1;
}
return open(path, flags);
}, 'int', ['pointer', 'int']));
Interceptor.replace(accessPtr, new NativeCallback(function(path, mode) {
if (Memory.readUtf8String(path).endsWith("/su")) {
return -1;
}
return access(path, mode);
}, 'int', ['pointer', 'int']));
console.log('\n======\n[#] Android SSL Pinning Bypass [#]\n======');
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
'[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
);
SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
console.log('[+] Bypassing TrustManager (Android < 7)');
SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
};
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
Java.perform(function() {
try {
var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
var HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
var HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
X509TrustManager.checkServerTrusted.implementation = function(chain, authType) {
console.log('[+] Universal X509TrustManager.checkServerTrusted() bypassed');
};
HostnameVerifier.verify.implementation = function(hostname, session) {
console.log('[+] HostnameVerifier.verify() bypassed for host: ' + hostname);
return true;
};
HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(verifier) {
console.log('[+] HttpsURLConnection.setDefaultHostnameVerifier() bypassed');
return;
};
try {
var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
console.log('[+] TrustManagerImpl.verifyChain() bypassed for host: ' + host);
return untrustedChain;
};
} catch (e) {}
} catch (e) {
console.log('[-] Universal SSL pinning bypass error: ' + e);
}
});
try {
var sslctx_custom_verify = Module.findExportByName('libssl.so', 'SSL_CTX_set_custom_verify');
if (sslctx_custom_verify) {
Interceptor.attach(sslctx_custom_verify, {
onEnter: function(args) {
console.log('[+] Native SSL_CTX_set_custom_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
var sslctx_set_verify = Module.findExportByName('libssl.so', 'SSL_CTX_set_verify');
if (sslctx_set_verify) {
Interceptor.attach(sslctx_set_verify, {
onEnter: function(args) {
console.log('[+] Native SSL_CTX_set_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
Java.perform(function() {
try {
var WebViewClient = Java.use('android.webkit.WebViewClient');
WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
console.log('[+] WebViewClient.onReceivedSslError() bypassed');
handler.proceed();
};
} catch (e) {}
});
Java.perform(function() {
try {
var OkHostnameVerifier = Java.use('okhttp3.internal.tls.OkHostnameVerifier');
OkHostnameVerifier.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(host, session) {
console.log('[+] OkHttp3 OkHostnameVerifier.verify() bypassed for host: ' + host);
return true;
};
} catch (e) {}
try {
var OkHostnameVerifier2 = Java.use('com.squareup.okhttp.internal.tls.OkHostnameVerifier');
OkHostnameVerifier2.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(host, session) {
console.log('[+] OkHttp2 OkHostnameVerifier.verify() bypassed for host: ' + host);
return true;
};
} catch (e) {}
});
Java.perform(function() {
try {
var conscrypt_TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
conscrypt_TrustManagerImpl.checkTrustedRecursive.implementation = function() {
console.log('[+] Conscrypt TrustManagerImpl.checkTrustedRecursive() bypassed');
return [];
};
} catch (e) {}
try {
var bouncy_TrustManager = Java.use('org.bouncycastle.jsse.provider.BouncyCastleJsseProvider');
bouncy_TrustManager.checkServerTrusted.implementation = function() {
console.log('[+] BouncyCastle checkServerTrusted() bypassed');
};
} catch (e) {}
});
Java.perform(function() {
Java.enumerateLoadedClasses({
onMatch: function(className) {
if (className.toLowerCase().indexOf('pin') !== -1 || className.toLowerCase().indexOf('trust') !== -1) {
try {
var klass = Java.use(className);
if (klass.checkServerTrusted) {
klass.checkServerTrusted.implementation = function() {
console.log('[+] Dynamic bypass: ' + className + '.checkServerTrusted()');
};
}
if (klass.verify) {
klass.verify.implementation = function() {
console.log('[+] Dynamic bypass: ' + className + '.verify()');
return true;
};
}
} catch (e) {}
}
},
onComplete: function() {}
});
});
Java.perform(function() {
try {
var SSLPeerUnverifiedException = Java.use('javax.net.ssl.SSLPeerUnverifiedException');
SSLPeerUnverifiedException.$init.implementation = function(reason) {
console.log('[+] Universal SSLPeerUnverifiedException bypassed: ' + reason);
return this.$init('');
};
} catch (e) {}
});
Java.perform(function() {
try {
var CordovaWebViewClient = Java.use('org.apache.cordova.CordovaWebViewClient');
CordovaWebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
console.log('[+] CordovaWebViewClient.onReceivedSslError() bypassed');
handler.proceed();
};
} catch (e) {}
try {
var UnityWebRequest = Java.use('com.unity3d.player.UnityWebRequest');
UnityWebRequest.setCertificateHandler.implementation = function(handler) {
console.log('[+] UnityWebRequest.setCertificateHandler() bypassed');
};
} catch (e) {}
});
try {
var mbedtls_ssl_conf_authmode = Module.findExportByName(null, 'mbedtls_ssl_conf_authmode');
if (mbedtls_ssl_conf_authmode) {
Interceptor.attach(mbedtls_ssl_conf_authmode, {
onEnter: function(args) {
console.log('[+] mbedtls_ssl_conf_authmode called, bypassing');
args[1] = 0;             }
});
}
} catch (e) {}
try {
var boringssl_set_custom_verify = Module.findExportByName(null, 'SSL_set_custom_verify');
if (boringssl_set_custom_verify) {
Interceptor.attach(boringssl_set_custom_verify, {
onEnter: function(args) {
console.log('[+] boringssl SSL_set_custom_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
Java.perform(function() {
Java.enumerateLoadedClasses({
onMatch: function(className) {
var lc = className.toLowerCase();
if (
lc.indexOf('pin') !== -1 ||
lc.indexOf('trust') !== -1 ||
lc.indexOf('cert') !== -1 ||
lc.indexOf('ssl') !== -1 ||
lc.indexOf('verify') !== -1 ||
lc.indexOf('chain') !== -1
) {
try {
var klass = Java.use(className);
['checkServerTrusted', 'checkClientTrusted', 'verify', 'verifyCertificateChain', 'onReceivedError'].forEach(function(method) {
if (klass[method]) {
klass[method].implementation = function() {
console.log('[+] Ultimate dynamic bypass: ' + className + '.' + method + '()');
if (method === 'verify') return true;
if (method === 'onReceivedError') return;
return;
};
}
});
} catch (e) {}
}
},
onComplete: function() {}
});
});
Java.perform(function() {
try {
var AbstractVerifier = Java.use('org.apache.http.conn.ssl.AbstractVerifier');
AbstractVerifier.verify.implementation = function(host, ssl) {
console.log('[+] Apache HttpClient AbstractVerifier.verify() bypassed for: ' + host);
};
} catch (e) {}
try {
var NettyFingerprintTrustManagerFactory = Java.use('io.netty.handler.ssl.util.FingerprintTrustManagerFactory');
NettyFingerprintTrustManagerFactory.checkTrusted.implementation = function(type, chain) {
console.log('[+] Netty FingerprintTrustManagerFactory.checkTrusted() bypassed');
};
} catch (e) {}
try {
var SSLParametersImpl = Java.use('com.android.org.conscrypt.SSLParametersImpl');
SSLParametersImpl.setEndpointIdentificationAlgorithm.implementation = function(alg) {
console.log('[+] SSLParametersImpl.setEndpointIdentificationAlgorithm() bypassed');
};
} catch (e) {}
try {
var SSLSocketFactory = Java.use('javax.net.ssl.SSLSocketFactory');
SSLSocketFactory.createSocket.overload('java.net.Socket', 'java.lang.String', 'int', 'boolean').implementation = function() {
console.log('[+] SSLSocketFactory.createSocket() bypassed');
return this.createSocket.apply(this, arguments);
};
} catch (e) {}
try {
var TrustManagerFactory = Java.use('javax.net.ssl.TrustManagerFactory');
TrustManagerFactory.init.overload('java.security.KeyStore').implementation = function(ks) {
console.log('[+] TrustManagerFactory.init() bypassed');
return this.init(ks);
};
} catch (e) {}
try {
var KeyManagerFactory = Java.use('javax.net.ssl.KeyManagerFactory');
KeyManagerFactory.init.overload('java.security.KeyStore', '[C').implementation = function(ks, pwd) {
console.log('[+] KeyManagerFactory.init() bypassed');
return this.init(ks, pwd);
};
} catch (e) {}
});
try {
Interceptor.attach(Module.findExportByName(null, 'SSL_get_verify_result'), {
onLeave: function(retval) {
console.log('[+] Native SSL_get_verify_result bypassed');
retval.replace(0);         }
});
} catch (e) {}
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
Java.perform(function() {
try {
var SafetyNetClient = Java.use('com.google.android.gms.safetynet.SafetyNetClient');
SafetyNetClient.attest.overload('[B', 'java.lang.String').implementation = function(jws, nonce) {
console.log('[+] SafetyNet attest() bypassed');
return Java.use('com.google.android.gms.tasks.Tasks').forResult(Java.use('com.google.android.gms.safetynet.SafetyNetApi$AttestationResponse').$new());
};
} catch (e) {}
try {
var SafetyNetResponse = Java.use('com.google.android.gms.safetynet.SafetyNetApi$AttestationResponse');
SafetyNetResponse.getJwsResult.implementation = function() {
console.log('[+] SafetyNet getJwsResult() bypassed');
return 'FAKE_JWS_RESULT';
};
} catch (e) {}
try {
var File = Java.use('java.io.File');
File.exists.implementation = function() {
var path = this.getAbsolutePath();
var magiskFiles = [
'/sbin/magisk', '/init.magisk.rc', '/system/bin/su', '/system/xbin/daemonsu', '/system/bin/busybox',
'/system/bin/which', '/system/app/Superuser.apk', '/system/app/MagiskManager.apk', '/data/adb/magisk.img', '/data/adb/modules/'
];
for (var i = 0; i < magiskFiles.length; i++) {
if (path.indexOf(magiskFiles[i]) !== -1) {
console.log('[+] Magisk/Zygisk file bypass: ' + path);
return false;
}
}
return this.exists.call(this);
};
} catch (e) {}
try {
var SystemProperties = Java.use('android.os.SystemProperties');
SystemProperties.get.overload('java.lang.String').implementation = function(name) {
var rootProps = {
'ro.build.fingerprint': 'generic',
'ro.boot.verifiedbootstate': 'green',
'ro.boot.vbmeta.device_state': 'locked',
'ro.boot.flash.locked': '1',
'ro.boot.veritymode': 'enforcing',
'ro.boot.warranty_bit': '0',
'ro.debuggable': '0',
'ro.secure': '1'
};
if (rootProps[name]) {
console.log('[+] SystemProperties.get bypassed for: ' + name);
return rootProps[name];
}
return this.get.call(this, name);
};
} catch (e) {}
try {
var Runtime = Java.use('java.lang.Runtime');
Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
if (cmd.indexOf('ps') !== -1 || cmd.indexOf('pidof') !== -1 || cmd.indexOf('pgrep') !== -1) {
console.log('[+] Process check bypassed: ' + cmd);
return null;
}
return this.exec.call(this, cmd);
};
} catch (e) {}
try {
var PackageManager = Java.use('android.app.ApplicationPackageManager');
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
var moreRootPkgs = [
'com.topjohnwu.magisk', 'com.devadvance.rootcloak', 'com.zachspong.temprootremovejb', 'com.amphoras.hidemyroot',
'com.amphoras.hidemyrootadfree', 'com.formyhm.hiderootPremium', 'com.formyhm.hideroot', 'me.phh.superuser',
'eu.chainfire.supersu.pro', 'com.kingouser.com', 'com.android.vending.billing.InAppBillingService.COIN', 'com.topjohnwu.magisk'
];
if (moreRootPkgs.indexOf(pname) > -1) {
console.log('[+] More root package bypass: ' + pname);
pname = 'safe.package.fake';
}
return this.getPackageInfo.call(this, pname, flags);
};
} catch (e) {}
});
Java.perform(function() {
try {
var OkHttpClientProvider = Java.use('com.reactnativecommunity.networking.OkHttpClientProvider');
OkHttpClientProvider.createClient.implementation = function() {
console.log('[+] React Native OkHttpClientProvider.createClient() bypassed');
return this.createClient.call(this);
};
} catch (e) {}
try {
var FlutterSslPinning = Java.use('com.example.flutter_ssl_pinning.FlutterSslPinningPlugin');
FlutterSslPinning.check.implementation = function() {
console.log('[+] FlutterSslPinningPlugin.check() bypassed');
return true;
};
} catch (e) {}
Java.enumerateLoadedClasses({
onMatch: function(className) {
var lc = className.toLowerCase();
if (lc.indexOf('retrofit') !== -1 || lc.indexOf('volley') !== -1 || lc.indexOf('okhttp') !== -1) {
try {
var klass = Java.use(className);
if (klass.checkServerTrusted) {
klass.checkServerTrusted.implementation = function() {
console.log('[+] Dynamic HTTP client bypass: ' + className + '.checkServerTrusted()');
};
}
if (klass.verify) {
klass.verify.implementation = function() {
console.log('[+] Dynamic HTTP client bypass: ' + className + '.verify()');
return true;
};
}
} catch (e) {}
}
},
onComplete: function() {}
});
try {
var ssl_set_verify = Module.findExportByName('libssl.so', 'SSL_set_verify');
if (ssl_set_verify) {
Interceptor.attach(ssl_set_verify, {
onEnter: function(args) {
console.log('[+] Native SSL_set_verify called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
var ssl_ctx_set_cert_verify_callback = Module.findExportByName('libssl.so', 'SSL_CTX_set_cert_verify_callback');
if (ssl_ctx_set_cert_verify_callback) {
Interceptor.attach(ssl_ctx_set_cert_verify_callback, {
onEnter: function(args) {
console.log('[+] Native SSL_CTX_set_cert_verify_callback called, bypassing');
args[1] = ptr(0);
}
});
}
} catch (e) {}
try {
var ssl_get_peer_certificate = Module.findExportByName('libssl.so', 'SSL_get_peer_certificate');
if (ssl_get_peer_certificate) {
Interceptor.attach(ssl_get_peer_certificate, {
onLeave: function(retval) {
console.log('[+] Native SSL_get_peer_certificate bypassed');
retval.replace(ptr(0));
}
});
}
} catch (e) {}
});
var hookLog = [];
function logHook(status, type, className, methodName, details) {
var msg = `[${status}] [${type}] ${className}.${methodName}${details ? ' ' + details : ''}`;
hookLog.push(msg);
console.log(msg);
}
function printSummary() {
console.log('\n=== Frida Universal Root & SSL Pinning Bypass Summary ===');
hookLog.forEach(function(msg) {
console.log(msg);
});
console.log('========================================================\n');
}
setImmediate(function() {
printSummary();
});
Java.perform(function() {
try {
var Build = Java.use('android.os.Build');
Build.TAGS.value = 'release-keys';
Build.FINGERPRINT.value = 'generic';
Build.BOARD.value = 'unknown';
Build.BRAND.value = 'generic';
Build.DEVICE.value = 'generic';
Build.PRODUCT.value = 'generic';
Build.MODEL.value = 'Android';
Build.MANUFACTURER.value = 'unknown';
logHook('OK', 'ROOT', 'android.os.Build', 'static fields', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'android.os.Build', 'static fields', e);
}
try {
var SettingsSecure = Java.use('android.provider.Settings$Secure');
SettingsSecure.getString.implementation = function(cr, name) {
if (name === 'adb_enabled' || name === 'development_settings_enabled') {
logHook('TRIGGER', 'ROOT', 'Settings$Secure', 'getString', name);
return '0';
}
return this.getString.call(this, cr, name);
};
logHook('OK', 'ROOT', 'Settings$Secure', 'getString', 'adb/dev settings');
} catch (e) {
logHook('FAIL', 'ROOT', 'Settings$Secure', 'getString', e);
}
try {
var Debug = Java.use('android.os.Debug');
Debug.isDebuggerConnected.implementation = function() {
logHook('TRIGGER', 'ROOT', 'Debug', 'isDebuggerConnected', '');
return false;
};
Debug.waitingForDebugger.implementation = function() {
logHook('TRIGGER', 'ROOT', 'Debug', 'waitingForDebugger', '');
return false;
};
logHook('OK', 'ROOT', 'Debug', 'isDebuggerConnected/waitingForDebugger', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'Debug', 'isDebuggerConnected/waitingForDebugger', e);
}
try {
var Class = Java.use('java.lang.Class');
Class.forName.overload('java.lang.String').implementation = function(name) {
logHook('TRIGGER', 'ROOT', 'Class', 'forName', name);
return this.forName.call(this, name);
};
logHook('OK', 'ROOT', 'Class', 'forName', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'Class', 'forName', e);
}
try {
var SystemClass = Java.use('java.lang.System');
SystemClass.loadLibrary.implementation = function(lib) {
logHook('TRIGGER', 'ROOT', 'System', 'loadLibrary', lib);
return this.loadLibrary.call(this, lib);
};
logHook('OK', 'ROOT', 'System', 'loadLibrary', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'System', 'loadLibrary', e);
}
try {
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);
if (cmd && cmd.toString().indexOf('su') > -1) {
logHook('TRIGGER', 'ROOT', 'ProcessBuilder', 'start', cmd);
cmd = ['fakecmd'];
this.command.call(this, cmd);
}
return this.start.call(this);
};
logHook('OK', 'ROOT', 'ProcessBuilder', 'start', 'all overloads');
} catch (e) {
logHook('FAIL', 'ROOT', 'ProcessBuilder', 'start', e);
}
try {
var Runtime = Java.use('java.lang.Runtime');
var overloads = Runtime.exec.overloads;
for (var i = 0; i < overloads.length; i++) {
overloads[i].implementation = function() {
var cmd = arguments[0];
if (typeof cmd === 'string' && cmd.indexOf('su') !== -1) {
logHook('TRIGGER', 'ROOT', 'Runtime', 'exec', cmd);
return null;
}
return this.exec.apply(this, arguments);
};
}
logHook('OK', 'ROOT', 'Runtime', 'exec', 'all overloads');
} catch (e) {
logHook('FAIL', 'ROOT', 'Runtime', 'exec', e);
}
try {
var Method = Java.use('java.lang.reflect.Method');
Method.invoke.implementation = function(obj, args) {
logHook('TRIGGER', 'ROOT', 'Method', 'invoke', this.getName());
return this.invoke.call(this, obj, args);
};
logHook('OK', 'ROOT', 'Method', 'invoke', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'Method', 'invoke', e);
}
try {
var ActivityManager = Java.use('android.app.ActivityManager');
ActivityManager.getRunningServices.implementation = function(max) {
logHook('TRIGGER', 'ROOT', 'ActivityManager', 'getRunningServices', '');
return Java.use('java.util.ArrayList').$new();
};
ActivityManager.getRunningAppProcesses.implementation = function() {
logHook('TRIGGER', 'ROOT', 'ActivityManager', 'getRunningAppProcesses', '');
return Java.use('java.util.ArrayList').$new();
};
logHook('OK', 'ROOT', 'ActivityManager', 'getRunningServices/getRunningAppProcesses', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'ActivityManager', 'getRunningServices/getRunningAppProcesses', e);
}
try {
var Build = Java.use('android.os.Build');
Build.SERIAL.value = 'unknown';
if (Build.getSerial) {
Build.getSerial.implementation = function() {
logHook('TRIGGER', 'ROOT', 'Build', 'getSerial', '');
return 'unknown';
};
}
logHook('OK', 'ROOT', 'Build', 'SERIAL/getSerial', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'Build', 'SERIAL/getSerial', e);
}
try {
var SystemClock = Java.use('android.os.SystemClock');
SystemClock.elapsedRealtime.implementation = function() {
logHook('TRIGGER', 'ROOT', 'SystemClock', 'elapsedRealtime', '');
return 10000;
};
SystemClock.uptimeMillis.implementation = function() {
logHook('TRIGGER', 'ROOT', 'SystemClock', 'uptimeMillis', '');
return 10000;
};
logHook('OK', 'ROOT', 'SystemClock', 'elapsedRealtime/uptimeMillis', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'SystemClock', 'elapsedRealtime/uptimeMillis', e);
}
try {
var VMStack = Java.use('dalvik.system.VMStack');
VMStack.getCallingClassLoader.implementation = function() {
logHook('TRIGGER', 'ROOT', 'VMStack', 'getCallingClassLoader', '');
return null;
};
logHook('OK', 'ROOT', 'VMStack', 'getCallingClassLoader', '');
} catch (e) {
logHook('FAIL', 'ROOT', 'VMStack', 'getCallingClassLoader', e);
}
});
function hookNativeRootFuncs() {
var nativeFuncs = [
'stat', 'lstat', 'readlink', 'fopen', 'fopenat', 'openat', 'access', 'fgets', 'execve', 'system'
];
nativeFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName('libc.so', func);
if (ptrFunc) {
Interceptor.attach(ptrFunc, {
onEnter: function(args) {
var path = '';
try {
path = Memory.readUtf8String(args[0]);
} catch (e) {}
if (path && (path.indexOf('su') !== -1 || path.indexOf('magisk') !== -1 || path.indexOf('busybox') !== -1)) {
logHook('TRIGGER', 'ROOT', 'libc', func, path);
if (func === 'access' || func === 'stat' || func === 'lstat' || func === 'fopen' || func === 'fopenat' || func === 'openat') {
this.returnValue = -1;
}
}
}
});
logHook('OK', 'ROOT', 'libc', func, 'native');
}
} catch (e) {
logHook('FAIL', 'ROOT', 'libc', func, e);
}
});
}
setImmediate(hookNativeRootFuncs);
Java.perform(function() {
try {
var HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
HttpsURLConnection.setSSLSocketFactory.implementation = function(factory) {
logHook('TRIGGER', 'SSL', 'HttpsURLConnection', 'setSSLSocketFactory', '');
return;
};
logHook('OK', 'SSL', 'HttpsURLConnection', 'setSSLSocketFactory', '');
} catch (e) {
logHook('FAIL', 'SSL', 'HttpsURLConnection', 'setSSLSocketFactory', e);
}
try {
HttpsURLConnection.setHostnameVerifier.implementation = function(verifier) {
logHook('TRIGGER', 'SSL', 'HttpsURLConnection', 'setHostnameVerifier', '');
return;
};
logHook('OK', 'SSL', 'HttpsURLConnection', 'setHostnameVerifier', '');
} catch (e) {
logHook('FAIL', 'SSL', 'HttpsURLConnection', 'setHostnameVerifier', e);
}
try {
var SSLSocketFactory = Java.use('javax.net.ssl.SSLSocketFactory');
SSLSocketFactory.getDefault.implementation = function() {
logHook('TRIGGER', 'SSL', 'SSLSocketFactory', 'getDefault', '');
return this.getDefault.call(this);
};
logHook('OK', 'SSL', 'SSLSocketFactory', 'getDefault', '');
} catch (e) {
logHook('FAIL', 'SSL', 'SSLSocketFactory', 'getDefault', e);
}
try {
var TrustManagerFactory = Java.use('javax.net.ssl.TrustManagerFactory');
TrustManagerFactory.getTrustManagers.implementation = function() {
logHook('TRIGGER', 'SSL', 'TrustManagerFactory', 'getTrustManagers', '');
return this.getTrustManagers.call(this);
};
logHook('OK', 'SSL', 'TrustManagerFactory', 'getTrustManagers', '');
} catch (e) {
logHook('FAIL', 'SSL', 'TrustManagerFactory', 'getTrustManagers', e);
}
try {
var KeyManagerFactory = Java.use('javax.net.ssl.KeyManagerFactory');
KeyManagerFactory.getKeyManagers.implementation = function() {
logHook('TRIGGER', 'SSL', 'KeyManagerFactory', 'getKeyManagers', '');
return this.getKeyManagers.call(this);
};
logHook('OK', 'SSL', 'KeyManagerFactory', 'getKeyManagers', '');
} catch (e) {
logHook('FAIL', 'SSL', 'KeyManagerFactory', 'getKeyManagers', e);
}
try {
var SSLSession = Java.use('javax.net.ssl.SSLSession');
SSLSession.getPeerCertificates.implementation = function() {
logHook('TRIGGER', 'SSL', 'SSLSession', 'getPeerCertificates', '');
return [];
};
SSLSession.getPeerCertificateChain.implementation = function() {
logHook('TRIGGER', 'SSL', 'SSLSession', 'getPeerCertificateChain', '');
return [];
};
logHook('OK', 'SSL', 'SSLSession', 'getPeerCertificates/getPeerCertificateChain', '');
} catch (e) {
logHook('FAIL', 'SSL', 'SSLSession', 'getPeerCertificates/getPeerCertificateChain', e);
}
});
function hookNativeSSLFuncs() {
var sslFuncs = [
'SSL_set_cert_cb', 'SSL_CTX_set_cert_cb', 'SSL_CTX_set_client_cert_cb', 'SSL_CTX_set_client_cert_engine'
];
sslFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName('libssl.so', func);
if (ptrFunc) {
Interceptor.attach(ptrFunc, {
onEnter: function(args) {
logHook('TRIGGER', 'SSL', 'libssl', func, 'native');
args[1] = ptr(0);
}
});
logHook('OK', 'SSL', 'libssl', func, 'native');
}
} catch (e) {
logHook('FAIL', 'SSL', 'libssl', func, e);
}
});
}
setImmediate(hookNativeSSLFuncs);
rpc.exports = {
getlog: function() {
return hookLog;
},
printsummary: function() {
printSummary();
return true;
}
};
setImmediate(function() {
Java.perform(function() {
var suspiciousKeywords = [
'root', 'su', 'magisk', 'xposed', 'substrate', 'debug', 'adb', 'busybox', 'test-keys',
'pin', 'trust', 'verify', 'cert', 'chain', 'ssl', 'bypass', 'jailbreak', 'hook', 'tamper', 'frida', 'emulator', 'virtual', 'sandbox', 'checker', 'check', 'detect', 'is', 'has', 'get'
];
var hookedMethods = {};
Java.enumerateLoadedClasses({
onMatch: function(className) {
var lc = className.toLowerCase();
for (var i = 0; i < suspiciousKeywords.length; i++) {
if (lc.indexOf(suspiciousKeywords[i]) !== -1) {
try {
var klass = Java.use(className);
var methods = klass.class.getDeclaredMethods();
for (var j = 0; j < methods.length; j++) {
var m = methods[j];
var mName = m.getName();
for (var k = 0; k < suspiciousKeywords.length; k++) {
if (mName.toLowerCase().indexOf(suspiciousKeywords[k]) !== -1) {
var overloads = klass[mName].overloads;
for (var o = 0; o < overloads.length; o++) {
var key = className + '.' + mName + '.' + o;
if (!hookedMethods[key]) {
hookedMethods[key] = true;
overloads[o].implementation = function() {
var args = Array.prototype.slice.call(arguments);
var stack = Java.use('java.lang.Thread').currentThread().getStackTrace().toString();
logHook('TRIGGER', 'DYN', className, mName, 'args=' + JSON.stringify(args) + '\nStack=' + stack);
try {
var retType = this.class.getDeclaredMethod(mName, m.getParameterTypes()).getReturnType().getName();
if (retType === 'boolean') return false;
if (retType === 'int' || retType === 'long' || retType === 'float' || retType === 'double') return 0;
if (retType === 'java.lang.String') return '';
if (retType.endsWith('[]')) return [];
return null;
} catch (e) {
return null;
}
};
logHook('OK', 'DYN', className, mName, 'overload ' + o);
}
}
}
}
}
} catch (e) {
logHook('FAIL', 'DYN', className, '', e);
}
break;
}
}
},
onComplete: function() {}
});
});
});
setImmediate(function() {
var moreNativeFuncs = [
'stat', 'lstat', 'readlink', 'fopen', 'fopenat', 'openat', 'access', 'fgets', 'execve', 'system', 'unlink', 'remove', 'rename', 'chmod', 'chown', 'link', 'symlink', 'read', 'write', 'close', 'dup', 'dup2', 'fork', 'kill', 'ptrace',
'SSL_set_cert_cb', 'SSL_CTX_set_cert_cb', 'SSL_CTX_set_client_cert_cb', 'SSL_CTX_set_client_cert_engine', 'SSL_CTX_set_verify', 'SSL_CTX_set_custom_verify', 'SSL_set_custom_verify', 'SSL_get_verify_result', 'SSL_get_peer_certificate', 'SSL_get_peer_cert_chain', 'SSL_get1_peer_certificate', 'SSL_get1_chain_certs', 'SSL_CTX_set_cert_verify_callback',
'sslpinning_check', 'ssl_verify', 'ssl_check', 'root_check', 'root_detect', 'magisk_detect', 'xposed_detect', 'frida_detect', 'emulator_detect', 'jailbreak_detect'
];
moreNativeFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName(null, func);
if (ptrFunc) {
Interceptor.replace(ptrFunc, new NativeCallback(function() {
logHook('TRIGGER', 'NATIVE', 'lib', func, 'bypassed');
if (func.indexOf('verify') !== -1 || func.indexOf('check') !== -1 || func.indexOf('detect') !== -1) {
return 0;
}
return 0;
}, 'int', []));
logHook('OK', 'NATIVE', 'lib', func, 'replaced');
}
} catch (e) {
logHook('FAIL', 'NATIVE', 'lib', func, e);
}
});
});
setImmediate(function() {
Java.perform(function() {
try {
var DummyRoot = Java.registerClass({
name: 'com.frida.test.DummyRoot',
methods: {
isRooted: function() {
logHook('TRIGGER', 'TEST', 'DummyRoot', 'isRooted', '');
return false;
},
checkRoot: function() {
logHook('TRIGGER', 'TEST', 'DummyRoot', 'checkRoot', '');
return false;
}
}
});
logHook('OK', 'TEST', 'DummyRoot', 'isRooted/checkRoot', '');
} catch (e) {
logHook('FAIL', 'TEST', 'DummyRoot', 'isRooted/checkRoot', e);
}
try {
var DummySSL = Java.registerClass({
name: 'com.frida.test.DummySSL',
methods: {
verifyPin: function() {
logHook('TRIGGER', 'TEST', 'DummySSL', 'verifyPin', '');
return true;
},
checkCert: function() {
logHook('TRIGGER', 'TEST', 'DummySSL', 'checkCert', '');
return true;
}
}
});
logHook('OK', 'TEST', 'DummySSL', 'verifyPin/checkCert', '');
} catch (e) {
logHook('FAIL', 'TEST', 'DummySSL', 'verifyPin/checkCert', e);
}
});
});
setImmediate(function() {
try {
var jniFuncs = [
'CallBooleanMethod', 'CallStaticBooleanMethod', 'CallIntMethod', 'CallStaticIntMethod',
'CallObjectMethod', 'CallStaticObjectMethod', 'CallVoidMethod', 'CallStaticVoidMethod'
];
jniFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName('libart.so', func) || Module.findExportByName('libandroid_runtime.so', func);
if (ptrFunc) {
Interceptor.attach(ptrFunc, {
onEnter: function(args) {
logHook('TRIGGER', 'JNI', 'JNI', func, '');
}
});
logHook('OK', 'JNI', 'JNI', func, '');
}
} catch (e) {
logHook('FAIL', 'JNI', 'JNI', func, e);
}
});
} catch (e) {
logHook('FAIL', 'JNI', 'JNI', 'all', e);
}
});
setImmediate(function() {
try {
var Binder = Java.use('android.os.Binder');
Binder.transact.implementation = function(code, data, reply, flags) {
logHook('TRIGGER', 'BINDER', 'Binder', 'transact', 'code=' + code);
return this.transact.call(this, code, data, reply, flags);
};
logHook('OK', 'BINDER', 'Binder', 'transact', '');
} catch (e) {
logHook('FAIL', 'BINDER', 'Binder', 'transact', e);
}
});
setImmediate(function() {
try {
var DexClassLoader = Java.use('dalvik.system.DexClassLoader');
DexClassLoader.loadClass.implementation = function(name, resolve) {
logHook('TRIGGER', 'CLASSLOADER', 'DexClassLoader', 'loadClass', name);
return this.loadClass.call(this, name, resolve);
};
logHook('OK', 'CLASSLOADER', 'DexClassLoader', 'loadClass', '');
} catch (e) {
logHook('FAIL', 'CLASSLOADER', 'DexClassLoader', 'loadClass', e);
}
try {
var PathClassLoader = Java.use('dalvik.system.PathClassLoader');
PathClassLoader.loadClass.implementation = function(name, resolve) {
logHook('TRIGGER', 'CLASSLOADER', 'PathClassLoader', 'loadClass', name);
return this.loadClass.call(this, name, resolve);
};
logHook('OK', 'CLASSLOADER', 'PathClassLoader', 'loadClass', '');
} catch (e) {
logHook('FAIL', 'CLASSLOADER', 'PathClassLoader', 'loadClass', e);
}
});
setImmediate(function() {
var antiDebugFuncs = [
'ptrace', 'getpid', 'getppid', 'getuid', 'getgid', 'getgroups', 'syscall'
];
antiDebugFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName('libc.so', func);
if (ptrFunc) {
Interceptor.attach(ptrFunc, {
onEnter: function(args) {
logHook('TRIGGER', 'ANTIDEBUG', 'libc', func, '');
if (func === 'ptrace') args[0] = 0;                     }
});
logHook('OK', 'ANTIDEBUG', 'libc', func, '');
}
} catch (e) {
logHook('FAIL', 'ANTIDEBUG', 'libc', func, e);
}
});
});
setImmediate(function() {
Java.perform(function() {
try {
var Build = Java.use('android.os.Build');
Build.MODEL.value = 'Pixel 5';
Build.MANUFACTURER.value = 'Google';
Build.BRAND.value = 'google';
Build.DEVICE.value = 'raven';
Build.PRODUCT.value = 'raven';
logHook('OK', 'EMULATOR', 'Build', 'fields', '');
} catch (e) {
logHook('FAIL', 'EMULATOR', 'Build', 'fields', e);
}
});
});
setImmediate(function() {
Java.perform(function() {
try {
var Socket = Java.use('java.net.Socket');
Socket.connect.implementation = function(endpoint, timeout) {
logHook('TRIGGER', 'NET', 'Socket', 'connect', '');
return this.connect.call(this, endpoint, timeout);
};
logHook('OK', 'NET', 'Socket', 'connect', '');
} catch (e) {
logHook('FAIL', 'NET', 'Socket', 'connect', e);
}
try {
var HttpURLConnection = Java.use('java.net.HttpURLConnection');
HttpURLConnection.connect.implementation = function() {
logHook('TRIGGER', 'NET', 'HttpURLConnection', 'connect', '');
return this.connect.call(this);
};
logHook('OK', 'NET', 'HttpURLConnection', 'connect', '');
} catch (e) {
logHook('FAIL', 'NET', 'HttpURLConnection', 'connect', e);
}
});
});
setImmediate(function() {
Java.perform(function() {
try {
var WebView = Java.use('android.webkit.WebView');
WebView.loadUrl.implementation = function(url) {
logHook('TRIGGER', 'WEBVIEW', 'WebView', 'loadUrl', url);
return this.loadUrl.call(this, url);
};
logHook('OK', 'WEBVIEW', 'WebView', 'loadUrl', '');
} catch (e) {
logHook('FAIL', 'WEBVIEW', 'WebView', 'loadUrl', e);
}
try {
var WebViewClient = Java.use('android.webkit.WebViewClient');
WebViewClient.onReceivedSslError.implementation = function(view, handler, error) {
logHook('TRIGGER', 'WEBVIEW', 'WebViewClient', 'onReceivedSslError', '');
handler.proceed();
};
logHook('OK', 'WEBVIEW', 'WebViewClient', 'onReceivedSslError', '');
} catch (e) {
logHook('FAIL', 'WEBVIEW', 'WebViewClient', 'onReceivedSslError', e);
}
});
});
setImmediate(function() {
var memFuncs = ['mmap', 'munmap', 'memcpy', 'memcmp'];
memFuncs.forEach(function(func) {
try {
var ptrFunc = Module.findExportByName('libc.so', func);
if (ptrFunc) {
Interceptor.attach(ptrFunc, {
onEnter: function(args) {
logHook('TRIGGER', 'MEM', 'libc', func, '');
}
});
logHook('OK', 'MEM', 'libc', func, '');
}
} catch (e) {
logHook('FAIL', 'MEM', 'libc', func, e);
}
});
});
setImmediate(function() {
Java.perform(function() {
try {
var Debug = Java.use('android.os.Debug');
Debug.isDebuggerConnected.implementation = function() {
logHook('TRIGGER', 'TAMPER', 'Debug', 'isDebuggerConnected', '');
return false;
};
Debug.waitingForDebugger.implementation = function() {
logHook('TRIGGER', 'TAMPER', 'Debug', 'waitingForDebugger', '');
return false;
};
logHook('OK', 'TAMPER', 'Debug', 'isDebuggerConnected/waitingForDebugger', '');
} catch (e) {
logHook('FAIL', 'TAMPER', 'Debug', 'isDebuggerConnected/waitingForDebugger', e);
}
});
});
setImmediate(function() {
Java.perform(function() {
var rootHiders = [
'com.topjohnwu.magisk', 'com.devadvance.rootcloak', 'de.robv.android.xposed.installer', 'com.saurik.substrate'
];
try {
var PackageManager = Java.use('android.app.ApplicationPackageManager');
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
if (rootHiders.indexOf(pname) > -1) {
logHook('TRIGGER', 'ROOTHIDE', 'PackageManager', 'getPackageInfo', pname);
pname = 'safe.package.fake';
}
return this.getPackageInfo.call(this, pname, flags);
};
logHook('OK', 'ROOTHIDE', 'PackageManager', 'getPackageInfo', '');
} catch (e) {
logHook('FAIL', 'ROOTHIDE', 'PackageManager', 'getPackageInfo', e);
}
});
});
setImmediate(function() {
Java.perform(function() {
Java.enumerateLoadedClasses({
onMatch: function(className) {
try {
var klass = Java.use(className);
var methods = klass.class.getDeclaredMethods();
for (var j = 0; j < methods.length; j++) {
var m = methods[j];
var mName = m.getName();
var retType = m.getReturnType().getName();
var paramCount = m.getParameterTypes().length;
if ((retType === 'boolean' || retType === 'int' || retType === 'java.lang.String') && paramCount <= 2) {
var overloads = klass[mName].overloads;
for (var o = 0; o < overloads.length; o++) {
overloads[o].implementation = function() {
var args = Array.prototype.slice.call(arguments);
logHook('TRIGGER', 'OBFUSC', className, mName, 'args=' + JSON.stringify(args));
if (retType === 'boolean') return false;
if (retType === 'int') return 0;
if (retType === 'java.lang.String') return '';
return null;
};
logHook('OK', 'OBFUSC', className, mName, 'overload ' + o);
}
}
}
} catch (e) {}
},
onComplete: function() {}
});
});
});
setImmediate(function() {
Java.perform(function() {
try {
logHook('TEST', 'JNI', 'JNI', 'CallBooleanMethod', 'Simulated JNI call');
} catch (e) {}
try {
logHook('TEST', 'BINDER', 'Binder', 'transact', 'Simulated Binder call');
} catch (e) {}
try {
logHook('TEST', 'CLASSLOADER', 'DexClassLoader', 'loadClass', 'Simulated loadClass');
} catch (e) {}
try {
logHook('TEST', 'ANTIDEBUG', 'libc', 'ptrace', 'Simulated ptrace');
} catch (e) {}
try {
logHook('TEST', 'EMULATOR', 'Build', 'MODEL', 'Simulated emulator check');
} catch (e) {}
try {
logHook('TEST', 'NET', 'Socket', 'connect', 'Simulated network connect');
} catch (e) {}
try {
logHook('TEST', 'WEBVIEW', 'WebView', 'loadUrl', 'Simulated WebView loadUrl');
} catch (e) {}
try {
logHook('TEST', 'MEM', 'libc', 'mmap', 'Simulated mmap');
} catch (e) {}
try {
logHook('TEST', 'TAMPER', 'Debug', 'isDebuggerConnected', 'Simulated tamper check');
} catch (e) {}
try {
logHook('TEST', 'ROOTHIDE', 'PackageManager', 'getPackageInfo', 'Simulated root hide');
} catch (e) {}
try {
logHook('TEST', 'OBFUSC', 'ObfuscatedClass', 'obfuscatedMethod', 'Simulated obfuscated method');
} catch (e) {}
});
});
