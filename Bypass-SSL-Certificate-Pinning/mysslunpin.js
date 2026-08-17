/* 
Android SSL Re-pinning frida script v0.2 030417-pier 
$ adb push burpca-cert-der.crt /data/local/tmp/cert-der.crt
$ frida -U -f it.app.mobile -l frida-android-repinning.js --no-pause
https:   
UPDATE 20191605: Fixed undeclared var. Thanks to @oleavr and @ehsanpc9999 !
*/
setTimeout(function(){
Java.perform(function (){
console.log("");
console.log("[.] Cert Pinning Bypass/Re-Pinning");
var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
var FileInputStream = Java.use("java.io.FileInputStream");
var BufferedInputStream = Java.use("java.io.BufferedInputStream");
var InputStream = Java.use("java.io.InputStream");
var URL = Java.use("java.net.URL");
var X509Certificate = Java.use("java.security.cert.X509Certificate");
var KeyStore = Java.use("java.security.KeyStore");
var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
var SSLContext = Java.use("javax.net.ssl.SSLContext");
console.log("[+] Loading our CA...")
var cf = CertificateFactory.getInstance("X.509");
var httpUrl = URL.$new("http:     
var bufferedInputStream = BufferedInputStream.$new(httpUrl.openStream());
var ca = cf.generateCertificate(bufferedInputStream);
bufferedInputStream.close();
var certInfo = Java.cast(ca, X509Certificate);
console.log("[o] Our CA Info: " + certInfo.getSubjectDN());
console.log("[+] Creating a KeyStore for our CA...");
var keyStoreType = KeyStore.getDefaultType();
var keyStore = KeyStore.getInstance(keyStoreType);
keyStore.load(null, null);
keyStore.setCertificateEntry("ca", ca);
console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
tmf.init(keyStore);
console.log("[+] Our TrustManager is ready...");
console.log("[+] Hijacking SSLContext methods now...")
console.log("[-] Waiting for the app to invoke SSLContext.init()...")
SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a,b,c) {
console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
console.log("[+] SSLContext initialized with our custom TrustManager!");
}
});
},0);
