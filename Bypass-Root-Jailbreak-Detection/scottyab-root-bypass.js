Java.perform(function () {
setTimeout(function () {
var modules = Process.enumerateModules();
modules.forEach(function(module) {
console.log("Loaded module:", module.name);
});
var targetModule = Process.getModuleByName("libtoolChecker.so");
if (targetModule) {
console.log("Found libtoolChecker.so at:", targetModule.base);
} else {
console.log("Failed to find libtoolChecker.so.");
}
}, 2000); });
