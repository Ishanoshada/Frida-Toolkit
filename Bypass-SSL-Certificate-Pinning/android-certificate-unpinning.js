/**************************************************************************************************
*
* This script defines a large set of targeted certificate unpinning hooks: matching specific
* methods in certain classes, and transforming their behaviour to ensure that restrictions to
* TLS trust are disabled.
*
* This does not disable TLS protections completely - each hook is designed to disable only
* *additional* restrictions, and to explicitly trust the certificate provided as CERT_PEM in the
* config.js configuration file, preserving normal TLS protections wherever possible, even while
* allowing for controlled MitM of local traffic.
*
* The file consists of a few general-purpose methods, then a data structure declaratively
* defining the classes & methods to match, and how to transform them, and then logic at the end
* which uses this data structure, applying the transformation for each found match to the
* target process.
*
* For more details on what was matched, and log output when each hooked method is actually used,
* enable DEBUG_MODE in config.js, and watch the Frida output after running this script.
*
* Source available at https: * SPDX-License-Identifier: AGPL-3.0-or-later
* SPDX-File
*
*************************************************************************************************/
function buildX509CertificateFromBytes(certBytes) {
const ByteArrayInputStream = Java.use('java.io.ByteArrayInputStream');
const CertFactory = Java.use('java.security.cert.CertificateFactory');
const certFactory = CertFactory.getInstance("X.509");
return certFactory.generateCertificate(ByteArrayInputStream.$new(certBytes));
}
function getCustomTrustManagerFactory() {
const certBytes = Java.use("java.lang.String").$new(CERT_PEM).getBytes();
const trustedCACert = buildX509CertificateFromBytes(certBytes);
const KeyStore = Java.use("java.security.KeyStore");
const keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
keyStore.load(null);
keyStore.setCertificateEntry("ca", trustedCACert);
const TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
const customTrustManagerFactory = TrustManagerFactory.getInstance(
TrustManagerFactory.getDefaultAlgorithm()
);
customTrustManagerFactory.init(keyStore);
return customTrustManagerFactory;
}
function getCustomX509TrustManager() {
const customTrustManagerFactory = getCustomTrustManagerFactory();
const trustManagers = customTrustManagerFactory.getTrustManagers();
const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
const x509TrustManager = trustManagers.find((trustManager) => {
return trustManager.class.isAssignableFrom(X509TrustManager.class);
});
return Java.cast(x509TrustManager, X509TrustManager);
}
const NO_OP = () => {};
const RETURN_TRUE = () => true;
const CHECK_OUR_TRUST_MANAGER_ONLY = () => {
const trustManager = getCustomX509TrustManager();
return (certs, authType) => {
trustManager.checkServerTrusted(certs, authType);
};
};
const PINNING_FIXES = {
'javax.net.ssl.HttpsURLConnection': [
{
methodName: 'setDefaultHostnameVerifier',
replacement: () => NO_OP
},
{
methodName: 'setSSLSocketFactory',
replacement: () => NO_OP
},
{
methodName: 'setHostnameVerifier',
replacement: () => NO_OP
},
],
'javax.net.ssl.SSLContext': [
{
methodName: 'init',
overload: ['[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'],
replacement: (targetMethod) => {
const customTrustManagerFactory = getCustomTrustManagerFactory();
return function (keyManager, _providedTrustManagers, secureRandom) {
return targetMethod.call(this,
keyManager,
customTrustManagerFactory.getTrustManagers(),                         secureRandom
);
}
}
}
],
'com.android.org.conscrypt.CertPinManager': [
{
methodName: 'isChainValid',
replacement: () => RETURN_TRUE
},
{
methodName: 'checkChainPinning',
replacement: () => NO_OP
}
],
'com.android.org.conscrypt.ct.CertificateTransparency': [
{
methodName: 'checkCT',
replacement: () => NO_OP
}
],
'org.conscrypt.ct.CertificateTransparency': [
{
methodName: 'checkCT',
replacement: () => NO_OP
}
],
'com.google.android.gms.org.conscrypt.ct.CertificateTransparency': [
{
methodName: 'checkCT',
replacement: () => NO_OP
}
],
'android.security.net.config.NetworkSecurityConfig': [
{
methodName: '$init',
overload: '*',
replacement: (targetMethod) => {
const PinSet = Java.use('android.security.net.config.PinSet');
const EMPTY_PINSET = PinSet.EMPTY_PINSET.value;
const pinsIndex = targetMethod.argumentTypes.findIndex(
(argType) => argType.className === 'android.security.net.config.PinSet'
);
if (pinsIndex === -1) {
console.warn('[!] No PinSet argument in NetworkSecurityConfig constructor - ' +
'config-defined certificate pinning will not be disabled');
}
return function () {
if (pinsIndex !== -1) arguments[pinsIndex] = EMPTY_PINSET;
targetMethod.call(this, ...arguments);
}
}
}
],
'com.android.okhttp.internal.tls.OkHostnameVerifier': [
{
methodName: 'verify',
overload: [
'java.lang.String',
'javax.net.ssl.SSLSession'
],
replacement: (targetMethod) => {
const trustManager = getCustomX509TrustManager();
return function (hostname, sslSession) {
try {
const certs = sslSession.getPeerCertificates();
const authType = "RSA";
trustManager.checkServerTrusted(certs, authType);
return true;
} catch (e) {} 
return targetMethod.call(this, ...arguments);
}
}
}
],
'com.android.okhttp.Address': [
{
methodName: '$init',
overload: [
'java.lang.String',
'int',
'com.android.okhttp.Dns',
'javax.net.SocketFactory',
'javax.net.ssl.SSLSocketFactory',
'javax.net.ssl.HostnameVerifier',
'com.android.okhttp.CertificatePinner',
'com.android.okhttp.Authenticator',
'java.net.Proxy',
'java.util.List',
'java.util.List',
'java.net.ProxySelector'
],
replacement: (targetMethod) => {
const defaultHostnameVerifier = Java.use("com.android.okhttp.internal.tls.OkHostnameVerifier")
.INSTANCE.value;
const defaultCertPinner = Java.use("com.android.okhttp.CertificatePinner")
.DEFAULT.value;
return function () {
arguments[5] = defaultHostnameVerifier;
arguments[6] = defaultCertPinner;
targetMethod.call(this, ...arguments);
}
}
},
{
methodName: '$init',
overload: [
'java.lang.String',
'int',
'javax.net.SocketFactory',
'javax.net.ssl.SSLSocketFactory',
'javax.net.ssl.HostnameVerifier',
'com.android.okhttp.CertificatePinner',
'com.android.okhttp.Authenticator',
'java.net.Proxy',
'java.util.List',
'java.util.List',
'java.net.ProxySelector'
],
replacement: (targetMethod) => {
const defaultHostnameVerifier = Java.use("com.android.okhttp.internal.tls.OkHostnameVerifier")
.INSTANCE.value;
const defaultCertPinner = Java.use("com.android.okhttp.CertificatePinner")
.DEFAULT.value;
return function () {
arguments[4] = defaultHostnameVerifier;
arguments[5] = defaultCertPinner;
targetMethod.call(this, ...arguments);
}
}
}
],
'okhttp3.CertificatePinner': [
{
methodName: 'check',
overload: ['java.lang.String', 'java.util.List'],
replacement: () => NO_OP
},
{
methodName: 'check',
overload: ['java.lang.String', 'java.security.cert.Certificate'],
replacement: () => NO_OP
},
{
methodName: 'check',
overload: ['java.lang.String', '[Ljava.security.cert.Certificate;'],
replacement: () => NO_OP
},
{
methodName: 'check$okhttp',
replacement: () => NO_OP
},
],
'com.squareup.okhttp.CertificatePinner': [
{
methodName: 'check',
overload: ['java.lang.String', 'java.security.cert.Certificate'],
replacement: () => NO_OP
},
{
methodName: 'check',
overload: ['java.lang.String', 'java.util.List'],
replacement: () => NO_OP
}
],
'com.datatheorem.android.trustkit.pinning.PinningTrustManager': [
{
methodName: 'checkServerTrusted',
replacement: CHECK_OUR_TRUST_MANAGER_ONLY
}
],
'appcelerator.https.PinningTrustManager': [
{
methodName: 'checkServerTrusted',
replacement: CHECK_OUR_TRUST_MANAGER_ONLY
}
],
'nl.xservices.plugins.sslCertificateChecker': [
{
methodName: 'execute',
overload: ['java.lang.String', 'org.json.JSONArray', 'org.apache.cordova.CallbackContext'],
replacement: () => (_action, _args, context) => {
context.success("CONNECTION_SECURE");
return true;
}
}
],
'com.worklight.wlclient.api.WLClient': [
{
methodName: 'pinTrustedCertificatePublicKey',
getMethod: (WLClientCls) => WLClientCls.getInstance().pinTrustedCertificatePublicKey,
overload: '*'
}
],
'com.worklight.wlclient.certificatepinning.HostNameVerifierWithCertificatePinning': [
{
methodName: 'verify',
overload: '*',
replacement: () => NO_OP
}
],
'com.worklight.androidgap.plugin.WLCertificatePinningPlugin': [
{
methodName: 'execute',
overload: '*',
replacement: () => RETURN_TRUE
}
],
'com.commonsware.cwac.netsecurity.conscrypt.CertPinManager': [
{
methodName: 'isChainValid',
overload: '*',
replacement: () => RETURN_TRUE
}
],
'io.netty.handler.ssl.util.FingerprintTrustManagerFactory': [
{
methodName: 'checkTrusted',
replacement: () => NO_OP
}
],
'com.silkimen.cordovahttp.CordovaServerTrust': [
{
methodName: '$init',
replacement: (targetMethod) => function () {
if (arguments[0] === 'pinned') {
arguments[0] = 'default';
}
return targetMethod.call(this, ...arguments);
}
}
],
'com.appmattus.certificatetransparency.internal.verifier.CertificateTransparencyHostnameVerifier': [
{
methodName: 'verify',
replacement: () => RETURN_TRUE
}
],
'com.appmattus.certificatetransparency.internal.verifier.CertificateTransparencyInterceptor': [
{
methodName: 'intercept',
replacement: () => (a) => a.proceed(a.request())
}
],
'com.appmattus.certificatetransparency.internal.verifier.CertificateTransparencyTrustManager': [
{
methodName: 'checkServerTrusted',
overload: ['[Ljava.security.cert.X509Certificate;', 'java.lang.String'],
replacement: CHECK_OUR_TRUST_MANAGER_ONLY,
methodName: 'checkServerTrusted',
overload: ['[Ljava.security.cert.X509Certificate;', 'java.lang.String', 'java.lang.String'],
replacement: () => {
const trustManager = getCustomX509TrustManager();
return (certs, authType, _hostname) => {
trustManager.checkServerTrusted(certs, authType);
return Java.use('java.util.Arrays').asList(certs);
};
}
}
]
};
const getJavaClassIfExists = (clsName) => {
try {
const TargetClass = Java.use(clsName);
try {
Java.use('java.lang.Class').forName(
clsName,
true,                 TargetClass.class.getClassLoader()
);
} catch (e) {
if (DEBUG_MODE) console.log(`[ ] Could not initialize ${clsName}: ${e.message}`);
}
return TargetClass;
} catch {
return undefined;
}
}
Java.perform(function () {
if (DEBUG_MODE) console.log('\n    === Disabling all recognized unpinning libraries ===');
const classesToPatch = Object.keys(PINNING_FIXES);
classesToPatch.forEach((targetClassName) => {
const TargetClass = getJavaClassIfExists(targetClassName);
if (!TargetClass) {
if (DEBUG_MODE) console.log(`[ ] ${targetClassName} *`);
return;
}
const patches = PINNING_FIXES[targetClassName];
let patchApplied = false;
patches.forEach(({ methodName, getMethod, overload, replacement }) => {
const namedTargetMethod = getMethod
? getMethod(TargetClass)
: TargetClass[methodName];
const methodDescription = `${methodName}${
overload === '*'
? '(*)'
: overload
? '(' + overload.map((argType) => {
const argClassName = argType.split('.').slice(-1)[0];
if (argType.startsWith('[L')) return `${argClassName}[]`;
else return argClassName;
}).join(', ') + ')'
: ''
}`
let targetMethodImplementations = [];
try {
if (namedTargetMethod) {
if (!overload) {
targetMethodImplementations = [namedTargetMethod];
} else if (overload === '*') {
targetMethodImplementations = namedTargetMethod.overloads;
} else {
targetMethodImplementations = [namedTargetMethod.overload(...overload)];
}
}
} catch (e) {
}
if (targetMethodImplementations.length === 0) {
if (DEBUG_MODE) console.log(`[ ] ${targetClassName} ${methodDescription}`);
return;
}
targetMethodImplementations.forEach((targetMethod, i) => {
const patchName = `${targetClassName} ${methodDescription}${
targetMethodImplementations.length > 1 ? ` (${i})` : ''
}`;
try {
const newImplementation = replacement(targetMethod);
if (DEBUG_MODE) {
targetMethod.implementation = function () {
console.log(` => ${patchName}`);
return newImplementation.apply(this, arguments);
}
} else {
targetMethod.implementation = newImplementation;
}
if (DEBUG_MODE) console.log(`[+] ${patchName}`);
patchApplied = true;
} catch (e) {
console.error(`[!] ERROR: ${patchName} failed: ${e}`);
}
})
});
if (!patchApplied) {
console.warn(`[!] Matched class ${targetClassName} but could not patch any methods`);
}
});
console.log('== Certificate unpinning completed ==');
});
