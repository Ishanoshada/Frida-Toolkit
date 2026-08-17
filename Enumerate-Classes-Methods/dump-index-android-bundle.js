/**
* 
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of
* this software and associated documentation files (the "Software"), to deal in
* the Software without restriction, including without limitation the rights to
* use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
* the Software, and to permit persons to whom the Software is furnished to do so,
* subject to the following conditions:
*
* The above 
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
* FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
* 
* IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
* SPDX-License-Identifier: MIT
*/
/**
* 
* Dump encrypted index.android.bundle at runtime
* 
*/
let do_dlopen = null;
Process.enumerateModules().forEach(function(module) {
module.enumerateSymbols().forEach(function(symbol) {
if (symbol.name.includes("do_dlopen")) {
do_dlopen = symbol.address;
}
});
});
Java.perform(function() {
hookLibs();
})
let index_android_bundle_length = 0;
let libs = {};
let libHooks = {
"libreactnativejni.so": {
"hook": hookLibrnjni,
"hooked": false,
},
"libandroid.so": {
"hook": hookLibandroid,
"hooked": false,
}
};
function hookLibrnjni(lib_base) {
console.log("[*] Installing hook for libreactnativejni.so @ " + lib_base);
Interceptor.attach(get_addr("libreactnativejni.so", "_ZN8facebook5react22isHermesBytecodeBundleERKNS0_12BundleHeaderE"), {
onEnter: function(args) {
console.log("[*] isHermesBytecodeBundle called");
console.log("[*] bundle size: " + index_android_bundle_length);
var timestamp = Date.now();
let bundle = args[0].readByteArray(index_android_bundle_length);
const filename = `/sdcard/Download/index.android.bundle_${timestamp}`;
console.log(`[*] Writing bundle to ${filename}`)
const f = new File(filename, 'wb');
f.write(bundle);
f.close();
console.log(`[*] Successfully wrote bundle to ${filename}`);
},
onLeave: function(retval) {
return retval;
}
});
}
function hookLibandroid(lib_base) {
console.log("[*] Installing hook for libandroid.so @ " + lib_base);
let aa_get_length = new NativeFunction(
get_addr("libandroid.so", "AAsset_getLength64"),
"pointer", ["pointer"],
);
Interceptor.attach(get_addr("libandroid.so", "AAssetManager_open"), {
onEnter: function(args) {
this.filename = args[1].readCString();
console.log("[*] AAssetManager_open " + this.filename);
},
onLeave: function(retval) {
if (!retval.compare(ptr(0))) {
return retval;
}
if (this.filename == "index.android.bundle") {
let aasset = retval;
let len = aa_get_length(aasset);
index_android_bundle_length = parseInt(len.toString(), 16);
}
return retval;
}
});
}
function hookLibs() {
Interceptor.attach(do_dlopen, {
onEnter: function(args) {
this.is_null = false;
this.libname = args[0].readCString();
if (this.libname !== null) {
this.libname = this.libname.split("/").reverse()[0];
} else {
this.is_null = true;
return;
}
},
onLeave: function(retval) {
if (this.is_null) {
return retval;
}
if (this.libname in libHooks) {
let lib = Process.findModuleByName(this.libname);
let libh = libHooks[this.libname];
if (!libh.hooked) {
libh.hook(lib.base);
libh.hooked = true;
}
}
return retval;
}
});
}
function get_addr(libname, sym) {
return Module.getExportByName(libname, sym);
}
