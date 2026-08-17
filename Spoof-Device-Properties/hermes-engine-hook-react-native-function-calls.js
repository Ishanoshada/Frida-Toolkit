let libhermesBaseAddress = Module.findBaseAddress("libhermes.so");
let hermesRuntimeImplCallAddress = libhermesBaseAddress.add(0x1f3931 - 0x00100000);
let runtimePtr = Module.findExportByName("libhermes.so", "_ZN8facebook6hermes17makeHermesRuntimeERKN6hermes2vm13RuntimeConfigE");
let valueToStringAddr = Module.findExportByName("libjsi.so", "_ZNK8facebook3jsi5Value8toStringERNS0_7RuntimeE");
Interceptor.attach(hermesRuntimeImplCallAddress, {
onEnter: function(args) {
console.log("HermesRuntimeImpl::call intercepted");
let func = args[1];         let jsThis = args[2];         let jsArgs = args[3];         let count = args[4]; 
console.log(`Function: ${func}`);
console.log(`jsThis: ${jsThis}`);
console.log(`jsArgs: ${jsArgs}`);
console.log(`Count: ${count}`);
console.log(`runtimePtr: ${runtimePtr}`);
console.log(`valueToStringAddr: ${valueToStringAddr}`);
let valueToString = new NativeFunction(valueToStringAddr, 'pointer', ['pointer', 'pointer']);
let resultPtr = valueToString(jsThis, runtimePtr);
let resultString = Memory.readUtf8String(resultPtr);
console.log("Value to String Result:", resultString);
}
});
