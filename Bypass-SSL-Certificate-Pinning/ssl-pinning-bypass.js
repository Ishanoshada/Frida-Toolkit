Java.perform(function () {
var TrustManager = Java.use('javax.net.ssl.X509TrustManager');
var MyTrustManager = Java.registerClass({
name: 'com.example.MyTrustManager',         implements: [TrustManager],
methods: {
checkClientTrusted: function (chain, authType) {
console.log("checkClientTrusted called!");
/*
for (var i = 0; i < chain.length; i++) {
var cert = chain[i];
}
*/
return;             },
checkServerTrusted: function (chain, authType) {
console.log("checkServerTrusted called!");
return;             },
getAcceptedIssuers: function () {
console.log("getAcceptedIssuers called!");
return [];             }
}
});
var SSLContext = Java.use('javax.net.ssl.SSLContext');
var TrustManagerArray = Java.use('[Ljavax.net.ssl.TrustManager;');
var MyTrustManagerInstance = MyTrustManager.$new();
var TrustManagers = TrustManagerArray.$new(1);
TrustManagers[0] = MyTrustManagerInstance;
var sslContext = SSLContext.getInstance('TLS');     sslContext.init(null, TrustManagers, null);
var HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
HttpsURLConnection.setDefaultSSLSocketFactory(sslContext.getSocketFactory());
console.log("SSL pinning bypass successful (INSECURE - for testing only)!");
});
