Java.perform(function() {
console.log("[*] Starting minimal XL encryption analysis...");
try {
var Cipher = Java.use('javax.crypto.Cipher');
var SecretKeySpec = Java.use('javax.crypto.spec.SecretKeySpec');
var String = Java.use('java.lang.String');
Cipher.init.overload('int', 'java.security.Key').implementation = function(opmode, key) {
if (opmode == 1) {                 console.log("\n[CIPHER] Cipher.init() called for ENCRYPTION");
try {
var keyBytes = key.getEncoded();
console.log('[CIPHER] Key: ' + bytesToHex(keyBytes));
} catch (e) {
console.log('[CIPHER] Error getting key: ' + e);
}
}
return this.init(opmode, key);
};
Cipher.doFinal.overload('[B').implementation = function(input) {
var result = this.doFinal(input);
try {
if (input.length > 50) {
var inputStr = String.$new(input);
console.log("\n[ENCRYPT] Processing data (" + input.length + " bytes)");
if (inputStr.includes('{') && inputStr.includes('}') && 
(inputStr.includes('lang') || inputStr.includes('xdata') || inputStr.includes('xtime'))) {
console.log('[ENCRYPT] Input (likely JSON): ' + inputStr.substring(0, 200) + (inputStr.length > 200 ? '...' : ''));
console.log('[ENCRYPT] Output (encrypted): ' + bytesToHex(result));
} else if (input.length > 100) {
console.log('[ENCRYPT] Large input detected, first 100 bytes: ' + bytesToHex(input.slice(0, 100)));
console.log('[ENCRYPT] Output (encrypted), first 100 bytes: ' + bytesToHex(result.slice(0, 100)));
}
}
} catch (e) {
if (input.length > 100) {
console.log("\n[ENCRYPT] Binary data processing (" + input.length + " bytes)");
console.log('[ENCRYPT] First 50 bytes: ' + bytesToHex(input.slice(0, 50)));
console.log('[ENCRYPT] Output first 50 bytes: ' + bytesToHex(result.slice(0, 50)));
}
}
return result;
};
console.log("[*] Hooked essential Cipher functions");
} catch (e) {
console.log("[!] Error hooking Cipher: " + e);
}
try {
var HttpURLConnection = Java.use('java.net.HttpURLConnection');
var OutputStream = Java.use('java.io.OutputStream');
var String = Java.use('java.lang.String');
HttpURLConnection.getOutputStream.implementation = function() {
try {
var url = this.getURL().toString();
if (url.includes('xl') || url.includes('myxl') || url.includes('api')) {
console.log("\n[HTTP] XL-related request detected");
console.log('[HTTP] URL: ' + url);
console.log('[HTTP] Method: ' + this.getRequestMethod());
try {
var contentType = this.getRequestProperty('Content-Type');
if (contentType) console.log('[HTTP] Content-Type: ' + contentType);
var auth = this.getRequestProperty('Authorization');
if (auth) console.log('[HTTP] Authorization present: true');
var signature = this.getRequestProperty('X-Signature');
if (signature) console.log('[HTTP] X-Signature present: true');
} catch (e) {}
}
} catch (e) {}
return this.getOutputStream();
};
OutputStream.write.overload('[B').implementation = function(data) {
try {
if (data.length > 50) {
var dataStr = String.$new(data);
if (dataStr.includes('xdata') || dataStr.includes('xtime') || 
(dataStr.trim().startsWith('{') && dataStr.includes('}') && dataStr.length > 100)) {
console.log("\n[HTTP-WRITE] XL payload detected:");
console.log('[HTTP-WRITE] Data: ' + dataStr);
} else if (data.length > 500) {
console.log("\n[HTTP-WRITE] Large payload (" + data.length + " bytes)");
console.log('[HTTP-WRITE] First 200 chars: ' + dataStr.substring(0, 200));
}
}
} catch (e) {
if (data.length > 500) {
console.log("\n[HTTP-WRITE] Large binary payload (" + data.length + " bytes)");
console.log('[HTTP-WRITE] First 50 bytes (hex): ' + bytesToHex(data.slice(0, 50)));
}
}
return this.write(data);
};
console.log("[*] Hooked HTTP functions");
} catch (e) {
console.log("[!] Error hooking HTTP functions: " + e);
}
function bytesToHex(bytes) {
try {
var result = '';
for (var i = 0; i < Math.min(bytes.length, 32); i++) {
var hex = (bytes[i] & 0xFF).toString(16);
if (hex.length === 1) hex = '0' + hex;
result += hex;
}
if (bytes.length > 32) result += '...';
return result.toUpperCase();
} catch (e) {
return '[Error converting to hex]';
}
}
});
console.log("[*] Minimal XL encryption interceptor loaded. Waiting for app activity...");
