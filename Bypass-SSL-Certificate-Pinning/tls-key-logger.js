/*
Thanks for Andy Davies inspiration
https:
The code here is using for extract tiktok app sslkey on iOS14.2.1
Callback offset for different iOS system is here
iOS12 #0x2a8
iOS13 #0x2c0
iOS14 #0x2b8
iOS15 #0x2f8
To delay the script running is because the libboringssl.dylib is not loaded when we using frida -f command to spawn the tiktok app
Any question is welcome to fllfxx@icloud.com
*/
var CALLBACK_OFFSET = 0x2b8;
function key_logger(ssl, line) {
console.log(new NativePointer(line).readCString());
}
function test() {
var key_log_callback = new NativeCallback(key_logger, 'void', ['pointer', 'pointer']);
var SSL_CTX_set_info_callback = Module.findExportByName('libboringssl.dylib', 'SSL_CTX_set_info_callback');
Interceptor.attach(SSL_CTX_set_info_callback, {
onEnter: function(args) {
var ssl = new NativePointer(args[0]);
var callback = new NativePointer(ssl).add(CALLBACK_OFFSET);
callback.writePointer(key_log_callback);
}
});
}
Interceptor.attach(ObjC.classes.TTHttpTask["- skipSSLCertificateError"].implementation, {
onEnter: function (args) {
},
onLeave: function (retval) {
retval.replace(0x1);
}
});
Interceptor.attach(ObjC.classes.TTNetworkManager["- ServerCertificate"].implementation, {
onEnter: function (args) {
},
onLeave: function (retval) {
retval.replace(0x0);
}
});
Interceptor.attach(ObjC.classes.TTNetworkManagerChromium["- ServerCertificate"].implementation, {
onEnter: function (args) {
},
onLeave: function (retval) {
retval.replace(0x0);
}
});
setImmediate(function() {
setTimeout(test, 400)
});
