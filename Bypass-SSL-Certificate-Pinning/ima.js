Java.perform(function () {
console.log("[+] Hooking SSL Pinning");
var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
var ByteArrayInputStream = Java.use("java.io.ByteArrayInputStream");
var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
var trustedFingerprint = "3AA81AD7B08F0158FFD2ADD7602FA1B027E491D063C842372CD3FBDA9D6B8DA0";
TrustManagerImpl.verifyChain.implementation = function (chain, authType, host) {
try {
if (chain == null || chain.length === 0) {
console.log("[!] Cadena de certificados vacÃ­a o nula, bloqueando.");
throw new Error("Cadena de certificados nula o vacÃ­a");
}
console.log("[+] Cadena de certificados recibida: " + chain);
var cert = chain[0];             if (!cert) {
console.log("[!] Certificado no encontrado en la cadena.");
throw new Error("Certificado no encontrado en la cadena");
}
var certBytes = cert.getEncoded();
var md = Java.use("java.security.MessageDigest").getInstance("SHA-256");
var fingerprint = md.digest(certBytes);
var hexString = "";
for (var i = 0; i < fingerprint.length; i++) {
var hex = (fingerprint[i] & 0xFF).toString(16);
if (hex.length == 1) hex = "0" + hex;
hexString += hex.toUpperCase();
}
console.log("[+] Certificado detectado: " + hexString);
if (hexString === trustedFingerprint) {
console.log("[+] Certificado confiable, permitiendo conexiÃ³n.");
return chain;             } else {
console.log("[!] Certificado NO confiable, bloqueando.");
throw new Error("SSL Pinning detectado");
}
} catch (e) {
console.log("[!] Error durante la verificaciÃ³n del certificado: " + e.message);
throw e;         }
};
});
