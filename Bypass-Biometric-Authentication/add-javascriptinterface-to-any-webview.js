/* 
How the script works:  
- It registers a new `com.evil.WebAppInterface` class, which contains the functions to be exported (example `window.AndroidInterface.showToast`)
- It then hooks the Activity to obtain a valid `android.content.Context`
- It then hooks the `WebView.loadUrl` method, to add a context specific `com.evil.WebAppInterface` instance to `WebView.addJavascriptInterface`
- Lastly, it overrides the annotation checks (`isAnnotationPresent`) and instructs that all requested methods are allowed to be requested.
Example HTML for WebView
------------------------------------
<!DOCTYPE html>
<html>
<head>
<title>WebView Test</title>
</head>
<body>
<button onclick="showAndroidToast('Hello from JavaScript!')">Call Android Method</button>
<script type="text/javascript">
function showAndroidToast(message) {
if (window.AndroidInterface) {
window.AndroidInterface.showToast(message);
} else {
console.log("AndroidInterface is not available.");
}
}
</script>
</body>
</html>
------------------------------------
*/
Java.perform(() => {
const WebView = Java.use('android.webkit.WebView');    
const WebAppInterface = Java.registerClass({
name: 'com.evil.WebAppInterface',
fields: {
mContext: 'android.content.Context',
},
methods: {
$init: [{
argumentTypes: ['android.content.Context'],
implementation(context) {
console.log("[+] Initializing WebAppInterface in context:", context);
this.mContext.value = context;
}
}],
showToast: [{
returnType: 'void',
argumentTypes: ['java.lang.String'],
implementation(message) {
const Toast = Java.use('android.widget.Toast');
Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int')
.call(Toast, this.mContext.value, message.toString(), Toast.LENGTH_SHORT.value)
.show();
}
}]
}
});
const Activity = Java.use('android.app.Activity');
Activity.onCreate.overload('android.os.Bundle').implementation = function(savedInstanceState) {     
this.onCreate(savedInstanceState);
const context = this;
console.log('[+] Hooked context:', context);
const webappinterface = WebAppInterface.$new(context);
WebView.loadUrl.overload('java.lang.String').implementation = function (url) {
console.log('[+] Adding JavaScript interface to WebView', this, ' while navigating to:', url);
this.addJavascriptInterface(webappinterface, "AndroidInterface");             return this.loadUrl(url);
}
};
const Executable = Java.use('java.lang.reflect.Executable');
Executable.isAnnotationPresent.implementation = function (clazz) {
const name = clazz.getName();
const result = this.isAnnotationPresent(clazz);
if (name === "android.webkit.JavascriptInterface" && result === false) {
console.log("[+] Overriding annotation result to instruct the caller that the interface DOES exist");
return true;
}
return result;
}
});
