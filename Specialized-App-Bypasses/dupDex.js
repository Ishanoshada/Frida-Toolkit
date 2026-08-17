/* Description: dupDex
* Mode: S+A
* Version: 1.0
* 
* 
*/
'use strict';
var moduleFuncName;
var m =  Module.enumerateExportsSync('libart.so');
m.forEach(function(m){
if(m.name.indexOf("OpenCommon") != -1){
moduleFuncName = m.name;
console.log("module function name: "+ m.name);
}else if(m.name.indexOf("OpenMemory") != -1){
moduleFuncName = m.name;
console.log("module function name: "+ m.name);
};
});
if(moduleFuncName != null){
console.log("=========================================");
console.log("Hook Start");
var OpenCommon = Module.findExportByName("libart.so",moduleFuncName);
if(OpenCommon != undefined){
Interceptor.attach(OpenCommon,{
onEnter: function(args){
console.log("base: "+ args[1]);
console.log("size: "+ args[2].toInt32());
console.log(hexdump(
args[1],{
offset: 0,
length: 64,
header: true,
ansi: true
}
));
var begin = args[1];
console.log("magic : " + Memory.readUtf8String(begin))
var address = parseInt(begin,16) + 0x20;
var dex_size = Memory.readInt(ptr(address));
console.log("dex_size :" + dex_size);
var file = new File("/data/data/com.jjwxc.reader/" + dex_size + ".dex", "wb");
file.write(Memory.readByteArray(begin, dex_size));
file.flush();
file.close();
},
onLeave: function(retval){
console.log("Finished!!!");
console.log("=========================================");
}
});
}else{
console.log("Null Point!!!");
}
}else{
console.log("Function not exist!\n");
}
