var bcryptdecrypt = Module.getExportByName("bcrypt.dll", "BCryptDecrypt");
Interceptor.attach(bcryptdecrypt, {
onEnter: function(args) {
this.plaintextPointer = args[6];
this.plaintextSizeVal = args[7];
if (this.plaintextPointer.isNull()) {
this.abort = true;
return;
}
try {
this.plaintextSize = this.plaintextSizeVal.readU64();
} catch (err) {
}
},
onLeave: function(retval) {
if (this.abort || this.plaintextSize == 0) {
return;
}
try {
let plaintext = this.plaintextPointer.readCString(this.plaintextSize);
if (plaintext != null) {
console.log('Obtained cleartext is: ' + plaintext);
}
} catch (err) {
}
}
});
