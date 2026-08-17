Java.perform(function () {
var cls = Java.use("o.applyHelperParams$cancelAll");
var overload = cls['_$$a'].overload('android.content.Context', 'long', 'long');
var orig = overload.implementation;
overload.implementation = function (context, j1, j2) {
console.log("[HOOK] _$$a called - context:", context, "j1:", j1, "j2:", j2);
};
console.log("[+] Hook installed for _$$a");
});
