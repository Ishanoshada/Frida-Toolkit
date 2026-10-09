/*
* raptor_frida_android_trace.js - Java/Module tracer for Android
* 
*
* "Life is not like water. Things in life don't necessarily 
* flow over the shortest possible route."
*                                  -- Haruki Murakami, 1Q84
* 
* Frida.re JS code to trace arbitrary Java methods and Module functions calls
* in an Android app for debugging and reverse engineering. See https: * and https: * dynamic instrumentation toolkit.
*
* Example usage:
* $ pipx install frida-tools
* $ frida -U -f com.target.app -l raptor_frida_android_trace.js
*
* Tested with:
* Frida 17.3.2 on macOS 15.6.1 with Redmi Note 10S (Android 11)
* 
* Thanks:
* @inode-, @federicodotta, @leonjza, @dankluev
*
* Get the latest version at:
* https: */
function trace(pattern) {
var type = (pattern.toString().indexOf("!") === -1) ? "java" : "module";
if (type === "module") {
var res = new ApiResolver("module");
var matches = res.enumerateMatches(pattern);
var targets = uniqBy(matches, JSON.stringify);
targets.forEach(function(target) {
traceModule(target.address, target.name);
});
} else if (type === "java") {
var found = false;
Java.enumerateLoadedClasses({
onMatch: function(aClass) {
if (aClass.match(pattern)) {
found = true;
try {
var className = aClass.match(/[L](.*);/)[1].replace(/\                    } catch (err) {
return;
}                     traceClass(className);
}
},
onComplete: function() {}
});
if (!found) {
try {
traceMethod(pattern);
} catch (err) {                 console.error(err);
}
}
}
}
function traceClass(targetClass) {
var hook = Java.use(targetClass);
var methods = hook.class.getDeclaredMethods();
hook.$dispose;
var parsedMethods = [];
methods.forEach(function(method) {
parsedMethods.push(method.toString().replace(targetClass + ".", "TOKEN").match(/\sTOKEN(.*)\(/)[1]);
});
var targets = uniqBy(parsedMethods, JSON.stringify);
targets.forEach(function(targetMethod) {
traceMethod(targetClass + "." + targetMethod);
});
}
function traceMethod(targetClassMethod) {
var delim = targetClassMethod.lastIndexOf(".");
if (delim === -1) return;
var targetClass = targetClassMethod.slice(0, delim)
var targetMethod = targetClassMethod.slice(delim + 1, targetClassMethod.length)
var hook = Java.use(targetClass);
var overloadCount = hook[targetMethod].overloads.length;
console.log("Tracing " + targetClassMethod + " [" + overloadCount + " overload(s)]");
for (var i = 0; i < overloadCount; i++) {
hook[targetMethod].overloads[i].implementation = function() {
console.warn("\n*** entered " + targetClassMethod);
if (arguments.length) console.log();
for (var j = 0; j < arguments.length; j++) {
console.log("arg[" + j + "]: " + arguments[j]);
}
var retval = this[targetMethod].apply(this, arguments);             console.log("\nretval: " + retval);
console.warn("\n*** exiting " + targetClassMethod);
return retval;
}
}
}
function traceModule(impl, name) {
console.log("Tracing " + name);
Interceptor.attach(impl, {
onEnter: function(args) {
this.flag = false;
this.flag = true;
if (this.flag) {
console.warn("\n*** entered " + name);
}
},
onLeave: function(retval) {
if (this.flag) {
console.log("\nretval: " + retval);
console.warn("\n*** exiting " + name);
}
}
});
}
function uniqBy(array, key) {
var seen = {};
return array.filter(function(item) {
var k = key(item);
return seen.hasOwnProperty(k) ? false : (seen[k] = true);
});
}
setTimeout(function() { 
Java.perform(function() {
});
}, 0);
