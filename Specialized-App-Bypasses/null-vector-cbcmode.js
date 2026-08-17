const libraryName = "libcommonCrypto.dylib";
const functionName = "CCCrypt";
const CCCryptCreatePtr = Module.findExportByName(libraryName, functionName);
if (CCCryptCreatePtr !== null) {
console.log("[*] Hooking " + functionName);
Interceptor.attach(CCCryptCreatePtr, {
onEnter: function(args) {
this.op = args[0].toInt32();         this.dataIn = args[6];
this.dataInLength = args[7].toInt32();
this.dataOut = args[8];
console.log("[*] Intercepted CCCryptCreate");
if (args[1].toInt32() == 0){
if (args[2].toInt32() == 1 || args[2].toInt32() == 3 ) {
var iv = Memory.readByteArray(args[5], 16);
if (iv == null) {
console.log("mode is kCCOptionPKCS7Padding of CBC used and iv is null");
}
} 
}
},
onLeave: function(retval) {
console.log("[*] CCCryptorCreate returned:", retval);
if (this.op === 0) {
var plaintext = Memory.readByteArray(this.dataIn, this.dataInLength);
console.log("Plaintext input:", hexdump(plaintext));
}
}
});
} else {
console.log("[-] Unable to find " + functionName + " function to hook.");
}
