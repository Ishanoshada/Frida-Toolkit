/* 
libcurl proxy enabler v0.1
Github: https:    
frida -n SomeApp.exe -l index.js
*/
var curl_easy_setopt = Module.findExportByName("libcurl.dll", "curl_easy_setopt");
console.log(curl_easy_setopt);
var curl_easy_perform = Module.findExportByName("libcurl.dll", "curl_easy_perform");
console.log(curl_easy_perform);
const PROXY_ADDRESS = 'https:const CURLOPT_PROXY = 10004
Interceptor.attach(curl_easy_perform, {
onEnter: function(args) {
console.log('curl_easy_perform: ');
console.log('arg0: ' + args[0].toString());
var curl_easy_setoptCall = new NativeFunction(
curl_easy_setopt, 'int', ['pointer', 'uint32', 'uint32']
);
const proxyAddr = Memory.allocAnsiString(PROXY_ADDRESS);
var result = curl_easy_setoptCall(
args[0], CURLOPT_PROXY, proxyAddr.toInt32()
);
console.log('result : ' + result.toString());
console.log('');
}
})
