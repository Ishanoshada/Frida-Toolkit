Java.perform(function() {
var Root = Java.use("de.cyberkatze.iroot.IRoot");
var PluginResult = Java.use("org.apache.cordova.PluginResult");
var Status = Java.use("org.apache.cordova.PluginResult$Status");
function createResult(status, message) {
var statusCode = Java.cast(Status[status].value, Status);
return PluginResult.$new(statusCode, message);
}
function hookAndReturnValue(methodName) {
Root[methodName].overload('org.json.JSONArray', 'org.apache.cordova.CallbackContext').implementation = function(var1, var2) {
return createResult("OK", false);
};
}
hookAndReturnValue('checkIsRooted');
hookAndReturnValue('checkIsRootedWithBusyBox');
hookAndReturnValue('checkIsRootedWithEmulator');
hookAndReturnValue('checkIsRootedWithBusyBoxWithEmulator');
Root.isEmulator.implementation = function() {
return true;     };
Root.hasBusyBox.implementation = function() {
return true;     };
Root.logInfo.overload('java.lang.String').implementation = function(message) {
console.log("[Info] " + message);
};
});
