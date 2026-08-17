Java.perform(function() {
try {
var Root = Java.use("com.alibaba.griver.base.common.utils.AOMPDeviceUtils");
if (Root) {
console.log("Alibaba IRoot detected");
Root.isRooted.overload().implementation = function() {
console.log("Alibaba IRoot called");
return false;
};
} else {
console.log("Alibaba IRoot Not detected");
}
} catch (error) {
console.error("An error occurred:", error);
}
});
Java.perform(function() {
try {
var Root = Java.use("com.google.firebase.crashlytics.internal.common.CommonUtils");
if (Root) {
console.log("firebase IRoot detected");
Root.isRooted.overload().implementation = function() {
console.log("firebase IRoot called");
return false;
};
Root.isEmulator.overload().implementation = function() {
console.log("firebase isEmulator called");
return false;
};
Root.isDebuggerAttached.overload().implementation = function() {
console.log("firebase isDebuggerAttached called");
return false;
};
Root.getDeviceState.overload().implementation = function() {
console.log("firebase getDeviceState called");
return 0;
};
} else {
console.log("firebase IRoot Not detected");
}
} catch (error) {
console.error("An error occurred:", error);
}
});
