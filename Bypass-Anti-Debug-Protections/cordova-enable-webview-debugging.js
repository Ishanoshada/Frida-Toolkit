Java.perform(function() {
var Webview = Java.use("android.webkit.WebView")
Webview.loadUrl.overload("java.lang.String").implementation = function(url) {
console.log("\n[+]Loading URL from", url);
console.log("[+]Setting the value of setWebContentsDebuggingEnabled() to TRUE");
this.setWebContentsDebuggingEnabled(true);
this.loadUrl.overload("java.lang.String").call(this, url);
}
});
