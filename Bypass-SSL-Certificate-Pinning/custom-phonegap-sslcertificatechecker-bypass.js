Java.perform(function x() {
var SSLCertificateChecker = Java.use("nl.xservices.plugins.SSLCertificateChecker");
SSLCertificateChecker.execute.implementation = function(str, jSONArray, callbackContext) {
console.log('execute is called');
Java.choose("org.apache.cordova.CallbackContext", {
onMatch: function(instance) {                 console.log("Found instance: " + instance);
console.log("Sending success");
instance.success('CONNECTION_SECURE');
},
onComplete: function() {}
});
var ret = true
return ret;
};
});
