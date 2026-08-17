Java.perform(function() {
console.log("[*] Comprehensive SSL unpinning script started");
bypassOkHttp();
bypassTrustManager();
bypassSSLContext();
bypassHostnameVerifier();
bypassWebViewSSL();
bypassConscrypt();
hookSocketFunctions();
function bypassOkHttp() {
try {
const CertificatePinner = Java.use('okhttp3.CertificatePinner');
CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function() {
console.log('[+] OkHttp CertificatePinner.check() bypassed');
return;
};
CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function() {
console.log('[+] OkHttp CertificatePinner.check() [Certificate] bypassed');
return;
};
const Builder = Java.use('okhttp3.CertificatePinner$Builder');
Builder.add.overload('java.lang.String', 'java.util.List').implementation = function(str, list) {
console.log('[+] OkHttp CertificatePinner$Builder.add() bypassed');
return this;
};
console.log('[+] OkHttp pinning bypassed');
} catch (err) {
console.log('[-] OkHttp pinning not found');
}
}
function bypassTrustManager() {
try {
const TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
console.log('[+] TrustManagerImpl.verifyChain() bypassed');
return untrustedChain;
};
const X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
const SSLContext = Java.use('javax.net.ssl.SSLContext');
const TrustManager = Java.registerClass({
name: 'dev.adb.TrustManager',
implements: [X509TrustManager],
methods: {
checkClientTrusted: function(chain, authType) {},
checkServerTrusted: function(chain, authType) {},
getAcceptedIssuers: function() { return []; }
}
});
const TrustManagers = [TrustManager.$new()];
const SSLContextInit = SSLContext.init.overload(
'[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
);
SSLContextInit.implementation = function(keyManager, trustManager, secureRandom) {
console.log('[+] SSLContext.init() bypassed');
SSLContextInit.call(this, keyManager, TrustManagers, secureRandom);
};
console.log('[+] TrustManager pinning bypassed');
} catch (err) {
console.log('[-] TrustManager pinning bypass failed: ' + err);
}
}
function bypassSSLContext() {
try {
const TrustManager = Java.registerClass({
name: 'dev.adb.EmptyTrustManager',
implements: [Java.use('javax.net.ssl.X509TrustManager')],
methods: {
checkClientTrusted: function(chain, authType) {},
checkServerTrusted: function(chain, authType) {},
getAcceptedIssuers: function() { return []; }
}
});
const SSLContext = Java.use('javax.net.ssl.SSLContext');
const sslContext = SSLContext.getInstance('TLS');
const TrustManagers = [TrustManager.$new()];
sslContext.init(null, TrustManagers, null);
const HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
HttpsURLConnection.setDefaultSSLSocketFactory.implementation = function(ssf) {
console.log('[+] HttpsURLConnection.setDefaultSSLSocketFactory() bypassed');
HttpsURLConnection.setDefaultSSLSocketFactory.call(this, sslContext.getSocketFactory());
};
console.log('[+] SSLContext pinning bypassed');
} catch (err) {
console.log('[-] SSLContext pinning bypass failed: ' + err);
}
}
function bypassHostnameVerifier() {
try {
const HostnameVerifier = Java.use('javax.net.ssl.HostnameVerifier');
const SSLSession = Java.use('javax.net.ssl.SSLSession');
const AllowAllVerifier = Java.registerClass({
name: 'dev.adb.AllowAllVerifier',
implements: [HostnameVerifier],
methods: {
verify: function(hostname, session) {
console.log('[+] Allowing connection to host: ' + hostname);
return true;
}
}
});
const HttpsURLConnection = Java.use('javax.net.ssl.HttpsURLConnection');
HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
console.log('[+] HttpsURLConnection.setDefaultHostnameVerifier() bypassed');
HttpsURLConnection.setDefaultHostnameVerifier.call(this, AllowAllVerifier.$new());
};
HttpsURLConnection.setHostnameVerifier.implementation = function(hostnameVerifier) {
console.log('[+] HttpsURLConnection.setHostnameVerifier() bypassed');
HttpsURLConnection.setHostnameVerifier.call(this, AllowAllVerifier.$new());
};
console.log('[+] HostnameVerifier bypassed');
} catch (err) {
console.log('[-] HostnameVerifier bypass failed: ' + err);
}
}
function bypassWebViewSSL() {
try {
const WebView = Java.use('android.webkit.WebView');
const SslErrorHandler = Java.use('android.webkit.SslErrorHandler');
WebView.onReceivedSslError.overload('android.webkit.WebView', 'android.webkit.SslErrorHandler', 'android.net.http.SslError').implementation = function(webView, handler, error) {
console.log('[+] WebView.onReceivedSslError() bypassed');
handler.proceed();
};
console.log('[+] WebView SSL errors bypassed');
} catch (err) {
console.log('[-] WebView SSL bypass failed: ' + err);
}
}
function bypassConscrypt() {
try {
const Conscrypt = Java.use('com.android.org.conscrypt.ConscryptFileDescriptorSocket');
Conscrypt.verifyCertificateChain.implementation = function(certChain, authMethod) {
console.log('[+] Conscrypt verification bypassed');
};
console.log('[+] Conscrypt pinning bypassed');
} catch (err) {
console.log('[-] Conscrypt pinning not found');
}
}
function hookSocketFunctions() {
try {
const Socket = Java.use('java.net.Socket');
Socket.getOutputStream.implementation = function() {
const socket = this;
const host = socket.getInetAddress().getHostAddress();
const port = socket.getPort();
console.log(`[+] Socket connection: ${host}:${port}`);
const originalOutputStream = this.getOutputStream();
return wrapOutputStream(originalOutputStream, host, port);
};
Socket.getInputStream.implementation = function() {
const socket = this;
const host = socket.getInetAddress().getHostAddress();
const port = socket.getPort();
const originalInputStream = this.getInputStream();
return wrapInputStream(originalInputStream, host, port);
};
try {
const SSLSocket = Java.use('javax.net.ssl.SSLSocket');
SSLSocket.getInputStream.implementation = function() {
const socket = this;
const host = socket.getInetAddress().getHostAddress();
const port = socket.getPort();
console.log(`[+] SSL Socket connection: ${host}:${port}`);
const originalInputStream = this.getInputStream();
return wrapInputStream(originalInputStream, host, port);
};
SSLSocket.getOutputStream.implementation = function() {
const socket = this;
const host = socket.getInetAddress().getHostAddress();
const port = socket.getPort();
const originalOutputStream = this.getOutputStream();
return wrapOutputStream(originalOutputStream, host, port);
};
console.log('[+] SSLSocket hooks installed');
} catch (err) {
console.log('[-] Could not hook SSLSocket: ' + err);
}
console.log('[+] Socket hooks installed');
} catch (err) {
console.log('[-] Socket hooks failed: ' + err);
}
}
function wrapOutputStream(originalOutputStream, host, port) {
const OutputStream = Java.use('java.io.OutputStream');
const JavaByteArray = Java.use('[B');
const ProxyOutputStream = Java.registerClass({
name: 'dev.adb.ProxyOutputStream',
superClass: OutputStream,
fields: {
original: 'java.io.OutputStream',
host: 'java.lang.String',
port: 'int'
},
methods: {
'<init>': [{
returnType: 'void',
argumentTypes: ['java.io.OutputStream', 'java.lang.String', 'int'],
implementation: function(original, host, port) {
this.original.value = original;
this.host.value = host;
this.port.value = port;
}
}],
write: [{
returnType: 'void',
argumentTypes: ['[B'],
implementation: function(data) {
logOutboundTraffic(this.host.value, this.port.value, data);
this.original.value.write(data);
}
}, {
returnType: 'void',
argumentTypes: ['[B', 'int', 'int'],
implementation: function(data, offset, length) {
const subArray = Java.array('byte', Arrays.copyOfRange(data, offset, offset + length));
logOutboundTraffic(this.host.value, this.port.value, subArray);
this.original.value.write(data, offset, length);
}
}, {
returnType: 'void',
argumentTypes: ['int'],
implementation: function(byte) {
const data = Java.array('byte', [byte]);
logOutboundTraffic(this.host.value, this.port.value, data);
this.original.value.write(byte);
}
}],
close: {
returnType: 'void',
implementation: function() {
this.original.value.close();
}
},
flush: {
returnType: 'void',
implementation: function() {
this.original.value.flush();
}
}
}
});
const Arrays = Java.use('java.util.Arrays');
return ProxyOutputStream.$new(originalOutputStream, host, port);
}
function wrapInputStream(originalInputStream, host, port) {
const InputStream = Java.use('java.io.InputStream');
const JavaByteArray = Java.use('[B');
const ProxyInputStream = Java.registerClass({
name: 'dev.adb.ProxyInputStream',
superClass: InputStream,
fields: {
original: 'java.io.InputStream',
host: 'java.lang.String',
port: 'int'
},
methods: {
'<init>': [{
returnType: 'void',
argumentTypes: ['java.io.InputStream', 'java.lang.String', 'int'],
implementation: function(original, host, port) {
this.original.value = original;
this.host.value = host;
this.port.value = port;
}
}],
read: [{
returnType: 'int',
argumentTypes: [],
implementation: function() {
const byte = this.original.value.read();
if (byte !== -1) {
const data = Java.array('byte', [byte]);
logInboundTraffic(this.host.value, this.port.value, data);
}
return byte;
}
}, {
returnType: 'int',
argumentTypes: ['[B'],
implementation: function(data) {
const bytesRead = this.original.value.read(data);
if (bytesRead > 0) {
const Arrays = Java.use('java.util.Arrays');
const actualData = Arrays.copyOf(data, bytesRead);
logInboundTraffic(this.host.value, this.port.value, actualData);
}
return bytesRead;
}
}, {
returnType: 'int',
argumentTypes: ['[B', 'int', 'int'],
implementation: function(data, offset, length) {
const bytesRead = this.original.value.read(data, offset, length);
if (bytesRead > 0) {
const Arrays = Java.use('java.util.Arrays');
const actualData = Arrays.copyOfRange(data, offset, offset + bytesRead);
logInboundTraffic(this.host.value, this.port.value, actualData);
}
return bytesRead;
}
}],
close: {
returnType: 'void',
implementation: function() {
this.original.value.close();
}
},
available: {
returnType: 'int',
implementation: function() {
return this.original.value.available();
}
}
}
});
const Arrays = Java.use('java.util.Arrays');
return ProxyInputStream.$new(originalInputStream, host, port);
}
function logOutboundTraffic(host, port, data) {
try {
const buffer = Java.array('byte', data);
const dataString = bytesToString(buffer);
console.log(`\n[â†’] Outbound to ${host}:${port}:\n${dataString}\n`);
if (isHttpTraffic(dataString)) {
console.log("[HTTP Request Detected]");
formatHttpTraffic(dataString, "â†’");
}
} catch (err) {
console.log(`[-] Error logging outbound traffic: ${err}`);
}
}
function logInboundTraffic(host, port, data) {
try {
const buffer = Java.array('byte', data);
const dataString = bytesToString(buffer);
console.log(`\n[â†] Inbound from ${host}:${port}:\n${dataString}\n`);
if (isHttpTraffic(dataString)) {
console.log("[HTTP Response Detected]");
formatHttpTraffic(dataString, "â†");
}
} catch (err) {
console.log(`[-] Error logging inbound traffic: ${err}`);
}
}
function bytesToString(bytes) {
try {
const String = Java.use('java.lang.String');
return String.$new(bytes, 'UTF-8');
} catch (err) {
const hexBytes = [];
for (let i = 0; i < bytes.length; i++) {
const byte = bytes[i] & 0xff;
if (byte >= 32 && byte <= 126) {                     hexBytes.push(String.fromCharCode(byte));
} else {
hexBytes.push(`\\x${byte.toString(16).padStart(2, '0')}`);
}
}
return hexBytes.join('');
}
}
function isHttpTraffic(data) {
return /^(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH|CONNECT|TRACE)\s|HTTP\/[0-9.]+\s[0-9]+\s/.test(data);
}
function formatHttpTraffic(data, direction) {
try {
const lines = data.split('\n');
let formattedOutput = '';
if (direction === "â†’") {                                 const requestLine = lines[0].trim();
console.log(`HTTP Request: ${requestLine}`);
let i = 1;
console.log("\nHeaders:");
while (i < lines.length && lines[i].trim() !== '') {
console.log(`  ${lines[i].trim()}`);
i++;
}
if (i < lines.length - 1) {
console.log("\nBody:");
console.log(lines.slice(i + 1).join('\n'));
}
} else {                                 const statusLine = lines[0].trim();
console.log(`HTTP Response: ${statusLine}`);
let i = 1;
console.log("\nHeaders:");
while (i < lines.length && lines[i].trim() !== '') {
console.log(`  ${lines[i].trim()}`);
i++;
}
if (i < lines.length - 1) {
console.log("\nBody:");
console.log(lines.slice(i + 1).join('\n'));
try {
const bodyContent = lines.slice(i + 1).join('\n');
if (bodyContent.trim().startsWith('{') || bodyContent.trim().startsWith('[')) {
const jsonObj = JSON.parse(bodyContent);
console.log("\nFormatted JSON:");
console.log(JSON.stringify(jsonObj, null, 2));
}
} catch (e) {
}
}
}
} catch (err) {
console.log(`[-] Error formatting HTTP traffic: ${err}`);
}
}
});
