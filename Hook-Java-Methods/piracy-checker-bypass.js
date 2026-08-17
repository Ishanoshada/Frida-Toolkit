/*
Android piracy checker bypass
Bypass implemented based on https:*/
Java.perform(function() {
var PackageManager = Java.use("android.app.ApplicationPackageManager");
var loaded_classes = Java.enumerateLoadedClassesSync();
send("Loaded " + loaded_classes.length + " classes!");
PackageManager.getInstallerPackageName.implementation = function(pname) {
var original = this.getInstallerPackageName.call(this, pname);
send("Bypass INSTALLER check for package: " + original + " " + pname);
return 'com.android.vending';
};
});
