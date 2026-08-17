Java.perform(function() {
let Pin_a = Java.use("okhttp3.CertificatePinner$Pin");
Pin_a["a"].overload('java.lang.String').implementation = function(hostname) {
let result = this["a"](hostname);
return false;
};
let CertificatePinner = Java.use("okhttp3.CertificatePinner");
CertificatePinner["equals"].implementation = function(obj) {
let result = this["equals"](obj);
return true;
};
});
