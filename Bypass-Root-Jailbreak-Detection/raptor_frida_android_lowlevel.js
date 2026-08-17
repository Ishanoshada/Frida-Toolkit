/*
* raptor_frida_android_*.js - Frida snippets for Android
* 
*
* Frida.re JS script snippets for Android instrumentation.
* See https: * for further information on this powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Many thanks to Maurizio Agazzini <inode@wayreth.eu.org>
* and Federico Dotta <federico.dotta@mediaservice.net>.
*
* Example usage:
* # frida -U -f com.xxx.yyy -l raptor_frida_android.js --no-pause
*/
setTimeout(function() { 
Java.perform(function() {
Interceptor.attach(Module.findExportByName("/system/lib/libc.so", "open"), {
onEnter: function(args) {
this.flag = false;
this.flag = true;
if (this.flag) {
console.warn("\n*** entered open");
var filename = Memory.readCString(ptr(args[0]));
console.log("\nfile name: " + filename);
console.log("\nBacktrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE)
.map(DebugSymbol.fromAddress).join("\n"));
}
},
onLeave: function(retval) {
if (this.flag) {
console.log("\nretval: " + retval);
console.warn("\n*** exiting open");
}
}
});   
});   
}, 0);
