if (ObjC.available) {
var UIApplication = ObjC.classes.UIApplication;
function tryAttach(methodName, label) {
var m = UIApplication[methodName];
if (!m) {
console.log('[*] ' + methodName + ' not found on UIApplication');
return;
}
Interceptor.attach(m.implementation, {
onEnter: function(args) {
try {
if (args[2].isNull()) {
console.log(label + ' called with NULL url');
return;
}
var url = new ObjC.Object(args[2]);
var s = (typeof url.absoluteString === 'function') ? url.absoluteString().toString() : url.toString();
console.log(label + ' -> ' + s);
} catch (e) {
console.log(label + ' -> error reading url: ' + e);
}
}
});
console.log('[*] Attached to UIApplication ' + methodName);
}
tryAttach('- openURL:', '[openURL:]');
tryAttach('- openURL:options:completionHandler:', '[openURL:options:completionHandler:]');
} else {
console.log('Objective-C runtime is not available!');
}
