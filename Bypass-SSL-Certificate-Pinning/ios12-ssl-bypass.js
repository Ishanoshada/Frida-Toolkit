/* Description: iOS 12 SSL Bypass based on blog post https: *  
*/
var SSL_VERIFY_NONE = 0;
var ssl_ctx_set_custom_verify;
var ssl_get_psk_identity;
/* Create SSL_CTX_set_custom_verify NativeFunction 
*  Function signature https: */
ssl_ctx_set_custom_verify = new NativeFunction(
Module.findExportByName("libboringssl.dylib", "SSL_CTX_set_custom_verify"),
'void', ['pointer', 'int', 'pointer']
);
/* Create SSL_get_psk_identity NativeFunction 
* Function signature https: */
ssl_get_psk_identity = new NativeFunction(
Module.findExportByName("libboringssl.dylib", "SSL_get_psk_identity"),
'pointer', ['pointer']
);
function custom_verify_callback_that_does_not_validate(ssl, out_alert) {
return SSL_VERIFY_NONE;
}
var ssl_verify_result_t = new NativeCallback(function(ssl, out_alert) {
custom_verify_callback_that_does_not_validate(ssl, out_alert);
}, 'int', ['pointer', 'pointer']);
function bypassSSL() {
console.log("[+] Bypass successfully loaded ");
Interceptor.replace(ssl_ctx_set_custom_verify, new NativeCallback(function(ssl, mode, callback) {
ssl_ctx_set_custom_verify(ssl, mode, ssl_verify_result_t);
}, 'void', ['pointer', 'int', 'pointer']));
Interceptor.replace(ssl_get_psk_identity, new NativeCallback(function(ssl) {
return "notarealPSKidentity";
}, 'pointer', ['pointer']));
}
bypassSSL();
