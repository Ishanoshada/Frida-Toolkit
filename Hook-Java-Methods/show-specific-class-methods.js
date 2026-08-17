/* Description: Show specific class and method
* Mode: S+A
* Version: 1.0
* 
*/
Java.perform(function() {
var class_name = "android.security.keystore.KeyGenParameterSpec$Builder";
var db1 = Java.use(class_name);
var methodArr = db1.class.getMethods();
console.log("[*] Class Name: " + class_name)
console.log("[*] Method Names:")
for(var m in methodArr)
{
console.log(methodArr[m]);
}
});
