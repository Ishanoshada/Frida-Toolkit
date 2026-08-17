const mod = "IOSSecuritySuite";
console.log("Bypassing IOSSecuritySuite...");
Module.enumerateSymbolsSync(mod).forEach(sym => {
if (!sym.name.endsWith("SbyFZ")) return;
if (sym.address.isNull()) return;
console.log("Hooked & Bypassed: ", sym.name);
Interceptor.attach(sym.address, {
onLeave() {
this.context.x0 = ptr(0);
}
});
});
