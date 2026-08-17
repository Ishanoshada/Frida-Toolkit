/************************************************************************
* Name: Android SSL Pinning Bypass 2
* OS: Android
* 
* Source: https:* Edited: https:************************************************************************/
setTimeout(function() {
Java.perform(function() {
var ArrayList = Java.use("java.util.ArrayList");
var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");
console.log("Running Android SSL Pinning Bypass...");
TrustManagerImpl.checkTrustedRecursive.implementation = function(a, b, c, d, e, f) {
return ArrayList.$new();
};
});
}, 0);
