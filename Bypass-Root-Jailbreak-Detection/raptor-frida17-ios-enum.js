/*
* raptor_frida_ios_enum.js - ObjC class and method enumerator
* 
*
* "For all is like an ocean, all flows and connects; 
* touch it in one place and it echoes at the other end of the world."
*                        -- Fyodor Dostoevsky, The Brothers Karamazov
*
* Frida.re JS code to enumerate ObjC classes and methods declared in an
* iOS app. See https: * further information on this world-class dynamic instrumentation toolkit.
*
* Example usage:
* $ pipx install frida-tools
* $ frida -U -f com.target.app -l raptor_frida_ios_enum.js
*
* Tested with:
* Frida 17.3.2 on macOS 15.6.1 with iPhone 8 (iOS 16.5 + https: * 
* Get the latest version at:
* https: */
function enumAllClasses() {
var allClasses = [];
for (var aClass in ObjC.classes) {
if (ObjC.classes.hasOwnProperty(aClass)) {
allClasses.push(aClass);
}
}
return allClasses;
}
function findClasses(pattern) {
var allClasses = enumAllClasses();
var foundClasses = [];
allClasses.forEach(function(aClass) {
if (aClass.match(pattern)) {
foundClasses.push(aClass);
}
});
return foundClasses;
}
function enumMethods(targetClass) {
var ownMethods = ObjC.classes[targetClass].$ownMethods;
return ownMethods;
}
function enumAllMethods() {
var allClasses = enumAllClasses();
var allMethods = {};
allClasses.forEach(function(aClass) {
enumMethods(aClass).forEach(function(method) {
if (!allMethods[aClass]) allMethods[aClass] = [];
allMethods[aClass].push(method);
});
});
return allMethods;
}
function findMethods(pattern) {
var allMethods = enumAllMethods();
var foundMethods = {};
for (var aClass in allMethods) {
allMethods[aClass].forEach(function(method) {
if (method.match(pattern)) {
if (!foundMethods[aClass]) foundMethods[aClass] = [];
foundMethods[aClass].push(method);
}
});
}
return foundMethods;
}
if (ObjC.available) {
/*
var a = enumAllClasses();
a.forEach(function(s) { 
console.log(s); 
});
*/
/*
var a = findClasses(/password/i);
a.forEach(function(s) { 
console.log(s); 
});
*/
/*
var a = enumMethods("PasswordManager")
a.forEach(function(s) { 
console.log(s); 
});
*/
/*
var d = enumAllMethods();
for (k in d) {
console.log(k);
d[k].forEach(function(s) {
console.log("\t" + s);
});
}
*/
/*
var d = findMethods(/password/i);
for (k in d) {
console.log(k);
d[k].forEach(function(s) {
console.log("\t" + s);
});
}
*/
} else {
send("error: Objective-C Runtime is not available!");
}
