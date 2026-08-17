/*
* dump_methods.js - Dump the methods (with signatures) of a given class.
*
* Set the `className` global before loading, e.g.:
*   frida -U -f com.x -l dump_methods.js --no-pause -e "className='okhttp3.Request'"
*/
"use strict";
const CLASS = typeof className !== "undefined" ? className : "java.lang.String";
Java.perform(function () {
try {
const c = Java.use(CLASS);
const methods = c.class.getDeclaredMethods().concat(c.class.getMethods());
console.log("[dump_methods] " + CLASS + " -> " + methods.length + " methods");
methods.forEach(m => console.log("  " + m));
} catch (e) {
console.log("[dump_methods] failed: " + e);
}
});
