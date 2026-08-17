/*
* raptor_frida_android_*.js - Frida snippets for Android
* 
*
* Frida.re JS script snippets for Android instrumentation.
* See https: * for further information on this powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Many thanks to Maurizio Agazzini <inode@wayreth.eu.org>
* and Federico Dotta <federico.dotta@mediaservice.net>.
*
* Example usage:
* # frida -U -f com.xxx.yyy -l raptor_frida_android.js --no-pause
*/
function findClass(pattern)
{
console.warn("\n*** finding all classes that match pattern: " + pattern + "\n");
Java.enumerateLoadedClasses({
onMatch: function(aClass) {
if (aClass.match(pattern))
console.log(aClass);
},
onComplete: function() {}
});
}
setTimeout(function() { 
Java.perform(function() {
});   
}, 0);
