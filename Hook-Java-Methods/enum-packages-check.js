Java.perform(function() {
console.log("\nFrida app running...");
var PackageManager = Java.use("android.app.ApplicationPackageManager");
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
console.log("[+] " + pname);
return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
};
});
