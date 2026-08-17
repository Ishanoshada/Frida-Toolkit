function stalkJavaClass(className) {
Java.perform(function() {
try {
var TargetClass = Java.use(className);
console.log("[*] Stalking class: " + className);
var methods = TargetClass.class.getDeclaredMethods();
methods.forEach(function(method) {
var methodName = method.getName();
console.log("[*] Hooking method: " + methodName);
TargetClass[methodName].overload().implementation = function() {
var args = Array.prototype.slice.call(arguments);
console.log("[*] Called: " + className + "." + methodName);
console.log("[*] Arguments: " + JSON.stringify(args));
console.log("[*] Backtrace:\n" + Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
var retval = this[methodName].apply(this, args);
console.log("[*] Return value: " + retval);
return retval;
};
});
} catch (e) {
console.error("[!] Error stalking class: " + e);
}
});
}
function stalkJavaMethod(className, methodName, overloads) {
Java.perform(function() {
try {
var TargetClass = Java.use(className);
console.log("[*] Stalking method: " + className + "." + methodName);
var method = TargetClass[methodName].overload.apply(TargetClass[methodName], overloads);
method.implementation = function() {
var args = Array.prototype.slice.call(arguments);
console.log("[*] Called: " + className + "." + methodName);
console.log("[*] Arguments: " + JSON.stringify(args));
console.log("[*] Backtrace:\n" + Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new()));
var retval = method.apply(this, args);
console.log("[*] Return value: " + retval);
return retval;
};
} catch (e) {
console.error("[!] Error stalking method: " + e);
}
});
}
function findClassNames(pattern) {
Java.perform(function() {
console.log("[*] Searching for class names matching: " + pattern);
var regex = new RegExp(pattern, "i");
Java.enumerateLoadedClasses({
onMatch: function(className) {
if (regex.test(className)) {
console.log("[*] Found: " + className);
}
},
onComplete: function() {
console.log("[*] Search completed.");
}
});
});
}
function findAndStalk(pattern) {
Java.perform(function() {
console.log("[*] Searching for class names matching: " + pattern);
var regex = new RegExp(pattern, "i");
Java.enumerateLoadedClasses({
onMatch: function(className) {
if (regex.test(className)) {
console.log("[*] Found and stalking: " + className);
stalkJavaClass(className);                 }
},
onComplete: function() {
console.log("[*] Search and stalk completed.");
}
});
});
}
function nullifyClass(className) {
Java.perform(function() {
try {
var TargetClass = Java.use(className);
console.log("[*] Nullifying class: " + className);
var methods = TargetClass.class.getDeclaredMethods();
methods.forEach(function(method) {
var methodName = method.getName();
console.log("[*] Nullifying method: " + methodName);
TargetClass[methodName].overload().implementation = function() {
var args = Array.prototype.slice.call(arguments);
console.log("[*] Nullified method called: " + className + "." + methodName);
console.log("[*] Arguments: " + JSON.stringify(args));
return null;
};
});
} catch (e) {
console.error("[!] Error nullifying class: " + e);
}
});
}
findClassNames("Interceptor");
findAndStalk("Interceptor");
nullifyClass("com.example.target.MyClass");
