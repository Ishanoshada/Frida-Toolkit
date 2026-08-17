Java.perform(function() {
var remoteConfigClass = Java.use("io.invertase.firebase.config.UniversalFirebaseConfigModule");
remoteConfigClass.getAllValuesForApp.implementation = function(appName) {
var result = this.getAllValuesForApp(appName);
var HashMapNode = Java.use('java.util.HashMap$Node');
var iterator = result.entrySet().iterator();
var count = 1;
while (iterator.hasNext()) {
var entry = Java.cast(iterator.next(), HashMapNode);
console.log("Entry: " + count++);
console.log(entry.getKey());
console.log(entry.getValue());
console.log("\n ____________ \n")
}
return result;
}
})
