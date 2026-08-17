/*
iOS freeRASP React Native Bypass by rodolfomarianocy
frida -U -f <bundle_identifier> --codeshare rodolfomarianocy/ios-freerasp-react-native-bypass
https:    https:*/
console.warn("[+] iOS freeRASP React Native Bypass...")
if (ObjC.available) {
try {
Interceptor.replace(
ObjC.classes.FreeraspReactNative['- talsecStart:withResolver:withRejecter:'].implementation,
new NativeCallback(function() {}, 'void', [])
);
} catch (error) {
console.log(error.message);
}
} else {
console.log("[-] ObjC Runtime unavailable");
}
