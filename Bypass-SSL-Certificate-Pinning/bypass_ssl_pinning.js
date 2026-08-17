/*
* bypass_ssl_pinning.js - Defeat common SSL pinning implementations.
*
* Covers:
*   - javax.net.ssl.X509TrustManager (blanket accept)
*   - okhttp3.CertificatePinner
*   - android.net.http.X509TrustManagerExtensions
*   - HttpsURLConnection default HostnameVerifier
*
* Educational use only.
*/
"use strict";
function bypassTrustManager() {
const X509 = Java.use("java.security.cert.X509Certificate");
const tm = Java.registerClass({
name: "com.qtphone.PinningBypassTrustManager",
implements: [Java.use("javax.net.ssl.X509TrustManager")],
methods: {
checkClientTrusted: function () {},
checkServerTrusted: function () {},
getAcceptedIssuers: function () { return []; }
}
});
const init = Java.use("javax.net.ssl.SSLContext")["init"].overload(
"[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom");
init.implementation = function (km, tmArr, sr) {
return init.call(this, km, [tm.$new()], sr);
};
console.log("[pinning] SSLContext patched");
}
function bypassOkHttp() {
try {
const CertPin = Java.use("okhttp3.CertificatePinner");
CertPin.check.overloads.forEach(fn => { fn.implementation = function () { return; }; });
CertPin["check$okhttp"].overloads.forEach(fn => { fn.implementation = function () { return; }; });
console.log("[pinning] okhttp3 CertificatePinner patched");
} catch (e) { console.log("[pinning] okhttp3 not present"); }
try {
const Huc = Java.use("javax.net.ssl.HttpsURLConnection");
Huc.setHostnameVerifier.implementation = function (v) { return; };
const Hv = Java.use("javax.net.ssl.HostnameVerifier");
const hv = Java.registerClass({
name: "com.qtphone.AlwaysTrueHostnameVerifier",
implements: [Hv],
methods: { verify: function (host, session) { return true; } }
});
Huc.setDefaultHostnameVerifier(hv.$new());
console.log("[pinning] HttpsURLConnection hostname verifier patched");
} catch (e) { console.log("[pinning] HUC patch failed: " + e); }
}
Java.perform(function () {
bypassTrustManager();
bypassOkHttp();
});
