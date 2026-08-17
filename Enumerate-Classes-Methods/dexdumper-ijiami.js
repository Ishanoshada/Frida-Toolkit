const TARGET_SUBSTRING = "/com.mm.droid.livetv.duna/files/";
const DEST_DIR = "/sdcard/";
const openPtr = Module.findExportByName("libc.so", "open");
const readPtr = Module.findExportByName("libc.so", "read");
const writePtr = Module.findExportByName("libc.so", "write");
const closePtr = Module.findExportByName("libc.so", "close");
const open = new NativeFunction(openPtr, 'int', ['pointer', 'int']);
const read = new NativeFunction(readPtr, 'int', ['int', 'pointer', 'int']);
const write = new NativeFunction(writePtr, 'int', ['int', 'pointer', 'int']);
const close = new NativeFunction(closePtr, 'int', ['int']);
let hasFound = 0;
function copyFile(srcPath, dstPath) {
const O_RDONLY = 0;
const O_CREAT_WRONLY = 0x241; 
const srcPathPtr = Memory.allocUtf8String(srcPath);
const dstPathPtr = Memory.allocUtf8String(dstPath);
const srcFd = open(srcPathPtr, O_RDONLY);
if (srcFd < 0) {
console.error(`[!] Falha ao abrir arquivo origem: ${srcPath}`);
return;
}
const dstFd = open(dstPathPtr, O_CREAT_WRONLY);
if (dstFd < 0) {
console.error(`[!] Falha ao criar destino: ${dstPath}`);
close(srcFd);
return;
}
const buffer = Memory.alloc(4096);
let bytesRead;
while ((bytesRead = read(srcFd, buffer, 4096)) > 0) {
write(dstFd, buffer, bytesRead);
}
close(srcFd);
close(dstFd);
console.log(`[COPIADO] ${srcPath} -> ${dstPath}`);
}
function hookOpenAtFunc(funcName) {
const addr = Module.findExportByName("libc.so", funcName);
if (!addr) {
console.log(`[!] FunÃ§Ã£o ${funcName} nÃ£o encontrada.`);
return;
}
console.log(`[+] Hookando ${funcName} @ ${addr}`);
Interceptor.attach(addr, {
onEnter: function (args) {
try {
const pathPtr = args[1];
if (pathPtr.isNull()) {
console.log(`[LOG] ${funcName} chamado com path nulo`);
return;
}
const path = Memory.readUtf8String(pathPtr);
if (path.includes(TARGET_SUBSTRING)) {
console.log(`\n[DETECTADO] ${funcName} chamado com path: ${path}`);
const filename = path.split('/').pop();
const destPath = DEST_DIR + filename;
try {
if(hasFound == 0) {
hasFound = 1;
copyFile(path, destPath);
console.log(`[COPIADO] ${path} -> ${destPath}`);
}
} catch (copyErr) {
console.error(`[ERRO AO COPIAR] ${copyErr}`);
}
}
} catch (e) {
console.error(`[Erro] ${funcName} leitura falhou:`, e);
}
}
});
}
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
} catch (e) {
console.log("[FindClass] âš  Erro ao ler nome da classe ou chamador:", e);
this.className = null;
}
},
onLeave: function (retval) {
if (this.className) {
const lower = this.className.toLowerCase();
if (["xposed", "sandhook", "epic", "riru", "andhook"].some(b => lower.includes(b))) {
console.warn(`[Bypass] ðŸš« Bloqueando classe: ${this.className}`);
retval.replace(ptr(0));                     }
}
}
});
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
const offset = module ? ptr(this.caller).sub(module.base) : null;
const obj = args[1];
const methodID = args[2];
console.log(`[JNI] ðŸ“ž ${name} chamado`);
console.log(`  â†ª Chamador: ${module ? module.name : "desconhecido"}${offset ? " + 0x" + offset.toString(16) : ""}`);
console.log(`  â†ª jobject: ${obj}`);
console.log(`  â†ª jmethodID: ${methodID}`);
try {
const jenv = Java.vm.getEnv();
if (jenv.isValid()) {
const jclass = Java.vm.getEnv().getObjectClass(obj);
const methodName = Java.vm.getEnv().getMethodName(jclass, methodID);
const methodSig = Java.vm.getEnv().getMethodSignature(jclass, methodID);
console.log(`  â†ª MÃ©todo: ${methodName} ${methodSig}`);
}
} catch (e) {
}
},
onLeave: function (retval) {
console.log(`  â†© Retorno: ${retval}`);
}
});
console.log(`[+] Hook instalado: JNIEnv->${name}`);
});
}
function hookGetFieldID(index) {
Java.perform(() => {
const env = Java.vm.getEnv();
const vtablePtr = Memory.readPointer(env.handle);
const getFieldIDPtr = Memory.readPointer(vtablePtr.add(index * Process.pointerSize));
Interceptor.attach(getFieldIDPtr, {
onEnter: function (args) {
try {
this.clazz = args[1];
this.name = Memory.readCString(args[2]);
this.sig = Memory.readCString(args[3]);
this.thread = Java.vm.getEnv().getJavaVM().attachCurrentThread();
} catch (e) {
console.error("[GetFieldID] Erro onEnter:", e);
}
},
onLeave: function (retval) {
try {
const jclassWrapper = Java.use("java.lang.Class");
const clazzObj = Java.cast(ptr(this.clazz), jclassWrapper);
const className = clazzObj.getName();
console.log(`[GetFieldID] ðŸ“ ${className}.${this.name} ${this.sig}`);
} catch (e) {
console.error("[GetFieldID] Erro onLeave:", e);
}
}
});
console.log("[+] Hook instalado em GetFieldID");
});
}
function hookGetFieldID(index, name) {
Java.perform(function () {
const env = Java.vm.getEnv();
const vtablePtr = Memory.readPointer(env.handle);
const methodPtr = Memory.readPointer(vtablePtr.add(index * Process.pointerSize));
console.log(`[*] ${name} JNI real addr:`, methodPtr);
Interceptor.attach(methodPtr, {
onEnter: function (args) {
try {
this.classPtr = args[1];
this.fieldName = Memory.readUtf8String(args[2]);
this.fieldSig = Memory.readUtf8String(args[3]);
this.caller = this.returnAddress;
const module = Process.findModuleByAddress(this.caller);
const offset = ptr(this.caller).sub(module.base);
console.log(`[${name}] ðŸ“ž Procurando field`);
console.log(`  â†ª Classe ptr: ${this.classPtr}`);
console.log(`  â†ª Nome do field: ${this.fieldName}`);
console.log(`  â†ª Assinatura: ${this.fieldSig}`);
console.log(`  â†ª Chamador: ${module.name} + 0x${offset.toString(16)}`);
} catch (e) {
console.error(`[${name}] Erro ao ler argumentos:`, e);
}
},
onLeave: function (retval) {
console.log(`  â†© Retorno (jfieldID): ${retval}`);
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
var unlinkPtr = Module.findExportByName(null, "unlink");
Interceptor.replace(unlinkPtr, new NativeCallback(function (path) {
console.log('[*] unlink: ' + path.readCString());
return 0;     }, 'int', ['pointer']));
console.log("*] Iniciando hooks avanÃ§ados...");
hookFindClassFromJNIEnv();
console.log("[*] Iniciando hooks avanÃ§ados em mÃ©todos JNI...");
jniCalls.forEach(entry => hookJNIMethodCall(entry.index, entry.name));
hookOpenAtFunc("__openat");
hookGetMethodID(100, "GetMethodID");
hookGetMethodID(106, "GetStaticMethodID");
hookGetFieldID(94, "GetFieldID");
hookGetFieldID(100, "GetStaticFieldID");
});
