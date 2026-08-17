Java.perform(function () {
var WebView = Java.use('android.webkit.WebView');
WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
console.log("Loading URL: " + url);
return this.loadUrl(url);
};
WebView.loadUrl.overload('java.lang.String', 'java.util.Map').implementation = function (url, additionalHttpHeaders) {
console.log("Loading URL with headers: " + url);
return this.loadUrl(url, additionalHttpHeaders);
};
});
