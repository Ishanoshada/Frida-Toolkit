Java.perform(function() {
var SSLContext = Java.use("javax.net.ssl.SSLContext");
var TrustManager = Java.use("javax.net.ssl.TrustManager");
var SSLSocketFactory = Java.use("javax.net.ssl.SSLSocketFactory");
var HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
function logOperation(message) {
console.log("[SSL Bypass] " + message);
}
if (!SSLContext || !TrustManager || !SSLSocketFactory || !HttpsURLConnection) {
console.error("[SSL Bypass] One or more required classes are not available.");
return;
}
logOperation("All required classes are loaded successfully.");
var trustAllCerts = [
TrustManager.$new({
checkClientTrusted: function(chain, authType) {
logOperation("Bypassing client certificate validation.");
},
checkServerTrusted: function(chain, authType) {
logOperation("Bypassing server certificate validation.");
},
getAcceptedIssuers: function() {
logOperation("Returning no accepted issuers.");
return null;             }
})
];
try {
var originalDefault = SSLContext.getInstance("TLS");
logOperation("Obtained SSLContext instance for TLS.");
originalDefault.init(null, trustAllCerts, null);
SSLContext.setDefault(originalDefault);
logOperation("Custom SSLContext set as default.");
var customSocketFactory = SSLSocketFactory.newInstance(originalDefault);
HttpsURLConnection.setDefaultSSLSocketFactory(customSocketFactory);
logOperation("Custom SSLSocketFactory applied successfully.");
} catch (error) {
console.error("[SSL Bypass] Error applying custom SSL configuration:", error);
}
});
