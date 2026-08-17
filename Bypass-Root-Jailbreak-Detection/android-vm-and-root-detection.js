Java.perform(function() {
var SystemProperties = Java.use('android.os.SystemProperties');
var Runtime = Java.use('java.lang.Runtime');
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
var File = Java.use('java.io.File');
var Build = Java.use('android.os.Build');
var BuildVersion = Java.use('android.os.Build$VERSION');
var PackageManager = Java.use('android.content.pm.PackageManager');
SystemProperties.get.overload('java.lang.String').implementation = function(name) {
console.log('[SystemProperties.get] Property: ' + name);
return this.get(name);     };
Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmdArray) {
console.log('[Runtime.exec] Command: ' + cmdArray);
return this.exec(cmdArray);     };
Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
console.log('[Runtime.exec] Command: ' + cmd);
return this.exec(cmd);     };
ProcessBuilder.start.overload().implementation = function() {
console.log('[ProcessBuilder.start] ProcessBuilder: ' + this.command().toString());
return this.start();     };
File.exists.implementation = function() {
var filePath = this.getPath();
console.log('[File.exists] File: ' + filePath);
return this.exists();     };
File.canRead.implementation = function() {
var filePath = this.getPath();
console.log('[File.canRead] File: ' + filePath);
return this.canRead();     };
File.canWrite.implementation = function() {
var filePath = this.getPath();
console.log('[File.canWrite] File: ' + filePath);
return this.canWrite();     };
console.log('[Build.MODEL] ' + Build.MODEL.value);
console.log('[Build.MANUFACTURER] ' + Build.MANUFACTURER.value);
console.log('[Build.BRAND] ' + Build.BRAND.value);
console.log('[Build.DEVICE] ' + Build.DEVICE.value);
console.log('[Build.PRODUCT] ' + Build.PRODUCT.value);
console.log('[Build.BOARD] ' + Build.BOARD.value);
console.log('[Build.HARDWARE] ' + Build.HARDWARE.value);
console.log('[Build.FINGERPRINT] ' + Build.FINGERPRINT.value);
console.log('[BuildVersion.SDK_INT] ' + BuildVersion.SDK_INT.value);
PackageManager.getInstalledPackages.overload('int').implementation = function(flags) {
console.log('[PackageManager.getInstalledPackages] Flags: ' + flags);
return this.getInstalledPackages(flags);     };
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(packageName, flags) {
console.log('[PackageManager.getPackageInfo] Package: ' + packageName + ', Flags: ' + flags);
return this.getPackageInfo(packageName, flags);     };
var SELinux = Java.use('android.os.SELinux');
SELinux.isSELinuxEnabled.implementation = function() {
console.log('[SELinux.isSELinuxEnabled] Called');
return this.isSELinuxEnabled();     };
SELinux.isSELinuxEnforced.implementation = function() {
console.log('[SELinux.isSELinuxEnforced] Called');
return this.isSELinuxEnforced();     };
});
