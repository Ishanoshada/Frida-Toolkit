Java.perform(function() {
console.log("[+] SPLASH ACTIVITY BYPASS - Starting");
var SplashActivity = Java.use("com.nayifat.mobile.SplashActivity");
SplashActivity.onCreate.implementation = function(savedInstanceState) {
console.log("[+] SplashActivity.onCreate bypassed");
this.onCreate.call(this, savedInstanceState);
setTimeout(function() {
Java.perform(function() {
try {
console.log("[+] Attempting to start main activity");
var Intent = Java.use("android.content.Intent");
var context = Java.cast(this, Java.use("android.content.Context"));
var mainIntent = Intent.$new(context, Java.use("com.nayifat.mobile.MainActivity").class);
context.startActivity(mainIntent);
} catch(e) {
console.log("[-] Failed to start main activity: " + e);
}
});
}.bind(this), 1000);
};
SplashActivity.onResume.implementation = function() {
console.log("[+] SplashActivity.onResume bypassed");
this.onResume.call(this);
};
var methods = SplashActivity.class.getDeclaredMethods();
for (var i = 0; i < methods.length; i++) {
var method = methods[i];
var methodName = method.getName();
if (methodName.includes("check") || 
methodName.includes("verify") ||
methodName.includes("validate") ||
methodName.includes("detect") ||
methodName.includes("inspect")) {
try {
SplashActivity[methodName].implementation = function() {
console.log("[+] Bypassed: " + methodName);
return true;                 };
} catch(e) {}
}
}
console.log("[+] Splash activity bypass installed");
});
Java.perform(function() {
Java.use("java.lang.System").exit.implementation = function() {
console.log("[!] BLOCKED: System.exit");
};
Java.use("android.os.Process").killProcess.implementation = function() {
console.log("[!] BLOCKED: killProcess");
};
});
