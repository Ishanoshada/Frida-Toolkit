var keywords = ["Security", "Encryption", "Interceptor", "intercept", "ssl"];
var loadedClasses = [];
Java.perform(function() {
var classLoaded = Java.enumerateLoadedClassesSync();
classLoaded.forEach(function(className) {
keywords.forEach(function(keyword) {
if (!loadedClasses.includes(className) && className.includes(keyword)) {
loadedClasses.push("[+] Dumped: " + className + "\n");
}
});
});
console.log(loadedClasses);
});
