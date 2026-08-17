/**************************************************************************************************
*
* Once we have captured traffic (once it's being sent to our proxy port) the next step is
* to ensure any clients using TLS (HTTPS) trust our CA certificate, to allow us to intercept
* encrypted connections successfully.
*
* This script does this, by defining overrides to hook BoringSSL (used by iOS 11+) and Cronet
* (the Chromium network stack, used by some Android apps including TikTok). This is the primary
* certificate trust mechanism for iOS, and only a niche addition for Android edge cases.
*
* The hooks defined here ensure that normal certificate validation is skipped, and instead any
* TLS connection using our trusted CA is always trusted. In general use this disables both
* normal & certificate-pinned TLS/HTTPS validation, so that all connections which use your CA
* should always succeed.
*
* This does not completely disable TLS validation, but it does significantly relax it - it's
* intended for use with the other scripts in this repo that ensure all traffic is routed directly
* to your MitM proxy (generally on your local network). You probably don't want to use this for
* any sensitive traffic sent over public/untrusted networks - it is difficult to intercept, and
* any attacker would need a copy of the CA certificate you're using, but by its nature as a messy
* hook around TLS internals it's probably not 100% secure.
*
* Since iOS 11 (2017) Apple has used BoringSSL internally to handle all TLS. This code
* hooks low-level BoringSSL calls, to override all custom certificate validation completely.
* https: * but note that this script goes further - reimplementing basic TLS cert validation, rather than
* just returning OK blindly for all connections.
*
* Source available at https: * SPDX-License-Identifier: AGPL-3.0-or-later
* SPDX-File
*
*************************************************************************************************/
const TARGET_LIBS = [
{ name: 'libboringssl.dylib', hooked: false },     { name: 'libsscronet.so', hooked: false },     { name: 'boringssl', hooked: false },     { name: 'libssl.so', hooked: false }, ];
TARGET_LIBS.forEach((targetLib) => {
waitForModule(targetLib.name, (targetModule) => {
patchTargetLib(targetModule, targetLib.name);
targetLib.hooked = true;
});
if (
targetLib.name === 'libboringssl.dylib' &&
Process.platform === 'darwin' &&
!targetLib.hooked
) {
console.log(`\n !!! --- Could not load ${targetLib.name} to hook TLS --- !!!`);
}
});
function patchTargetLib(targetModule, targetName) {
const SSL_get0_peer_certificates = new NativeFunction(
targetModule.getExportByName('SSL_get0_peer_certificates'),
'pointer', ['pointer']
);
const sk_num = new NativeFunction(
targetModule.getExportByName('sk_num'),
'size_t', ['pointer']
);
const sk_value = new NativeFunction(
targetModule.getExportByName('sk_value'),
'pointer', ['pointer', 'int']
);
const crypto_buffer_len = new NativeFunction(
targetModule.getExportByName('CRYPTO_BUFFER_len'),
'size_t', ['pointer']
);
const crypto_buffer_data = new NativeFunction(
targetModule.getExportByName('CRYPTO_BUFFER_data'),
'pointer', ['pointer']
);
const SSL_VERIFY_OK = 0x0;
const SSL_VERIFY_INVALID = 0x1;
const verificationCallbackCache = {};
const buildVerificationCallback = (realCallbackAddr) => {
if (!verificationCallbackCache[realCallbackAddr]) {
const realCallback = (realCallbackAddr && !realCallbackAddr.isNull())
? new NativeFunction(realCallbackAddr, 'int', ['pointer', 'pointer'])
: () => SSL_VERIFY_INVALID;
let pendingCheckThreads = new Set();
const hookedCallback = new NativeCallback(function (ssl, out_alert) {
let realResult = false; 
const threadId = Process.getCurrentThreadId();
const alreadyHaveLock = pendingCheckThreads.has(threadId);
while (pendingCheckThreads.size > 0 && !alreadyHaveLock) {
Thread.sleep(0.01);
}
pendingCheckThreads.add(threadId);
if (targetName !== 'libboringssl.dylib') {
realResult = realCallback(ssl, out_alert);
}
const peerCerts = SSL_get0_peer_certificates(ssl);
for (let i = 0; i < sk_num(peerCerts); i++) {
const cert = sk_value(peerCerts, i);
const certDataLength = crypto_buffer_len(cert).toNumber();
if (certDataLength !== CERT_DER.byteLength) continue;
const certPointer = crypto_buffer_data(cert);
const certData = new Uint8Array(certPointer.readByteArray(certDataLength));
if (certData.every((byte, j) => CERT_DER[j] === byte)) {
if (!alreadyHaveLock) pendingCheckThreads.delete(threadId);
return SSL_VERIFY_OK;
}
}
if (realResult === false) {                     realResult = realCallback(ssl, out_alert);
}
if (!alreadyHaveLock) pendingCheckThreads.delete(threadId);
return realResult;
}, 'int', ['pointer','pointer']);
verificationCallbackCache[realCallbackAddr] = hookedCallback;
}
return verificationCallbackCache[realCallbackAddr];
};
const customVerifyAddrs = [
targetModule.findExportByName("SSL_set_custom_verify"),
targetModule.findExportByName("SSL_CTX_set_custom_verify")
].filter(Boolean);
customVerifyAddrs.forEach((set_custom_verify_addr) => {
const set_custom_verify_fn = new NativeFunction(
set_custom_verify_addr,
'void', ['pointer', 'int', 'pointer']
);
Interceptor.replace(set_custom_verify_fn, new NativeCallback(function(ssl, mode, providedCallbackAddr) {
set_custom_verify_fn(ssl, mode, buildVerificationCallback(providedCallbackAddr));
}, 'void', ['pointer', 'int', 'pointer']));
});
if (customVerifyAddrs.length) {
if (DEBUG_MODE) {
console.log(`[+] Patched ${customVerifyAddrs.length} ${targetName} verification methods`);
}
console.log(`== Hooked native TLS lib ${targetName} ==`);
} else {
console.log(`\n !!! Hooking native TLS lib ${targetName} failed - no verification methods found`);
}
const get_psk_identity_addr = targetModule.findExportByName("SSL_get_psk_identity");
if (get_psk_identity_addr) {
Interceptor.replace(get_psk_identity_addr, new NativeCallback(function(ssl) {
return "PSK_IDENTITY_PLACEHOLDER";
}, 'pointer', ['pointer']));
} else if (customVerifyAddrs.length) {
console.log(`Patched ${customVerifyAddrs.length} custom_verify methods, but couldn't find get_psk_identity`);
}
}
