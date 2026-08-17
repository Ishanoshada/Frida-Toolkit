/*
Android/iOS freeRASP Bypass by DevTraleski (Based on rodolfomarianocy/ios-freerasp-react-native-bypass )
frida -U -f <bundle_identifier> --codeshare DevTraleski/android-ios-freerasp-bypass
https:    https:*/
console.warn("[+] Android/iOS freeRASP React Native Bypass...")
if (ObjC.available) {
try {
Interceptor.replace(
ObjC.classes.FreeraspReactNative['- talsecStart:withResolver:withRejecter:'].implementation,
new NativeCallback(function() {}, 'void', [])
);
} catch (error) {
console.log(error.message);
}
} else if (Java.available) {
Java.perform(function() {
try {
Interceptor.replace(
Java.use("com.freerasp.FreeraspNativeModule").talsecStart.implementation,
new NativeCallback(function() {}, 'void', [])
);
} catch (error) {
console.log(error.message);
}
});
} else {
console.log("[-] ObjC/Java Runtime unavailable");
}
