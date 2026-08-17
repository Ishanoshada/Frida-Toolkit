/*
* raptor_frida_ios_trace.js - ObjC & Module tracer for iOS
* 
*
* Frida.re JS script to trace arbitrary ObjC methods and
* Module functions for debugging and reverse engineering.
* See https: * for further information on this powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Many thanks to @inode-, @federicodotta, @mrmacete, and
* @dankluev.
*
* Example usage:
* # frida -U -f com.target.app -l raptor_frida_ios_trace.js --no-pause
*
* Get the latest version at:
* https: */
function trace(pattern) {
var type = (pattern.indexOf(" ") === -1) ? "module" : "objc";
var res = new ApiResolver(type);
var matches = res.enumerateMatchesSync(pattern);
var targets = uniqBy(matches, JSON.stringify);
targets.forEach(function(target) {
if (type === "objc")
traceObjC(target.address, target.name);
else if (type === "module")
traceModule(target.address, target.name);
});
}
function uniqBy(array, key) {
var seen = {};
return array.filter(function(item) {
var k = key(item);
return seen.hasOwnProperty(k) ? false : (seen[k] = true);
});
}
function traceObjC(impl, name) {
console.log("Tracing " + name);
Interceptor.attach(impl, {
onEnter: function(args) {
this.flag = 0;
this.flag = 1;
if (this.flag) {
console.warn("\n*** entered " + name);
console.log("\nCaller: " + DebugSymbol.fromAddress(this.returnAddress));
if (name.indexOf(":") !== -1) {
console.log();
var par = name.split(":");
par[0] = par[0].split(" ")[1];
for (var i = 0; i < par.length - 1; i++)
printArg(par[i] + ": ", args[i + 2]);
}
}
},
onLeave: function(retval) {
if (this.flag) {
printArg("\nretval: ", retval);
console.warn("\n*** exiting " + name);
}
}
});
}
function traceModule(impl, name) {
console.log("Tracing " + name);
Interceptor.attach(impl, {
onEnter: function(args) {
this.flag = 0;
this.flag = 1;
if (this.flag) {
console.warn("\n*** entered " + name);
console.log("\nBacktrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE)
.map(DebugSymbol.fromAddress).join("\n"));
}
},
onLeave: function(retval) {
if (this.flag) {
printArg("\nretval: ", retval);
console.warn("\n*** exiting " + name);
}
}
});
}
function printArg(desc, arg) {
try {
console.log(desc + ObjC.Object(arg));
} catch (err) {
console.log(desc + arg);
}
}
if (ObjC.available) {
} else {
send("error: Objective-C Runtime is not available!");
}
