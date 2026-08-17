Java.perform(function() {
Java.use('com.gantix.JailMonkey.JailMonkeyModule').getConstants.implementation = function() {
var hashmap = this.getConstants();
hashmap.put('isJailBroken', Java.use("java.lang.Boolean").$new(false));
console.log(`Root Check Bypassed : âœ…`);
hashmap.put('hookDetected', Java.use("java.lang.Boolean").$new(false));
console.log(`Hook Check Bypassed : âœ…`);
hashmap.put('canMockLocation', Java.use("java.lang.Boolean").$new(false));
console.log(`Mock Location Check Bypassed : âœ…`);
hashmap.put('isOnExternalStorage', Java.use("java.lang.Boolean").$new(false));
console.log(`External Storage Check Bypassed : âœ…`);
hashmap.put('AdbEnabled', Java.use("java.lang.Boolean").$new(false));
console.log(`ADB Check Bypassed : âœ…`);
return hashmap;
}
let RootedCheckClass = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck")
RootedCheckClass.getResultByDetectionMethod.implementation = function() {
let map = this.getResultByDetectionMethod();
map.put("jailMonkey", Java.use("java.lang.Boolean").$new(false));
return map;
}
var RootBeerResultsClass = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck$RootBeerResults");
RootBeerResultsClass.isJailBroken.implementation = function() {
return false;
};
RootBeerResultsClass.toNativeMap.implementation = function() {
var map = this.toNativeMap.call(this);
map.put("detectRootManagementApps", Java.use("java.lang.Boolean").$new(false));
map.put("detectPotentiallyDangerousApps", Java.use("java.lang.Boolean").$new(false));
map.put("checkForSuBinary", Java.use("java.lang.Boolean").$new(false));
map.put("checkForDangerousProps", Java.use("java.lang.Boolean").$new(false));
map.put("checkForRWPaths", Java.use("java.lang.Boolean").$new(false));
map.put("detectTestKeys", Java.use("java.lang.Boolean").$new(false));
map.put("checkSuExists", Java.use("java.lang.Boolean").$new(false));
map.put("checkForRootNative", Java.use("java.lang.Boolean").$new(false));
map.put("checkForMagiskBinary", Java.use("java.lang.Boolean").$new(false));
console.log("Root detection method's result bypass : âœ…");
return map;
};
Java.use("com.gantix.JailMonkey.JailMonkeyModule").isDevelopmentSettingsMode.overload("com.facebook.react.bridge.Promise").implementation = function(p) {
p.resolve(Java.use("java.lang.Boolean").$new(false));
console.log("isDevelopmentSettingsMode Check Bypassed : âœ…");
}
Java.use("com.gantix.JailMonkey.JailMonkeyModule").isDebuggedMode.overload("com.facebook.react.bridge.Promise").implementation = function(p) {
p.resolve(Java.use("java.lang.Boolean").$new(false));
console.log("isDebuggerConnected Check Bypassed : âœ…");
}
})
