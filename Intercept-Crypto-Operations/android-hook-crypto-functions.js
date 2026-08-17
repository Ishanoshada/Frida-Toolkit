Java.perform(function() {
function printStackTrace() {
var Exception = Java.use("java.lang.Exception");
var ex = Exception.$new();
var stack = ex.getStackTrace();
console.log("[*] Stack trace:");
for (var i = 0; i < stack.length; i++) {
console.log("\t" + stack[i].toString());
}
}
function byteArrayToSafeString(byteArray) {
var result = '';
for (var i = 0; i < byteArray.length; ++i) {
var byteVal = byteArray[i] & 0xFF;                          if (byteVal >= 32 && byteVal <= 126) {
result += String.fromCharCode(byteVal);
} else {
result += '.';              }
}
return result;
}
var Cipher = Java.use('javax.crypto.Cipher');
Cipher.init.overload('int', 'java.security.Key').implementation = function(opmode, key) {
console.log("[*] Cipher.init() called with opmode: " + opmode + " and key: " + key);
return this.init(opmode, key);
};
Cipher.init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(opmode, key, params) {
console.log("[*] Cipher.init() called with opmode: " + opmode + ", key: " + key + ", params: " + params);
return this.init(opmode, key, params);
};
var Mac = Java.use('javax.crypto.Mac');
Mac.init.overload('java.security.Key').implementation = function(key) {
console.log("[*] Mac.init() called with key: " + key);
return this.init(key);
};
var MessageDigest = Java.use('java.security.MessageDigest');
MessageDigest.getInstance.overload('java.lang.String').implementation = function(algorithm) {
console.log("[*] MessageDigest.getInstance() called with algorithm: " + algorithm);
return this.getInstance(algorithm);
};
MessageDigest.digest.overload('[B').implementation = function(input) {
console.log("[*] MessageDigest.digest() called with input: " + input);
var byteArray = Java.array('byte', input);          var safePlaintext = byteArrayToSafeString(byteArray);
console.log("[*] Plaintext interpretation of input bytes: " + safePlaintext);
return this.digest(input);
};
});
