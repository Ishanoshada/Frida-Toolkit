if (ObjC.available) {
console.log("âœ… Loading Ultimate Jailbreak Bypass");
var csops = Module.findExportByName(null, "csops");
if (csops) {
Interceptor.attach(csops, {
onEnter: function(args) {
console.log("ðŸ”¥ csops() called, faking clean iOS");
},
onLeave: function(retval) {
retval.replace(0);             }
});
}
var sysctl = Module.findExportByName(null, "sysctl");
if (sysctl) {
Interceptor.attach(sysctl, {
onEnter: function(args) {
console.log("ðŸ”¥ sysctl() called, faking clean iOS");
},
onLeave: function(retval) {
retval.replace(0);             }
});
}
var task_info = Module.findExportByName(null, "task_info");
if (task_info) {
Interceptor.attach(task_info, {
onEnter: function(args) {
console.log("ðŸ”¥ task_info() called, blocking detection");
},
onLeave: function(retval) {
retval.replace(0);             }
});
}
var syscall = Module.findExportByName(null, "syscall");
if (syscall) {
Interceptor.attach(syscall, {
onEnter: function(args) {
var syscall_number = args[0].toInt32();
console.log("ðŸ”¥ syscall() detected: " + syscall_number);
},
onLeave: function(retval) {
retval.replace(0);             }
});
}
console.log("âœ… Ultimate Jailbreak Bypass Fully Loaded!");
}
