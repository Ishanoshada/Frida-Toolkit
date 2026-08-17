Java.perform(function () {
var RootPackages = [
"com.noshufou.android.su", "com.noshufou.android.su.elite", "eu.chainfire.supersu",
"com.koushikdutta.superuser", "com.thirdparty.superuser", "com.yellowes.su",
"com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license", "com.dimonvideo.luckypatcher",
"com.chelpus.lackypatch", "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro",
"com.devadvance.rootcloak", "com.devadvance.rootcloakplus", "de.robv.android.xposed.installer",
"com.saurik.substrate", "com.zachspong.temprootremovejb", "com.amphoras.hidemyroot",
"com.amphoras.hidemyrootadfree", "com.formyhm.hiderootPremium", "com.formyhm.hideroot",
"me.phh.superuser", "eu.chainfire.supersu.pro", "com.kingouser.com", "com.topjohnwu.magisk"
];
var RootBinaries = ["su", "busybox", "supersu", "Superuser.apk", "KingoUser.apk", "SuperSu.apk", "magisk"];
var PackageManager = Java.use("android.app.ApplicationPackageManager");
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function (pname, flags) {
if (RootPackages.indexOf(pname) > -1) {
console.log("[+] Bypassing root check for package: " + pname);
pname = "fake.package.name.to.bypass.root.check";
}
return this.getPackageInfo.call(this, pname, flags);
};
var NativeFile = Java.use("java.io.File");
NativeFile.exists.implementation = function () {
var name = NativeFile.getName.call(this);
if (RootBinaries.indexOf(name) > -1) {
console.log("[+] Bypassing binary check: " + name);
return false;         }
return this.exists.call(this);
};
var Runtime = Java.use("java.lang.Runtime");
var execOverloads = [
Runtime.exec.overload('[Ljava.lang.String;'),
Runtime.exec.overload('java.lang.String'),
Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;'),
Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;'),
Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File'),
Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;', 'java.io.File')
];
execOverloads.forEach(function (exec) {
exec.implementation = function () {
var cmd = arguments[0];
if (typeof cmd === "string" && (cmd.indexOf("su") !== -1 || cmd.indexOf("getprop") !== -1 || cmd.indexOf("mount") !== -1)) {
console.log("[+] Bypassing command: " + cmd);
return Runtime.getRuntime().exec("echo 'fake command output'");
} else if (Array.isArray(cmd)) {
for (var i = 0; i < cmd.length; i++) {
if (cmd[i].indexOf("su") !== -1 || cmd[i].indexOf("getprop") !== -1 || cmd[i].indexOf("mount") !== -1) {
console.log("[+] Bypassing command: " + cmd[i]);
return Runtime.getRuntime().exec("echo 'fake command output'");
}
}
}
return exec.apply(this, arguments);
};
});
var SystemProperties = Java.use("android.os.SystemProperties");
var RootProperties
