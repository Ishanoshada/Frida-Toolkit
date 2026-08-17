if (ObjC.available) {
var paths = [
"/Applications/blackra1n.app",
"/Applications/Cydia.app",
"/Applications/FakeCarrier.app",
"/Applications/Icy.app",
"/Applications/IntelliScreen.app",
"/Applications/MxTube.app",
"/Applications/RockApp.app",
"/Applications/SBSetttings.app",
"/Applications/WinterBoard.app",
"/bin/bash",
"/bin/sh",
"/bin/su",
"/etc/apt",
"/etc/ssh/sshd_config",
"/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist",
"/Library/MobileSubstrate/DynamicLibraries/Veency.plist",
"/Library/MobileSubstrate/MobileSubstrate.dylib",
"/pguntether",
"/private/var/lib/cydia",
"/private/var/mobile/Library/SBSettings/Themes",
"/private/var/stash",
"/private/var/tmp/cydia.log",
"/System/Library/LaunchDaemons/com.ikey.bbot.plist",
"/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
"/usr/bin/cycript",
"/usr/bin/ssh",
"/usr/bin/sshd",
"/usr/libexec/sftp-server",
"/usr/libexec/ssh-keysign",
"/usr/sbin/frida-server",
"/usr/sbin/sshd",
"/var/cache/apt",
"/var/lib/cydia",
"/var/log/syslog",
"/var/mobile/Media/.evasi0n7_installed",
"/var/tmp/cydia.log"
];
var f_stat64 = Module.findExportByName("libSystem.B.dylib", "stat64");
Interceptor.attach(f_stat64, {
onEnter: function(args) {
this.is_common_path = false;
var arg = Memory.readUtf8String(args[0]);
for (var path of paths) {
if (arg.includes(path)) {
console.log("Hooking stat64: " + arg);
this.is_common_path = true;
}
}
},
onLeave: function(retval) {
if (this.is_common_path) {
console.log("stat64 Bypass!!!");
retval.replace(-1);
}
}
});
var f_stat = Module.findExportByName("libSystem.B.dylib", "stat");
Interceptor.attach(f_stat, {
onEnter: function(args) {
this.is_common_path = false;
var arg = Memory.readUtf8String(args[0]);
for (var path of paths) {
if (arg.includes(path)) {
console.log("Hooking stat: " + arg);
this.is_common_path = true;
}
}
},
onLeave: function(retval) {
if (this.is_common_path) {
console.log("stat Bypass!!!");
retval.replace(-1);
}
}
});
var getenv = Module.findExportByName(null, "getenv");
Interceptor.attach(getenv, {
onEnter: function(args) {
var variable = Memory.readUtf8String(args[0]);
if (variable === "DYLD_INSERT_LIBRARIES") {
console.log("Hiding DYLD_INSERT_LIBRARIES");
this.should_block = true;
}
},
onLeave: function(retval) {
if (this.should_block) {
retval.replace(ptr(0));
}
}
});
var NSURLSession = ObjC.classes.NSURLSession;
if (NSURLSession) {
Interceptor.attach(NSURLSession["- dataTaskWithRequest:completionHandler:"].implementation, {
onEnter: function(args) {
var request = new ObjC.Object(args[2]);
var url = request.URL().absoluteString().toString();
if (url.includes("JBDevice=1")) {
console.log("Blocking Tinder jailbreak request: " + url);
this.should_block = true;
}
},
onLeave: function(retval) {
if (this.should_block) {
retval.replace(ptr(0));                 }
}
});
}
var sysctl = Module.findExportByName("libSystem.B.dylib", "sysctl");
Interceptor.attach(sysctl, {
onEnter: function(args) {
if (args[1] == 2 && Memory.readU32(args[0]) == 1) {
console.log("Blocking sysctl jailbreak check");
this.should_block = true;
}
},
onLeave: function(retval) {
if (this.should_block) {
retval.replace(-1);
}
}
});
var fork = Module.findExportByName("libSystem.B.dylib", "fork");
Interceptor.attach(fork, {
onEnter: function(args) {
console.log("Blocking fork() for sandbox detection");
},
onLeave: function(retval) {
retval.replace(-1);
}
});
var dlopen = Module.findExportByName(null, "dlopen");
Interceptor.attach(dlopen, {
onEnter: function(args) {
var libname = Memory.readUtf8String(args[0]);
if (libname.includes("MobileSubstrate") || libname.includes("Ellekit") || libname.includes("Substitute")) {
console.log("Blocking jailbreak tweak detection: " + libname);
this.should_block = true;
}
},
onLeave: function(retval) {
if (this.should_block) {
retval.replace(ptr(0));             }
}
});
}
