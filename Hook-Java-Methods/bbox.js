Java.perform(function() {
let HelperJNI = Java.use("cn.tongdun.android.shell.common.HelperJNI");
HelperJNI.base64encode.implementation = function(bArr){
let ret = this.base64encode(bArr);
console.log(JSON.stringify(bArr));
return ret;
}
});
