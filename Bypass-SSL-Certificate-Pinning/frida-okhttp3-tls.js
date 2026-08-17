Java.perform(function () {
const OkHttpClient = Java.use("okhttp3.OkHttpClient");
const originalNewCall = OkHttpClient.newCall.overload("okhttp3.Request");
OkHttpClient.newCall.overload("okhttp3.Request").implementation = function (
request
) {
const url = request.url();
console.log("[Intercepted] URL:", url.toString());
const redirect = "https:
const builder = request.newBuilder();
const redirected = builder.url(redirect).build();
const call = originalNewCall.call(this, redirected);
const response = call.execute();
const body = response.body().string();
console.log(`[Redirected] TLS Fingerprint for ${url.toString()}:`);
console.log(body);
return originalNewCall.call(this, request);
};
});
