Java.perform(function () {
var OkHttpClient = Java.use("com.squareup.okhttp.OkHttpClient");
OkHttpClient.setCertificatePinner.implementation = function(certificatePinner){
console.log("Called!");
return this;
};
var CertificatePinner = Java.use("com.squareup.okhttp.CertificatePinner");
CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(p0, p1){
console.log("Called! [Certificate]");
return;
};
CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(p0, p1){
console.log("Called! [List]");
return;
};
});
