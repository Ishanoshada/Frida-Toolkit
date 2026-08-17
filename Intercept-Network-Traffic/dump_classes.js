/*
* dump_classes.js - Enumerate all loaded Java classes on the target and write
* them to /sdcard/frida_classes.txt (and print a summary).
*
* Optional filter: pass a substring via the script's `filter` global, e.g.
*   frida -U -f com.x -l dump_classes.js --no-pause -e "filter='okhttp'"
*/
"use strict";
const FILTER = typeof filter !== "undefined" ? filter : "";
rpc.exports = {
dump: function () {
const out = [];
Java.perform(function () {
const classes = Java.enumerateLoadedClassesSync();
classes.forEach(c => {
if (!FILTER || c.indexOf(FILTER) !== -1) out.push(c);
});
});
return out.join("\n");
}
};
Java.perform(function () {
const classes = Java.enumerateLoadedClassesSync()
.filter(c => !FILTER || c.indexOf(FILTER) !== -1);
console.log("[dump_classes] " + classes.length + " classes" +
(FILTER ? " (filter=" + FILTER + ")" : ""));
const text = classes.join("\n");
try {
const File = Java.use("java.io.File");
const fw = Java.use("java.io.FileWriter");
const w = fw.$new("/sdcard/frida_classes.txt");
w.write(text);
w.close();
console.log("[dump_classes] wrote /sdcard/frida_classes.txt");
} catch (e) {
console.log("[dump_classes] could not write file: " + e);
}
});
