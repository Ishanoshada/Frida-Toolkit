Java.perform(function() {
Java.use('android.os.Build').PRODUCT.value = "gracerltexx";
Java.use('android.os.Build').MANUFACTURER.value = "samsung";
Java.use('android.os.Build').BRAND.value = "samsung";
Java.use('android.os.Build').DEVICE.value = "gracerlte";
Java.use('android.os.Build').MODEL.value = "SM-N935F";
Java.use('android.os.Build').HARDWARE.value = "samsungexynos8890";
Java.use('android.os.Build').FINGERPRINT.value = "samsung/gracerltexx/gracerlte:8.0.0/R16NW/N935FXXS4BRK2:user/release-keys";
try {
Java.use('java.io.File').exists.implementation = function() {
var name = Java.use('java.io.File').getName.call(this);
var catched = (["qemud","qemu_pipe", "drivers", "cpuinfo"].indexOf(name) > -1);
if (catched) {
console.log("the pipe " + name +" existence is hooked");
return false;
}else{
return this.exists.call(this);
}
}
} catch (err) {
console.log('[-] java.io.File.exists never called [-]');
}
try{
Java.use("android.app.ApplicationPackageManager").getPackageInfo.overload('java.lang.String', 'int').implementation = function(name, flag) {
var catched = (["com.example.android.apis","com.android.development"].indexOf(name) > -1);
if (catched) {
console.log("the package " + name +" is renamed with fake name");
name = "fake.package.name";
}
return this.getPackageInfo.call(this, name, flag);
}
} catch (err) {
console.log('[-] ApplicationPackageManager.getPackageInfo never called [-]');
}
try {
Interceptor.attach(Module.findExportByName(null, 'android_getCpuFamily'), {
onLeave: function(retval) {
if([2,5].indexOf(retval) > -1){
retval.replace(4);
}
}
});
} catch (err) {
console.log('[-] android_getCpuFamily never called [-]');
}
});
