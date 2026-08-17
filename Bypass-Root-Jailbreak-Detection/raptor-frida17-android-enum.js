/*
* raptor_frida_android_enum.js - Java class and method enumerator
* 
*
* "For all is like an ocean, all flows and connects; 
* touch it in one place and it echoes at the other end of the world."
*                        -- Fyodor Dostoevsky, The Brothers Karamazov
* 
* Frida.re JS code to enumerate Java classes and methods declared in an 
* Android app. See https: * further information on this world-class dynamic instrumentation toolkit.
*
* Example usage:
* $ pipx install frida-tools
* $ frida -U -f com.target.app -l raptor_frida_android_enum.js
*
* Tested with:
* Frida 17.3.2 on macOS 15.6.1 with Redmi Note 10S (Android 11)
*
* Get the latest version at:
* https: */
function enumAllClasses() {
var allClasses = [];
var classes = Java.enumerateLoadedClassesSync();
classes.forEach(function(aClass) {
try {
var className = aClass.match(/[L](.*);/)[1].replace(/\        } catch (err) {
return;
}         allClasses.push(className);
});
return allClasses;
}
function findClasses(pattern) {
var allClasses = enumAllClasses();
var foundClasses = [];
allClasses.forEach(function(aClass) {
try {
if (aClass.match(pattern)) {
foundClasses.push(aClass);
}
} catch (err) {}     });
return foundClasses;
}
function enumMethods(targetClass) {
var hook = Java.use(targetClass);
var ownMethods = hook.class.getDeclaredMethods();
hook.$dispose;
return ownMethods;
}
/*
* The following functions were not implemented because deemed impractical:
*
* enumAllMethods() - enumerate all methods declared in all Java classes
* findMethods(pattern) - find all Java methods that match a pattern
*
* See raptor_frida_ios_enum.js for a couple of ObjC implementation examples.
*/
setTimeout(function() { 
Java.perform(function() {
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
var a = enumMethods("com.target.app.PasswordManager")
a.forEach(function(s) { 
console.log(s); 
});
*/
});
}, 0);
