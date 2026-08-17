/*
* Android okhttp3 Traffic Interceptor
* 
* Organization: XYSec Labs (Appknox)
* Description: Intercepts network traffic using Frida for specified target hosts, logging API calls and WebView URL loads.
* Supported Libraries: okhttp3
*/
setImmediate(function() {
console.log("[*] Waiting for Traffic");
console.warn("[*] Please Check Target Hosts section in the code, if u dont see requests");
Java.perform(function() {
var okhttp3 = Java.use('okhttp3.OkHttpClient');
var webViewClient = Java.use('android.webkit.WebViewClient');
var redColor = '\u001b[31m';
var greenColor = '\u001b[32m';
var resetColor = '\u001b[0m';
var targetHosts = [];
var originalNewCall = okhttp3.newCall.overload('okhttp3.Request');
originalNewCall.implementation = function(request) {
var requestUrl = request.url().toString();
var urlParts = requestUrl.split("/");
var extractedHost = urlParts[2];                                     
if (targetHosts.includes(extractedHost) || targetHosts.length === 0) {
var requestEndpoint = requestUrl.replace(/^(https?:\/\/[^\/]+)(\/.*)$/, '$2');
var requestHeaders = request.headers();
console.log(redColor + "[API Call]" + resetColor);
console.log("             ");
console.log(greenColor + request.method() + " " + requestEndpoint);
requestHeaders = requestHeaders.newBuilder()
.add("Host", extractedHost)
.build();
var requestHeaderNames = requestHeaders.names();
var requestHeaderNamesArray = requestHeaderNames.toArray();
for (var i = 0; i < requestHeaderNamesArray.length; i++) {
var headerName = requestHeaderNamesArray[i];
var headerValue = requestHeaders.get(headerName);
headerValue = decodeURIComponent(headerValue);                     console.log(greenColor + headerName + ": " + headerValue + resetColor);
}
console.log("             ");
console.log("             ");
console.log(greenColor + requestBodyToString(request.body()) + resetColor);
console.log(redColor + "============================" + resetColor);
var newRequest = request.newBuilder().headers(requestHeaders).build();
var response = this.newCall(newRequest).execute();
console.log(redColor + "[API Response]" + " - [" + requestEndpoint + "]" + resetColor);
console.log("             ");
console.log(greenColor + response.code() + " " + response.message() + resetColor);
var responseHeaders = response.headers();
var responseHeaderNames = responseHeaders.names();
var responseHeaderNamesArray = responseHeaderNames.toArray();
for (var i = 0; i < responseHeaderNamesArray.length; i++) {
var responseHeaderName = responseHeaderNamesArray[i];
var responseHeaderValue = responseHeaders.get(responseHeaderName);
console.log(greenColor + responseHeaderName + ": " + responseHeaderValue + resetColor);
}
console.log("             ");
var responseBody = response.body();
if (responseBody !== null) {
if (response.isSuccessful()) {
console.log(greenColor + responseBody.string() + resetColor + resetColor);
} else {
console.log(redColor + "Error: Response not successful" + resetColor);
}
} else {
console.log(greenColor + "Error: Empty response body" + resetColor);
}
console.log(redColor + "============================" + resetColor);
return this.newCall(request);
} else {
return this.newCall(request);
}
};
var shouldOverrideUrlLoading = webViewClient.shouldOverrideUrlLoading.overload('android.webkit.WebView', 'java.lang.String');
shouldOverrideUrlLoading.implementation = function(view, url) {
console.log(redColor + "[WebView URL]: " + url + resetColor);
return shouldOverrideUrlLoading.call(this, view, url);
};
});
});
function requestBodyToString(requestBody) {
if (requestBody === null) {
return '';
}
var buffer = Java.use('okio.Buffer').$new();
requestBody.writeTo(buffer);
return buffer.readUtf8();
}
