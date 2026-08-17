Java.perform(function () {
var RootCheckClass = Java.use("com.yourpackage.name.RootCheck");     RootCheckClass.isRooted.implementation = function () {
console.log("isRooted() was called, returning false.");
return false;      };
RootCheckClass.isDebuggerAttached.implementation = function () {
console.log("isDebuggerAttached() was called, returning false.");
return false;      };
RootCheckClass.getDeviceState.implementation = function () {
console.log("getDeviceState() was called, modifying return value.");
var originalResult = this.getDeviceState();
return originalResult & ~1 & ~4;      };
});
