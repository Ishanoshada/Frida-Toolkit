function hook_okhttp3() {
Java.perform(function () {
var ByteString = Java.use("com.android.okhttp.okio.ByteString");
var Buffer = Java.use("com.android.okhttp.okio.Buffer");
var Interceptor = Java.use("okhttp3.Interceptor");
var ArrayList = Java.use("java.util.ArrayList");
var OkHttpClient = Java.use("okhttp3.OkHttpClient");
console.log("hook_okhttp3...");
});
}
hook_okhttp3();
