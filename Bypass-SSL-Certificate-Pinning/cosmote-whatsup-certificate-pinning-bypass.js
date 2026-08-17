/* 
Bypassing certificate pinning in COSMOTE What's Up 4.7.1 (Android 9)
Made with love by Stavros Mekesis (https:
$ frida -U -f gr.cosmote.whatsup -l cosmote-whatsup.js --no-pause
*/
Java.perform(function() {
try {
var Pinner = Java.use("l.h$a");
Pinner.a.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(a, b) {
console.log('Disabling pin for ' + a);
return this;
};
} catch (err) {
console.log('CertificatePinner not found');
}
try {
var ConscryptFileDescriptorSocket = Java.use('com.android.org.conscrypt.ConscryptFileDescriptorSocket');
ConscryptFileDescriptorSocket.verifyCertificateChain.implementation = function(a, b) {
console.log('Disabling pin for verifyCertificateChain()');
return;
};
} catch (err) {
console.log('ConscryptFileDescriptorSocket.verifyCertificateChain() not found');
}
}, 0);
