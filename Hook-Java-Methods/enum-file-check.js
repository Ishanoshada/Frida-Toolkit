Java.perform(function() {
console.log("[*] Frida script started for detect root binaries...");
try {
var File = Java.use("java.io.File");
File.exists.implementation = function() {
var path = this.getAbsolutePath();
console.log("[+] " + path);
return this.exists();
};
} catch (e) {
console.log("[!] Error hooking root detection: " + e);
}
});
