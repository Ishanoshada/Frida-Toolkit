setTimeout(function() {
Java.perform(function() {
console.log("");
console.log("[.] Debug check bypass");
var Debug = Java.use('android.os.Debug');
Debug.isDebuggerConnected.implementation = function() {
return false;
}
});
}, 0);
