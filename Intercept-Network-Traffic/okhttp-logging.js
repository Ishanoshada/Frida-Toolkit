/*  Log all http/https requests and responses of okhttp
by bsxp
GitHub: https:    
Source: https:    
This script will add HttpLoggingInterceptor at OkHttpClient, so
the HttpLoggingInterceptor will print all requests and responses.
This strategy does not matter if you are doing TLS Pinning bypass m
Run with:
frida -U -f [APP_ID] -l okhttp-logging.js --no-pause
or
frida --codeshare bsxp/okhttp-logging -U -f [APP_ID] --no-pause
*/
setTimeout(function() { 
Java.perform(() => {
console.log('');
console.log('======');
console.log('[#] Android OKHttp logging by bsxp [#]');
console.log('======');
function getInterceptor() {
try {
const HttpLoggingInterceptor = Java.use('okhttp3.logging.HttpLoggingInterceptor');
const Level = Java.use('okhttp3.logging.HttpLoggingInterceptor$Level');
const MyLogger = Java.registerClass({
name: 'MyLogger',
superClass: Java.use('java.lang.Object'),
implements: [Java.use('okhttp3.logging.HttpLoggingInterceptor$Logger')],
methods: {
log: [{
returnType: 'void',
argumentTypes: ['java.lang.String'],
implementation: function(message) {
console.log('    [LOG] ' + message);
}
}]
},
});
var logInstance = HttpLoggingInterceptor.$new(MyLogger.$new());
logInstance.setLevel(Level.BODY.value);
return logInstance;
} catch (err) {
console.log("[-] Error creating interceptor")
console.log(err);
console.log(err.stack)
return null;
}
}
try {
var Builder = Java.use('okhttp3.OkHttpClient$Builder')
var build = Builder.build.overload();
build.implementation = function() {
console.log('[+] OkHttpClient$Builder ==> Adding log interceptor')
try {
this.addInterceptor(getInterceptor());
} catch (err) {
console.log('[-] OkHttpClient$Builder.addInterceptor error');
}
return build.call(this);
}
} catch (err) {
console.log('[-] OkHttpClient$Builder error');
console.log(err);
}
});
}, 1000);
