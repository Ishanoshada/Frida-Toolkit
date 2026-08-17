let nativeMethods = {"methods":[]}
let addrRegisterNatives = null
const OURLIB = "libEngineNative.so"                     
Process.enumerateModules().forEach(function (m) { 
Module.enumerateSymbolsSync(m.name).forEach(function (s) { 
if (s.name.includes("RegisterNatives") && (!s.name.includes("CheckJNI"))) { 
addrRegisterNatives = s.address
} 
}) 
})
Interceptor.attach(addrRegisterNatives, {
onEnter: function (args) {
var calledFromLibnOffset = String(DebugSymbol.fromAddress(this.returnAddress))
if(!calledFromLibnOffset.includes(OURLIB)){                 return
}
var nMethods = parseInt(args[3]);
var class_name = Java.vm.tryGetEnv().getClassName(args[1]);
var methods_ptr = ptr(args[2]);
for (var i = 0; i < nMethods; i++) {
var name_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize*3));
var methodName = Memory.readCString(name_ptr);
var sig_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize*3 + Process.pointerSize));
var sig = Memory.readCString(sig_ptr);
var fnPtr_ptr = Memory.readPointer(methods_ptr.add(i * Process.pointerSize*3 + Process.pointerSize*2));
var find_module = Process.findModuleByAddress(fnPtr_ptr);
var fnPtr_ptr_ghidra = ptr(fnPtr_ptr).sub(find_module.base).add(0x00100000)
nativeMethods["methods"].push(
{
ghidraOffset : fnPtr_ptr_ghidra,
methodName : class_name+"."+methodName
}
)
}
}
})
