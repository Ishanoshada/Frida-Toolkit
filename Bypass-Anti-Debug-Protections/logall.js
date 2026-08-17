if (ObjC.available) {
console.log("âœ… Loading Full Tinder Debug Logger");
var sysctl = Module.findExportByName(null, "sysctl");
if (sysctl) {
Interceptor.attach(sysctl, {
onEnter: function(args) {
console.log("ðŸ”¥ sysctl() called");
},
onLeave: function(retval) {
retval.replace(0);
}
});
}
var csops = Module.findExportByName(null, "csops");
if (csops) {
Interceptor.attach(csops, {
onEnter: function(args) {
console.log("ðŸ”¥ csops() called");
},
onLeave: function(retval) {
retval.replace(0);
}
});
}
var task_info = Module.findExportByName(null, "task_info");
if (task_info) {
Interceptor.attach(task_info, {
onEnter: function(args) {
console.log("ðŸ”¥ task_info() called");
},
onLeave: function(retval) {
retval.replace(0);
}
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
retval.replace(0);
}
});
}
var mmap = Module.findExportByName(null, "mmap");
if (mmap) {
Interceptor.attach(mmap, {
onEnter: function(args) {
console.log("ðŸ”¥ mmap() called");
},
onLeave: function(retval) {
retval.replace(ptr(-1));
}
});
}
var ptrace = Module.findExportByName(null, "ptrace");
if (ptrace) {
Interceptor.attach(ptrace, {
onEnter: function(args) {
console.log("ðŸ”¥ ptrace() called (possible anti-debugging)");
},
onLeave: function(retval) {
retval.replace(0);
}
});
}
console.log("âœ… Full Tinder Debug Logger Loaded");
}
