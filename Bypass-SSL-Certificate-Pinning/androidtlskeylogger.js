/* 
AndroidTLSKeylogger hooks common SSL libraries on Android to extract the TLS key material to the terminal
If this project is not working try to use friTap: https:
*/
const TARGET_LIBS = [
"libssl.so",
"libconscrypt_gmscore_jni.so",
"libconscrypt_jni.so"
];
const BORING_TARGET_LIBS = [
"libwarp_mobile.so",
"libcronet.so",
"libssl.so",
"libflutter.so"
];
const SSL3_RANDOM_SIZE = 32; const SSL_MAX_MD_SIZE = 48;  var session_client_random = "";
function get_key_from_ptr(key_ptr){
const MAX_KEY_LENGTH = 64;
const RANDOM_KEY_LENGTH = 32;
if (!key_ptr.isNull()) {
let KEY_LENGTH = 0;
let calculatedKeyLength = 0;
while (calculatedKeyLength < MAX_KEY_LENGTH) {
const byte = key_ptr.add(calculatedKeyLength).readU8(); 
if (byte === 0) {                     if(calculatedKeyLength < 20){
calculatedKeyLength++;
continue;
}
break;
}
calculatedKeyLength++;
}
if (calculatedKeyLength > 24 && calculatedKeyLength <= 46) {
KEY_LENGTH = 32;             } else if (calculatedKeyLength >= 47 && calculatedKeyLength <=49) {
KEY_LENGTH = 48;             }else{
KEY_LENGTH = 32;             }
const keyData = key_ptr.readByteArray(KEY_LENGTH);         
const hexKey = Array
.from(new Uint8Array(keyData))             .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())             .join(''); 
return hexKey;
}
return "";
}
function get_client_random(s3_ptr,SSL3_RANDOM_SIZE) {
if (!s3_ptr.isNull()) {
var client_random_ptr = s3_ptr.add(0x30);
var client_random = client_random_ptr.readByteArray(SSL3_RANDOM_SIZE);
const hexClientRandom = Array
.from(new Uint8Array(client_random))
.map(byte => byte.toString(16).padStart(2, '0').toUpperCase())             .join(''); 
return hexClientRandom;
} else {
console.log("[Error] s3 pointer is NULL");
}
}
function get_client_random_from_ssl_struct(ssl_st_ptr){
/* 
https:
struct ssl_st {
explicit ssl_st(SSL_CTX *ctx_arg);
ssl_st(const ssl_st &) = delete;
ssl_st &operator=(const ssl_st &) = delete;
~ssl_st();
const bssl::SSL_PROTOCOL_METHOD *method = nullptr;
bssl::UniquePtr<bssl::SSL_CONFIG> config;
uint16_t version = 0;
uint16_t max_send_fragment = 0;
bssl::UniquePtr<BIO> rbio;        bssl::UniquePtr<BIO> wbio;  
bssl::ssl_hs_wait_t (*do_handshake)(bssl::SSL_HANDSHAKE *hs) = nullptr;
bssl::SSL3_STATE *s3 = nullptr;   
https:
struct SSL3_STATE {
static constexpr bool kAllowUniquePtr = true;
SSL3_STATE();
~SSL3_STATE();
uint64_t read_sequence = 0;
uint64_t write_sequence = 0;
uint8_t server_random[SSL3_RANDOM_SIZE] = {0};
uint8_t client_random[SSL3_RANDOM_SIZE] = {0};
*/
var arch = Process.arch;
var offset_s3 = 0x30;
if (arch === 'x64' || arch === 'arm64') {
offset_s3 = 0x30;      } else if (arch === 'x86' || arch === 'arm') {
offset_s3 = 0x2C;      }
var s3_ptr = ssl_st_ptr.add(offset_s3).readPointer();
return get_client_random(s3_ptr,SSL3_RANDOM_SIZE);
}
function get_ssl_ptr_from_handshake(hs_ptr) {
var hs = hs_ptr;      var ssl_ptr = hs.add(0x8).readPointer();  
return ssl_ptr;
}
function dump_keys(label, identifier,key) {
const KEY_LENGTH = 32;     var labelStr = "";
var client_random = "";
var secret_key = "";
if (!label.isNull()) {
labelStr = label.readCString();             } else {
console.log("[Error] Argument 'label' is NULL");
}
if (!identifier.isNull()) {
console.log("SSL_Struct_pointer (working): ",identifier);
client_random = get_client_random_from_ssl_struct(identifier)
} else {
console.log("[Error] Argument 'identifier' is NULL");
}
if (!key.isNull()) {
secret_key = get_key_from_ptr(key);
} else {
console.log("[Error] Argument 'key' is NULL");
}
console.log(labelStr+" "+client_random+" "+secret_key);
}
/*
Currently only tested on ARM64
*/
function hook_ssl_log_secret(module_name){
const cronetModule = Process.findModuleByName(module_name);
let symbols = Process.getModuleByName(module_name).enumerateSymbols().filter(exports => exports.name.toLowerCase().includes("ssl_log"));
if(symbols.length > 0){
console.log("Installed ssl_log_secret() hooks using sybmols.");
try{
Interceptor.attach(symbols[0].address, {
onEnter: function(args) {
dump_keys(args[1], args[0], args[2]);
}
});
}catch(e){
}
}
}
function hookLibrary(libname) {
try {
let sslCtxNewPtr = Process.getModuleByName(libname).getExportByName("SSL_CTX_new");
if (sslCtxNewPtr) {
console.log("[*] Found SSL_CTX_new in " + libname + " at " + sslCtxNewPtr);
Interceptor.attach(sslCtxNewPtr, {
onEnter: function (args) {
console.log("[*] SSL_CTX_new called in " + libname);
},
onLeave: function (retval) {
console.log("[*] SSL_CTX_new returned: " + retval);
let keylog_callback = new NativeCallback(function (ctx, line) {
let logLine = line.readCString();
console.log("[*] KEYLOG: " + logLine);
}, 'void', ['pointer', 'pointer']);
let setKeylogPtr = Process.getModuleByName(libname).getExportByName("SSL_CTX_set_keylog_callback");
if (setKeylogPtr) {
console.log("[*] Found SSL_CTX_set_keylog_callback in " + libname + " at " + setKeylogPtr);
let setKeylog = new NativeFunction(setKeylogPtr, 'void', ['pointer', 'pointer']);
setKeylog(retval, keylog_callback);
console.log("[*] Installed keylog callback in " + libname);
} else {
console.log("[!] Could not find SSL_CTX_set_keylog_callback in " + libname);
}
}
});
} else {
console.log("[!] SSL_CTX_new not found in " + libname);
}
} catch (e) {
console.error("[!] Error hooking " + libname + ": " + e);
}
}
function hookDlopen() {
const DLOPEN_FUNCS = ["dlopen", "android_dlopen_ext"];
DLOPEN_FUNCS.forEach(function(name) {
let addr = Module.getGlobalExportByName(name);
if (addr) {
console.log("[*] Hooking " + name + " at " + addr);
Interceptor.attach(addr, {
onEnter: function(args) {
this.libName = args[0].readCString();
},
onLeave: function(retval) {
if (this.libName) {
TARGET_LIBS.forEach(function(target) {
if (this.libName.indexOf(target) >= 0) {
console.log("[*] Detected target library load: " + this.libName);
hookLibrary(target);
}
}.bind(this)); 
BORING_TARGET_LIBS.forEach(function(target) {
if (this.libName.indexOf(target) >= 0) {
console.log("[*] Detected target library load: " + this.libName);
hook_ssl_log_secret(target);
}
}.bind(this));
}
}
});
} else {
console.log("[!] Could not find export for " + name);
}
});
}
TARGET_LIBS.forEach(function(lib) {
if (Module.findBaseAddress(lib) !== null) {
console.log("[*] " + lib + " is already loaded. Installing hooks.");
hookLibrary(lib);
}
});
BORING_TARGET_LIBS.forEach(function(lib) {
if (Module.findBaseAddress(lib) !== null) {
console.log("[*] " + lib + " is already loaded. Installing hooks.");
hook_ssl_log_secret(lib);
}
});
hookDlopen();
ger
