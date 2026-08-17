/*
Updated by : Screamy
Original 
* */
setImmediate(function() {
Java.perform(function() {
var ContextImpl = Java.use("android.app.ContextImpl");
ContextImpl.checkSelfPermission.overload('java.lang.String').implementation = function(permission) {
console.log("[*] ContextImpl.checkSelfPermission called with permission: " + permission);
return this.checkSelfPermission(permission);
};
var ContextCompat = Java.use("androidx.core.content.ContextCompat");
ContextCompat.checkSelfPermission.overload('android.content.Context', 'java.lang.String').implementation = function(context, permission) {
console.log("[*] ContextCompat.checkSelfPermission called with permission: " + permission);
return this.checkSelfPermission(context, permission);
};
var PermissionChecker = Java.use("androidx.core.content.PermissionChecker");
PermissionChecker.checkSelfPermission.overload('android.content.Context', 'java.lang.String').implementation = function(context, permission) {
console.log("[*] PermissionChecker.checkSelfPermission called with permission: " + permission);
return this.checkSelfPermission(context, permission);
};
var ActivityCompat = Java.use("androidx.core.app.ActivityCompat");
ActivityCompat.requestPermissions.overload('android.app.Activity', '[Ljava.lang.String;', 'int').implementation = function(activity, permissions, requestCode) {
console.log("[*] ActivityCompat.requestPermissions called. Permissions: " + permissions + ", Request Code: " + requestCode);
return this.requestPermissions(activity, permissions, requestCode);
};
});
});
