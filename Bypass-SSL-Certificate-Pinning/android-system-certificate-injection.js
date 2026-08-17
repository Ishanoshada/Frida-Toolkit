/**************************************************************************************************
*
* Once we have captured traffic (once it's being sent to our proxy port) the next step is
* to ensure any clients using TLS (HTTPS) trust our CA certificate, to allow us to intercept
* encrypted connections successfully.
*
* This script does so by attaching to the internals of Conscrypt (the Android SDK's standard
* TLS implementation) and pre-adding our certificate to the 'already trusted' cache, so that
* future connections trust it implicitly. This ensures that all normal uses of Android APIs
* for HTTPS & TLS will allow interception.
*
* This does not handle all standalone certificate pinning techniques - where the application
* actively rejects certificates that are trusted by default on the system. That's dealt with
* in the separate certificate unpinning script.
*
* Source available at https: * SPDX-License-Identifier: AGPL-3.0-or-later
* SPDX-File
*
*************************************************************************************************/
Java.perform(() => {
const String = Java.use("java.lang.String");
const ByteArrayInputStream = Java.use('java.io.ByteArrayInputStream');
const CertFactory = Java.use('java.security.cert.CertificateFactory');
let cert;
try {
const certFactory = CertFactory.getInstance("X.509");
const certBytes = String.$new(CERT_PEM).getBytes();
cert = certFactory.generateCertificate(ByteArrayInputStream.$new(certBytes));
} catch (e) {
console.error('Could not parse provided certificate PEM!');
console.error(e);
Java.use('java.lang.System').exit(1);
}
[
'com.android.org.conscrypt.TrustedCertificateIndex',
'org.conscrypt.TrustedCertificateIndex',         'org.apache.harmony.xnet.provider.jsse.TrustedCertificateIndex',         'com.google.android.gms.org.conscrypt.TrustedCertificateIndex',     ].forEach((TrustedCertificateIndexClassname, i) => {
let TrustedCertificateIndex;
try {
TrustedCertificateIndex = Java.use(TrustedCertificateIndexClassname);
} catch (e) {
if (i === 0) {
throw new Error(`${TrustedCertificateIndexClassname} not found - could not inject system certificate`);
} else {
if (DEBUG_MODE) {
console.log(`[ ] Skipped cert injection for ${TrustedCertificateIndexClassname} (not present)`);
}
return;
}
}
try {
const findMethodNames = new Set(
TrustedCertificateIndex.class.getDeclaredMethods()
.map((method) => method.getName())
.filter((methodName) => methodName.startsWith('find'))
);
findMethodNames.forEach((methodName) => {
TrustedCertificateIndex[methodName].overloads
.filter((overload) =>
overload.argumentTypes.length === 1 &&
overload.argumentTypes[0].className === 'java.security.cert.X509Certificate'
)
.forEach((overload) => {
overload.implementation = function () {
if (!this.findBySubjectAndPublicKey(cert)) {
this.index(cert);
}
return overload.apply(this, arguments);
};
});
});
if (DEBUG_MODE) console.log(`[+] Injected cert into ${TrustedCertificateIndexClassname}`);
} catch (e) {
console.error(`[!] Error hooking system certificates via ${TrustedCertificateIndexClassname}:`);
console.error(DEBUG_MODE
? e
: '    ' + e.message
);
}
});
console.log('== System certificate trust injected ==');
});
