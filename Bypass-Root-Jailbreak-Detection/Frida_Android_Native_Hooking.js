var TARGET_ADDRESS = Module.enumerateExports(LIB_SO);
var TARGET_ADDRESS = Module.getExportByName(LIB_SO, FUNC_NAME);
var TARGET_ADDRESS = Module.findExportByName(LIB_SO, FUNC_NAME);
var TARGET_ADDRESS = Module.enumerateImports(LIB_SO);
Interceptor.attach(TARGET_ADDRESS, 
{
onEnter: function (args) 
{
console.log('Entering function');
/*
MODIFY OR LOG ARGUMENTS
Read X argument as ASCII
var argX = Memory.readCString(args[X]);
Read X argument as UTF-8
var argX = Memory.readUtf8String(args[X]);
Read X argument as UTF-16
var argX = Memory.readUtf16String(args[X]);
Read X argument as ANSI
var argX = Memory.readAnsiString(args[X]);
*/
},
onLeave: function (retval) 
{
/*
MODIFY OR LOG RETURN VALUE
Replace int and hexadecimal values
----------------------------------
retval.replace(0x1);
retval.replace(1337);
Replace string values
---------------------
const dstAddr = Java.vm.getEnv().newStringUtf("NewString");
retval.replace(dstAddr);
*/
console.log('Leaving function');
}
});
