Java.perform(function() {
console.log("\n[*] Frida script started for enumerating cmd runs...");
var Runtime = Java.use("java.lang.Runtime");
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
try {
Runtime.exec.overload("java.lang.String").implementation = function(cmd) {
console.log("[+] Runtime.exec called with: " + cmd);
return this.exec(cmd);
}
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);                         var cmdString = Java.use('java.lang.String').valueOf(cmd);
console.log("[+] ProcessBuilder.start called with: " + cmdString);
return this.start.call(this);         };
} catch (e) {
console.log("[!] Error hooking func: " + e);
}
});
