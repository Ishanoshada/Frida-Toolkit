/* Description: Raptor frida android enum
* Mode: S
* Version: 1.0
* 
*/
/*
* raptor_frida_android_enum.js - Java class/method enumerator
* 
*
* Frida.re JS functions to enumerate Java classes and methods 
* declared in an iOS app. See https: * https: * powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Example usage:
* # frida -U -f com.target.app -l raptor_frida_android_enum.js --no-pause
*
* Get the latest version at:
* https: */
function enumAllClasses()
{
var allClasses = [];
var classes = Java.enumerateLoadedClassesSync();
classes.forEach(function(aClass) {
try {
var className = aClass.match(/[L](.*);/)[1].replace(/\		}
catch(err) {} 		allClasses.push(className);
});
return allClasses;
}
function findClasses(pattern)
{
var allClasses = enumAllClasses();
var foundClasses = [];
allClasses.forEach(function(aClass) {
try {
if (aClass.match(pattern)) {
foundClasses.push(aClass);
}
}
catch(err) {} 	});
return foundClasses;
}
function enumMethods(targetClass)
{
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
