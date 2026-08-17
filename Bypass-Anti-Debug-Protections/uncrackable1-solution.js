Java.perform(function() {
var MainActivity = Java.use('sg.vantagepoint.uncrackable1.MainActivity');
MainActivity.a.implementation = function(str) {
console.log('[Root Bypass] Root detection bypassed.');
return;
};
MainActivity.onCreate.overload('android.os.Bundle').implementation = function(bundle) {
console.log('[Debuggable Bypass] Debuggable check bypassed.');
this.onCreate(bundle);
return;
};
MainActivity.verify.overload('android.view.View').implementation = function(view) {
console.log('[Exit Bypass] Exit on button click bypassed.');
this.verify(view);
return;
};
});
