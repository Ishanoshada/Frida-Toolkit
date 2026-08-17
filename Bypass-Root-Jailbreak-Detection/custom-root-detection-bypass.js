console.log("Script loaded successfully ");
Java.perform(function x() {
console.log("Inside java perform log function");
var my_class2 = Java.use("com.ph1.retail.ph2.utils.phLog");
my_class2.printLog.implementation = function(x, y) {         console.log("Hooked printLog:" + x + "\n" + y)
};
});
Java.perform(function m() {
console.log("Inside java perform log function");
var my_class3 = Java.use("com.ph1.retail.ph2.phBank");
my_class3.showErrorDialog.overload('java.lang.String').implementation = function(m) {         console.log("Hooked showErrorDialog")
};
});
Java.perform(function r() {
console.log("Inside java perform isRootedDevice function");
var my_class7 = Java.use("com.ph1.retail.ph2.utils.UiUtils");
my_class7.isRootedDevice.implementation = function(r) {         console.log("Hooked isRootedDevice")
return Java.use("java.lang.Boolean").$new(false);
};
});
Java.perform(function z() {
console.log("Inside java perform function");
var my_class = Java.use("com.ph1.retail.ph2.phBank");
my_class.checkIfDeviceRooted.implementation = function(z) {         console.log("Hooked checkifDeviceRooted")
Java.choose("com.ph1.retail.ph2.phBank", {
onMatch: function(instance) {                 console.log("Found instance: " + instance);
console.log("Invoking showLoginPage: ");
instance.showLoginPage();
},
onComplete: function() {}
});
};
});
