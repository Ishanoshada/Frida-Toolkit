/* Description: Hook method of class
* Mode: S+A
* Version: 1.0
* 
*/
Java.perform(function() {
var class_name = Java.use("android.security.keystore.KeyGenParameterSpec$Builder");
class_name.FUNC_NAME_HERE.implementation = function (arg1) {
console.log("[*] CLASS_NAME:FUNC_NAME was called");
return this.FUNC_NAME_HERE(arg1)
}
});
