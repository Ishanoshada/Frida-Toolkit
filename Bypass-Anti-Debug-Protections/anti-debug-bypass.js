Java.perform(function() {
var Debug = Java.use('android.os.Debug');
console.log("\n");
Debug.isDebuggerConnected.implementation = function() {
return false;
}
});
