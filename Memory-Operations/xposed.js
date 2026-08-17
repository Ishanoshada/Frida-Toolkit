function hookFindClassFromJNIEnv() {
Java.perform(function () {
const env = Java.vm.getEnv();
const FindClassIdx = 6;
const vtablePtr = Memory.readPointer(env.handle);
const FindClassPtr = Memory.readPointer(vtablePtr.add(FindClassIdx * Process.pointerSize));
console.log("[*] FindClass JNI real addr:", FindClassPtr);
Interceptor.attach(FindClassPtr, {
onEnter: function (args) {
try {
this.className = Memory.readUtf8String(args[1]);
this.caller = this.returnAddress;
const module = Process.findModuleByAddress(this.caller);
const offset = ptr(this.caller).sub(module.base);
console.log(`[FindClass] ðŸ“¦ Classe procurada: ${this.className}`);
console.log(`  â†ª Chamador: ${module.name} + 0x${offset.toString(16)}`);
console.log(`  â†ª ðŸ“ Base da ${module.name}: ${module.base}`);                  } catch (e) {
console.log("[FindClass] âš  Erro ao ler nome da classe ou chamador:", e);
this.className = null;
}
},
onLeave: function (retval) {
if (this.className) {
const nameLower = this.className.toLowerCase();
if (
nameLower.includes("xposed") ||
nameLower.includes("sandhook") ||
nameLower.includes("epic") ||
nameLower.includes("riru") ||
nameLower.includes("andhook")
) {
console.warn(`[Bypass] ðŸš« Bloqueando classe: ${this.className}`);
retval.replace(ptr(0));                     }
}
}
});
console.log("[+] Hook instalado: JNIEnv->FindClass (com bypass + log de chamador)");
});
}
function hookJNIMethodCall(index, name) {
Java.perform(function () {
const env = Java.vm.getEnv();
const vtablePtr = Memory.readPointer(env.handle);
const methodPtr = Memory.readPointer(vtablePtr.add(index * Process.pointerSize));
console.log(`[*] ${name} JNI real addr:`, methodPtr);
Interceptor.attach(methodPtr, {
onEnter: function (args) {
this.caller = this.returnAddress;
const module = Process.findModuleByAddress(this.caller);
const offset = module ? ptr(this.caller).sub(module.base) : "desconhecido";
console.log(`[JNI] ðŸ“ž ${name} chamado`);
console.log(`  â†ª Chamador: ${module ? module.name : "desconhecido"} + 0x${offset.toString(16)}`);
},
onLeave: function (retval) {
console.log(`  â†© Retorno: ${retval}`);
}
});
console.log(`[+] Hook instalado: JNIEnv->${name}`);
});
}
const jniCalls = [
{ index: 33, name: "CallObjectMethod" },
{ index: 35, name: "CallBooleanMethod" },
{ index: 39, name: "CallIntMethod" },
{ index: 42, name: "CallLongMethod" },
{ index: 46, name: "CallVoidMethod" },
{ index: 109, name: "CallStaticObjectMethod" },
{ index: 111, name: "CallStaticBooleanMethod" },
{ index: 115, name: "CallStaticIntMethod" },
{ index: 118, name: "CallStaticLongMethod" },
{ index: 122, name: "CallStaticVoidMethod" }
];
setImmediate(() => {
console.log("*] Iniciando hooks avanÃ§ados...");
hookFindClassFromJNIEnv();
console.log("[*] Iniciando hooks avanÃ§ados em mÃ©todos JNI...");
jniCalls.forEach(entry => hookJNIMethodCall(entry.index, entry.name));
});
