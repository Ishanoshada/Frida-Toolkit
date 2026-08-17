/*
Code to dump plaintext from Swift apps on iOS using AES.GCM.SealedBox (https: 
Dumps the plaintext using built in hexdump, as hex for easy copying and as raw text.
Relies on the memory layout of the returned Foundation.Data object 
https:
*/
function hookAESGCMopen1(){
var someFunc = Module.findExportByName(null, "$s9CryptoKit3AESO3GCMO4open_5using10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVtKFZ");
if (someFunc) {
console.log("[+] Found $s9CryptoKit3AESO3GCMO4open_5using10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVtKFZ");
Interceptor.attach(someFunc, {
onEnter: hookAESGCMopenEnter,
onLeave: hookAESGCMopenLeave
});
}
}
function hookAESGCMopen2(){
var someFunc = Module.findExportByName(null, "$s9CryptoKit3AESO3GCMO4open_5using14authenticating10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVxtKAI0I8ProtocolRzlFZ");
if (someFunc) {
console.log("[+] Found $s9CryptoKit3AESO3GCMO4open_5using14authenticating10Foundation4DataVAE9SealedBoxV_AA12SymmetricKeyVxtKAI0I8ProtocolRzlFZ");
Interceptor.attach(someFunc, {
onEnter: hookAESGCMopenEnter,
onLeave: hookAESGCMopenLeave
});
}
}
function hookAESGCMopenEnter(args) {
console.log("enter 1");
}
function bytesToHex2(bytes, len) {
for (var hex = [], i = 0; i < len; i++) {
hex.push((bytes[i] >>> 4).toString(16));
hex.push((bytes[i] & 0xF).toString(16));
}
return hex.join("");
}
function hookAESGCMopenLeave(args) {
console.log("leave 1")
var p2 = this.context.x1.add(16);
var p3 = p2.readPointer();
var p4 = p2.add(8);
var len = p4.readU16();
console.log("buffer length: " + len);
console.log(hexdump(p3, { offset: 0, length: len, header: true, ansi: false }));
var data = new Uint8Array(p3.readByteArray(len));
console.log(bytesToHex2(data, len));
var nsd = nsdata(p3, len)
var nss = nsdata2nsstr(nsd)
console.log(nss);
}
function nsdata2nsstr(nsdata) {
return ObjC.classes.NSString.alloc().initWithData_encoding_(nsdata, 4);
}
function nsdata(b, len) {
return ObjC.classes.NSData.alloc().initWithBytes_length_(b, len);
}
hookAESGCMopen1();
hookAESGCMopen2();
