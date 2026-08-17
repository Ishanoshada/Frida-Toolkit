Interceptor.attach(Module.findExportByName(null, "getenv"), {
onEnter: function(args) {
var name = Memory.readUtf8String(args[0]);
if (name === "DYLD_INSERT_LIBRARIES") {
console.log("[ðŸ”¥] getenv() called for DYLD_INSERT_LIBRARIES â€” Hiding it!");
this.replace = true;
args[0] = Memory.allocUtf8String("FAKE_ENV");
}
},
onLeave: function(retval) {
if (this.replace) {
retval.replace(0);
}
}
});
Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "task_for_pid"), {
onEnter: function(args) {
console.log("[ðŸ”¥] task_for_pid() detected â€” Blocking it!");
args[1] = ptr(0);
},
onLeave: function(retval) {
retval.replace(1);
}
});
Interceptor.attach(Module.findExportByName("libSystem.B.dylib", "sysctl"), {
onEnter: function(args) {
console.log("[ðŸ”¥] sysctl() called â€” Faking response.");
this.replace = true;
},
onLeave: function(retval) {
if (this.replace) {
retval.replace(0);
}
}
});
