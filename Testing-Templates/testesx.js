const TARGET_MODULE = "libexec_x86.so";
const HOOK_OFFSET = 0x13627;
const REPLACE_STR = "com.exemplo.MutableClass";
const POLL_INTERVAL = 50; 
function installHook() {
const module = Process.findModuleByName(TARGET_MODULE);
if (!module) {
console.error(`âŒ ${TARGET_MODULE} nÃ£o carregado`);
return false;
}
const hookAddress = module.base.add(HOOK_OFFSET);
console.log(`ðŸ”— Hook instalado em ${hookAddress}`);
Interceptor.attach(hookAddress, {
onEnter(args) {
const stringPtr = this.context.esp.add(4).readPointer();
const originalStr = Memory.readUtf8String(stringPtr);
console.log(`ðŸ“Œ String original: "${originalStr}"`);
const newStrPtr = Memory.allocUtf8String(REPLACE_STR);
this.context.esp.add(4).writePointer(newStrPtr);
console.log(`ðŸ”§ SubstituÃ­do por: "${REPLACE_STR}"`);
}
});
return true;
}
function waitForModule(retry = 0) {
if (Module.findBaseAddress(TARGET_MODULE)) {
console.log(`âœ… ${TARGET_MODULE} carregado`);
if (!installHook()) {
setTimeout(waitForModule, POLL_INTERVAL);
}
} else {
if (retry < 10) {             setTimeout(waitForModule, POLL_INTERVAL, retry + 1);
} else {
console.error("âŒ Tempo esgotado - MÃ³dulo nÃ£o carregado");
}
}
}
setImmediate(() => {
console.log("â³ Monitorando carregamento do mÃ³dulo...");
waitForModule();
});
