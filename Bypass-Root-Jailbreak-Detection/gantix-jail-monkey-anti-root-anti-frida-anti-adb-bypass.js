/*
BY JOHN KAI$3R
https:    https:*/
Java.perform(function() {
let RootedCheck = Java.use("com.gantix.JailMonkey.Rooted.RootedCheck");
RootedCheck["isJailBroken"].implementation = function(context) {
console.log(`RootedCheck.isJailBroken is called: context=${context}`);
return false;
};
RootedCheck["rootBeerCheck"].implementation = function(context) {
console.log(`RootedCheck.rootBeerCheck is called: context=${context}`);
return false;
};
let HookDetectionCheck = Java.use("com.gantix.JailMonkey.HookDetection.HookDetectionCheck");
HookDetectionCheck["hookDetected"].implementation = function(context) {
console.log(`HookDetectionCheck.hookDetected is called: context=${context}`);
return false;
};
HookDetectionCheck["checkFrida"].implementation = function(context) {
console.log(`HookDetectionCheck.checkFrida is called: context=${context}`);
return false;
};
HookDetectionCheck["advancedHookDetection"].implementation = function(context) {
console.log(`HookDetectionCheck.advancedHookDetection is called: context=${context}`);
return false;
};
let AdbEnabled = Java.use("com.gantix.JailMonkey.AdbEnabled.AdbEnabled");
AdbEnabled["AdbEnabled"].implementation = function(context) {
console.log(`AdbEnabled.AdbEnabled is called: context=${context}`);
return false;
};
});
