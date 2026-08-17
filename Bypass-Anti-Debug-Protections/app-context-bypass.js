if (Java.available) {
Java.perform(function() {
Java.scheduleOnMainThread(function() {
var WebView = Java.use("android.webkit.WebView");
WebView.setWebContentsDebuggingEnabled(true);
console.log(WebView);
console.log("[+] WebView debug enabled successfully!");
});
});
}
