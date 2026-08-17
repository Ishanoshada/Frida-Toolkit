Java.perform(function() {
var rootBeerNative = Java.use("com.scottyab.rootbeer.RootBeerNative");
rootBeerNative.checkForRoot.implementation = function(objArr) {
return 0
}
})
