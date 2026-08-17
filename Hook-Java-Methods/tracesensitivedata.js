Java.perform(function() {
var Log = Java.use("android.util.Log");
var Throwable = Java.use("java.lang.Throwable");
function traceMethod(clazz, method) {
var targetClass = Java.use(clazz);
var overloadCount = targetClass[method].overloads.length;
console.log("Tracing " + clazz + "." + method + " (" + overloadCount + " overload(s))");
for (var i = 0; i < overloadCount; i++) {
targetClass[method].overloads[i].implementation = function() {
var args = [];
for (var j = 0; j < arguments.length; j++) {
args.push(arguments[j]);
}
console.log("[" + clazz + "." + method + "] called with arguments: " + args.join(", "));
console.log(Log.getStackTraceString(Throwable.$new()));
return this[method].apply(this, arguments);
};
}
}
traceMethod("android.content.SharedPreferences", "getString");
traceMethod("android.content.SharedPreferences", "getBoolean");
traceMethod("android.content.SharedPreferences", "getInt");
traceMethod("android.content.SharedPreferences", "getLong");
traceMethod("android.content.SharedPreferences", "getFloat");
traceMethod("android.content.SharedPreferences", "getStringSet");
traceMethod("android.telephony.SmsManager", "sendTextMessage");
traceMethod("android.telephony.SmsManager", "sendMultipartTextMessage");
traceMethod("android.telephony.SmsManager", "sendDataMessage");
traceMethod("java.net.URL", "openConnection");
traceMethod("java.net.HttpURLConnection", "setRequestMethod");
traceMethod("java.net.HttpURLConnection", "setRequestProperty");
traceMethod("java.net.HttpURLConnection", "getOutputStream");
traceMethod("java.net.HttpURLConnection", "getInputStream");
traceMethod("javax.crypto.Cipher", "doFinal");
traceMethod("javax.crypto.Cipher", "init");
traceMethod("android.content.ContentResolver", "query");
traceMethod("android.content.ContentResolver", "insert");
traceMethod("android.content.ContentResolver", "update");
traceMethod("android.content.ContentResolver", "delete");
console.log("Tracing setup completed.");
});
