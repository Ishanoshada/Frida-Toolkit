/*
------------ JailMonkey Bypass All Checks -------------
Description:
This script dynamically instruments Android applications using Frida to bypass multiple security layers,
including root detection, emulator detection, ADB/debugger checks, and JailMonkey anti-tampering mechanisms.
Functionalities:
1. Hooks and disables 'isEmulatorSync()' to fake real device environment.
2. Prevents debugger detection by overriding 'Debug.isDebuggerConnected()'.
3. Bypasses ADB enabled flag via Settings.Secure and Settings.Global.
4. Intercepts JailMonkeyâ€™s 'getConstants()' and returns fake safe values.
5. Bypasses development settings and debug mode checks in JailMonkey.
7. Attempts to hook RootBeer detection mechanisms (if present).
Example:
frida -U --codeshare h4rithd/jailmonkey-bypass -f com.example.targetapp
GitHub: https: Date: 23-June-2025
*/
Java.perform(() => {
console.log(`
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘   JailMonkey Bypass Loaded  â•‘
â•‘   
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
`);
const RNDeviceModule = Java.use('com.learnium.RNDeviceInfo.RNDeviceModule');
console.log("âž¤ Hooking isEmulatorSync method...");
RNDeviceModule.isEmulatorSync.implementation = function() {
console.log("âœ” isEmulatorSync() called â†’ returning false");
return false;
};
console.log("âœ” Bypass for isEmulatorSync is now active.");
const Debug = Java.use("android.os.Debug");
const SettingsGlobal = Java.use("android.provider.Settings$Global");
const SettingsSecure = Java.use("android.provider.Settings$Secure");
Debug.isDebuggerConnected.implementation = function() {
console.log("âœ” Debug.isDebuggerConnected bypassed");
return false;
};
SettingsSecure.getInt.overload("android.content.ContentResolver", "java.lang.String", "int").implementation = function(resolver, name, def) {
if (name === "adb_enabled") {
console.log("âœ” adb_enabled (Secure) bypassed");
return 0;
}
return this.getInt(resolver, name, def);
};
SettingsGlobal.getInt.overload("android.content.ContentResolver", "java.lang.String", "int").implementation = function(resolver, name, def) {
if (name === "adb_enabled") {
console.log("âœ” adb_enabled (Global) bypassed");
return 0;
}
return this.getInt(resolver, name, def);
};
try {
const JailMonkeyModule = Java.use('com.gantix.JailMonkey.JailMonkeyModule');
JailMonkeyModule.getConstants.implementation = function() {
const originalConstants = this.getConstants();
const JBoolean = Java.use("java.lang.Boolean");
originalConstants.put("isJailBroken", JBoolean.$new(false));
console.log("âœ” JailMonkey Root Check bypassed");
originalConstants.put("hookDetected", JBoolean.$new(false));
console.log("âœ” Hook Check bypassed");
originalConstants.put("canMockLocation", JBoolean.$new(false));
console.log("âœ” Mock Location Check bypassed");
originalConstants.put("isOnExternalStorage", JBoolean.$new(false));
console.log("âœ” External Storage Check bypassed");
originalConstants.put("AdbEnabled", JBoolean.$new(false));
console.log("âœ” ADB Flag bypassed");
return originalConstants;
};
JailMonkeyModule.isDevelopmentSettingsMode.overload("com.facebook.react.bridge.Promise").implementation = function(promise) {
promise.resolve(Java.use("java.lang.Boolean").$new(false));
console.log("âœ” Development Settings Check bypassed");
};
JailMonkeyModule.isDebuggedMode.overload("com.facebook.react.bridge.Promise").implementation = function(promise) {
promise.resolve(Java.use("java.lang.Boolean").$new(false));
console.log("âœ” isDebuggedMode Check bypassed");
};
} catch (err) {
console.warn("âš  JailMonkeyModule not found - skipping those hooks");
}
try {
const RootCheck = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck");
RootCheck.getResultByDetectionMethod.implementation = function() {
const resultMap = this.getResultByDetectionMethod();
resultMap.put("jailMonkey", Java.use("java.lang.Boolean").$new(false));
console.log("âœ” JailMonkey RootedCheck bypassed");
return resultMap;
};
} catch (err) {
console.warn("âš  RootedCheck class not found - skipping");
}
try {
const RootBeer = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck$RootBeerResults");
RootBeer.isJailBroken.implementation = function() {
console.log("âœ” RootBeer.isJailBroken bypassed");
return false;
};
RootBeer.toNativeMap.implementation = function() {
const nativeMap = this.toNativeMap.call(this);
const JBoolean = Java.use("java.lang.Boolean");
const keys = [
"detectRootManagementApps",
"detectPotentiallyDangerousApps",
"checkForSuBinary",
"checkForDangerousProps",
"checkForRWPaths",
"detectTestKeys",
"checkSuExists",
"checkForRootNative",
"checkForMagiskBinary"
];
keys.forEach(k => nativeMap.put(k, JBoolean.$new(false)));
console.log("âœ” RootBeer Detection Map fully bypassed");
return nativeMap;
};
} catch (err) {
console.warn("âš  RootBeerResults class not found - skipping");
}
});
