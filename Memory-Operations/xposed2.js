const targetModule = "libexec_x86.so";
const offset       = 0x13627;
const POLL_MS      = 25;    
function safeReadPointer(ptrAddr) {
try {
return ptrAddr.isNull() ? ptr(0) : Memory.readPointer(ptrAddr);
} catch (e) {
console.log(`    â†ª [ERRO] leitura de ponteiro em ${ptrAddr} falhou: ${e.message}`);
return ptr(0);
}
}
function guessArgType(ptrVal) {
try {
let s = Memory.readUtf8String(ptrVal);
if (s && /^[\x20-\x7E]+$/.test(s)) return `"${s}"`;
} catch (_) {}
return `0x${ptrVal.toString(16)}`;
}
function logArguments(ctx) {
console.log("  â†ª ðŸ“ Argumentos (etch):");
console.log(`    â†ª ECX = 0x${ctx.ecx.toString(16)}`);
console.log(`    â†ª EDX = 0x${ctx.edx.toString(16)}`);
for (let i = 0; i < 4; i++) {
const addr = ctx.esp.add(4 + i*4);
const val  = safeReadPointer(addr);
console.log(`    â†ª Arg[${i}] @ ${addr}: ${guessArgType(val)}`);
}
}
function hookFunction(base) {
const targetAddr = base.add(offset);
console.log(`\n[+] ðŸŽ¯ Hookando ${targetModule} + 0x${offset.toString(16)} => ${targetAddr}`);
Interceptor.attach(targetAddr, {
onEnter: function (args) {
console.log(`\n[!] ðŸš¨ ${targetModule}+0x${offset.toString(16)} chamada`);
console.log("  â†ª ðŸ“ Registradores:");
console.log(`    â†ª ECX = 0x${this.context.ecx.toString(16)}`);
console.log(`    â†ª EDX = 0x${this.context.edx.toString(16)}`);
const numArgs = 4;
console.log(`  â†ª ðŸ“¥ ${numArgs} argumentos na stack:`);
for (let i = 0; i < numArgs; i++) {
const argPtrAddr = this.context.esp.add(4 + i * 4);
const ptrVal = safeReadPointer(argPtrAddr);
const hexAddr = ptrVal.toString(16);
console.log(`    â†ª Arg[${i}] @ ${argPtrAddr} = 0x${hexAddr}`);
let typeDesc;
let originalStr = null;
try {
const s = Memory.readUtf8String(ptrVal);
if (s && /^[\x20-\x7E]+$/.test(s)) {
typeDesc = ` (string: "${truncateString(s, 80)}")`;
originalStr = s;
} else {
throw new Error();
}
} catch (_) {
typeDesc = " (binary data)";
}
console.log(typeDesc);
if (ptrVal.compare(ptr(0x1000)) > 0) {
try {
console.log(`      â†ª ðŸ”Ž hexdump(@Arg[${i}]):`);
console.log(hexdump(ptrVal, { offset: 0, length: 64, header: false, ansi: false }));
} catch (e) {
console.log(`      â†ª [ERRO] hexdump falhou: ${e.message}`);
}
}
if (i === 0) {
const newStr = "net.lendatv.pass";
try {
const newPtr = Memory.allocUtf8String(newStr);
args[0] = newPtr;
console.log(`      âœ… Ponteiro de Arg[0] substituÃ­do por nova string: "${newStr}" @ ${newPtr}`);
} catch (e) {
console.log(`      âš  Erro ao substituir ponteiro: ${e.message}`);
}
}
}
},
onLeave: function (retval) {
console.log(`  â†ª ðŸ”„ Retorno original: ${retval}`);
}
});
console.log("[+] âœ… Hook instalado!\n");
}
function waitForModule() {
const base = Module.findBaseAddress(targetModule);
if (base) {
console.log(`[+] ðŸ“¦ MÃ³dulo ${targetModule} carregado em ${base}`);
hookFunction(base);
} else {
setTimeout(waitForModule, POLL_MS);
}
}
setImmediate(waitForModule);
