Java.perform(function () {
console.log("[+] Stealth Frida Hook Loaded");
var sysctl = Module.findExportByName(null, "sysctl");
if (sysctl) {
Interceptor.attach(sysctl, {
onEnter: function (args) {
console.log("[Blocked] sysctl call detected");
this.skip = true;
},
onLeave: function (retval) {
if (this.skip) retval.replace(-1);
}
});
}
var ptrace = Module.findExportByName(null, "ptrace");
if (ptrace) {
Interceptor.attach(ptrace, {
onEnter: function (args) {
console.log("[Blocked] ptrace anti-debugging");
args[0] = 31;             }
});
}
console.log("[+] Frida Hooks Applied - Tinder Should Now Be Accessible");
});
