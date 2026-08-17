var moduleName = "Project1.exe"; var functionName = "add"; 
setTimeout(function() {
var funcAddr = Module.findExportByName(moduleName, functionName);
if (!funcAddr) {
console.log("[-] Function not found. Trying all symbols...");
var symbols = Module.enumerateSymbols(moduleName);
for (var i = 0; i < symbols.length; i++) {
if (symbols[i].name.includes("add")) {
funcAddr = symbols[i].address;
console.log("[+] Found possible match: " + symbols[i].name + " at " + funcAddr);
break;
}
}
}
if (funcAddr) {
console.log("[*] Hooking add() at: " + funcAddr);
Interceptor.attach(funcAddr, {
onEnter: function(args) {
console.log("[+] add() called with a = " + args[0].toInt32() + ", b = " + args[1].toInt32());
},
onLeave: function(retval) {
console.log("[+] add() returned: " + retval.toInt32());
retval.replace(1); 
}
});
} else {
console.log("[-] Could not find add() function!");
}
}, 1000);
