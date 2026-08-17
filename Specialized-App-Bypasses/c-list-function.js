var moduleName = "Project1.exe"; 
setTimeout(function() {
var symbols = Module.enumerateSymbols(moduleName);
console.log("[*] Listing functions in " + moduleName);
symbols.forEach(function(symbol) {
if (symbol.type === "function") {
console.log("[+] Function: " + symbol.name + " at " + symbol.address);
}
});
}, 1000);
