Java.perform(function () {
var jailbreakPaths = [
"/Applications/Cydia.app",
"/Applications/Sileo.app",
"/Applications/Zebra.app",
"/Applications/blackra1n.app",
"/private/var/lib/cydia",
"/usr/bin/ssh",
"/etc/apt"
];
var fopen = Module.findExportByName("libsystem_kernel.dylib", "open");
if (fopen) {
Interceptor.attach(fopen, {
onEnter: function (args) {
var path = Memory.readUtf8String(args[0]);
if (jailbreakPaths.includes(path)) {
console.log("Blocked jailbreak path check: " + path);
args[0] = Memory.allocUtf8String("/fakepath");
}
}
});
}
var sysctl = Module.findExportByName("libsystem_kernel.dylib", "sysctl");
if (sysctl) {
Interceptor.attach(sysctl, {
onEnter: function (args) {
console.log("Blocked sysctl call (possible jailbreak check)");
this.shouldBlock = true;
},
onLeave: function (retval) {
if (this.shouldBlock) retval.replace(0);
}
});
}
var getenv = Module.findExportByName("libc.dylib", "getenv");
if (getenv) {
Interceptor.attach(getenv, {
onEnter: function (args) {
var varName = Memory.readUtf8String(args[0]);
if (varName.indexOf("DYLD_INSERT_LIBRARIES") !== -1) {
console.log("Blocked getenv DYLD_INSERT_LIBRARIES check");
args[0] = Memory.allocUtf8String("FAKE_ENV_VAR");
}
}
});
}
var newJailbreakFunctions = ["ptrace", "csops", "sysctlbyname", "get_task_allow"];
newJailbreakFunctions.forEach(function (func) {
var target = Module.findExportByName("libsystem_kernel.dylib", func);
if (target) {
Interceptor.attach(target, {
onEnter: function (args) {
console.log("Blocked new jailbreak detection: " + func);
this.shouldBlock = true;
},
onLeave: function (retval) {
if (this.shouldBlock) retval.replace(0);
}
});
}
});
});
