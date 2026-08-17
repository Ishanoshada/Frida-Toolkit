setTimeout(function() {
console.log("[+] Script carregado com sucesso!");
Java.perform(function x() {
function bytesToHex(bytes) {
return Array.from(bytes).map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}
function bytesToBase64(bytes) {
var base64String = Java.use("android.util.Base64").encodeToString(bytes, 0);
if (base64String.includes("g290FC")) {
console.log("\nâš ï¸ [STACK TRACE DETECTADO] âš ï¸");
var Log = Java.use("android.util.Log");
var Exception = Java.use("java.lang.Exception");
console.log(Log.getStackTraceString(Exception.$new()));
}
return base64String;
}
function bytesToUTF8(bytes) {
try {
return Java.use("java.lang.String").$new(bytes).toString();
} catch(e) {
return "NÃƒO LEGÃVEL";
}
}
var secret_key_spec = Java.use("javax.crypto.spec.SecretKeySpec");
secret_key_spec.$init.overload("[B", "java.lang.String").implementation = function (keyBytes, algorithm) {
console.log("\nðŸ”‘ [CHAVE DETECTADA]");
console.log(`| Algoritmo: ${algorithm}`);
console.log(`| Base64: ${bytesToBase64(keyBytes)}`);
console.log(`| Hex: ${bytesToHex(keyBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(keyBytes)}`);
return this.$init(keyBytes, algorithm);
};
var iv_parameter_spec = Java.use("javax.crypto.spec.IvParameterSpec");
iv_parameter_spec.$init.overload("[B").implementation = function (ivBytes) {
console.log("\nðŸ›¡ [IV DETECTADO]");
console.log(`| Base64: ${bytesToBase64(ivBytes)}`);
console.log(`| Hex: ${bytesToHex(ivBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(ivBytes)}`);
return this.$init(ivBytes);
};
var cipher = Java.use("javax.crypto.Cipher");
var cipherModes = new WeakMap();
cipher.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").implementation = function (mode, key, params) {
cipherModes.set(this, mode === 1 ? "CRIPTOGRAFIA" : "DESCRIPTOGRAFIA");
var keyBytes = key.getEncoded();
console.log("\nâš™ [CHAVE USADA NA OPERAÃ‡ÃƒO]");
console.log(`| Base64: ${bytesToBase64(keyBytes)}`);
console.log(`| Hex: ${bytesToHex(keyBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(keyBytes)}`);
try {
var ivBytes = Java.cast(params, iv_parameter_spec).getIV();
console.log("\nðŸ›¡ [IV USADO NA OPERAÃ‡ÃƒO]");
console.log(`| Base64: ${bytesToBase64(ivBytes)}`);
console.log(`| Hex: ${bytesToHex(ivBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(ivBytes)}`);
} catch(e) {}
return this.init(mode, key, params);
};
cipher.doFinal.overload("[B").implementation = function (inputBytes) {
var operation = cipherModes.get(this) || "MODO DESCONHECIDO";
console.log(`\nðŸ”’ [OPERACAO: ${operation}]`);
console.log("ðŸ“¤ ENTRADA:");
console.log(`| Base64: ${bytesToBase64(inputBytes)}`);
console.log(`| Hex: ${bytesToHex(inputBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(inputBytes)}`);
var outputBytes = this.doFinal(inputBytes);
console.log("\nðŸ“¥ SAÃDA:");
console.log(`| Base64: ${bytesToBase64(outputBytes)}`);
console.log(`| Hex: ${bytesToHex(outputBytes)}`);
console.log(`| UTF-8: ${bytesToUTF8(outputBytes)}`);
console.log("â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€");
return outputBytes;
};
});
}, 1000);
