ObjC.schedule(ObjC.mainQueue, function() {
var version = ObjC.classes.UIDevice.currentDevice()
.systemVersion()
.toString();
var mainVersion = parseInt(version.split(".")[0]);
var fname = "nw_tls_create_peer_trust";
if (mainVersion < 11) {
fname = "tls_helper_create_peer_trust";
}
var hookFunction = Module.findExportByName(null, fname);
Interceptor.attach(hookFunction, {
onLeave: function(retval) {
retval.replace(0);
},
});
});
pts QQGroup: 143824179 .
