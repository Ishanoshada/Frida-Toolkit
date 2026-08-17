Interceptor.attach(Module.findExportByName(null, "SSL_CTX_set_custom_verify"), {
onEnter: function (args) {
console.log("[*] Bypassing SSL_CTX_set_custom_verify");
args[1] = 0;         args[2] = ptr(0);     }
});
Interceptor.attach(Module.findExportByName(null, "SSL_get_verify_result"), {
onLeave: function (retval) {
console.log("[*] Patching SSL_get_verify_result return value");
retval.replace(0x0);     }
});
Interceptor.attach(Module.findExportByName(null, "SSL_read"), {
onEnter: function (args) {
this.ssl = args[0];
this.buf = args[1];
},
onLeave: function (retval) {
if (retval.toInt32() > 0) {
var buf = Memory.readByteArray(this.buf, retval.toInt32());
console.log("[*] SSL_read data:\n" + hexdump(buf, { offset: 0, length: retval.toInt32(), header: true, ansi: true }));
}
}
});
