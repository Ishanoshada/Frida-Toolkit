Java.perform(function() {
var Storage = Java.use("android.os.storage.StorageManager");
Storage.isEncrypted.overload()
.implementation = function() {
console.warn("isEncrypted:", this.isEncrypted());
return true;
}
})
