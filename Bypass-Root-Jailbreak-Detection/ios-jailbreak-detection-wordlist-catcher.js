if (ObjC.available) {
try {
Interceptor.attach(ObjC.classes.NSFileManager["- fileExistsAtPath:"].implementation, {
onEnter(args) {
var path = new ObjC.Object(args[2]).toString();
console.log(path);
}
});
Interceptor.attach(Module.findExportByName(null, "fopen"), {
onEnter(args) {
var path = args[0].readCString();
console.log(path);
}
});
Interceptor.attach(ObjC.classes.UIApplication["- canOpenURL:"].implementation, {
onEnter(args) {
var path = new ObjC.Object(args[2]).toString();
console.log(path);
}
});
const libSystemBdylibStat64 = Module.findExportByName("libSystem.B.dylib", "stat64");
if (libSystemBdylibStat64) {
Interceptor.attach(libSystemBdylibStat64, {
onEnter: function(args) {
var path = Memory.readUtf8String(args[0]);
console.log(path);
}
});
}
const libSystemBdylibStat = Module.findExportByName("libSystem.B.dylib", "stat");
if (libSystemBdylibStat) {
Interceptor.attach(libSystemBdylibStat, {
onEnter: function(args) {
var path = Memory.readUtf8String(args[0]);
console.log(path);
}
});
}
} catch (err) {
console.log("Exception : " + err.message);
}
} else {
console.log("Objective-C Runtime is not available!");
}
