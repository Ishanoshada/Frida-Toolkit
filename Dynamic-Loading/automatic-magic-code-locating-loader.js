console.warn("\nFrida.version= " + Frida.version);
console.warn("Process.arch= " + Process.arch);
console.warn("Process.platform = " + Process.platform);
console.log("Java.available= " + Java.available);
console.error("\\n frida -f /Applications/010\ Editor.app/Contents/MacOS/010\ Editor -l ./010Editor-MacOS-BS.js --no-pause \\n");
function get_rva(module, offset) {
var base_addr = Module.findBaseAddress(module);
if (base_addr === null)
base_addr = enum_to_find_module(module);
console.log(module + ' base_addr = ' + base_addr);
var target_addr = base_addr.add(offset);
return target_addr;
}
var target_addr = get_rva("010 Editor", 0xF5820);
console.log("target_addr = " + target_addr);
console.error("******************************");
console.error("Automatic Magic Code Locating");
console.error("Automatic signature locating");
console.error("******************************");
var Process = Process.findModuleByName("010 Editor");
var process_base_addr = Process.base;
var process_size = Process.size;
if (process_base_addr === null)
process_base_addr = enum_to_find_module("010 Editor");
console.log("\nprocess path = " + Process.path);
console.log("process name = " + Process.name);
console.log("process base = " + process_base_addr);
console.log("process size = " + process_size);
target_addr = process_base_addr.add(0xF5820);
console.log("+ target_addr CheckSN = " + target_addr);
var pattern = "83 f9 4e";
var searchResult_list = Memory.scanSync(process_base_addr, process_size, pattern);
for (var index in searchResult_list) {
console.warn("+ searchResult_list [" + index + "] = " + searchResult_list[index].address);
}
target_addr = ptr(searchResult_list[0].address - 0x37);
console.error("+ Magic Code Address = " + target_addr);
console.log(hexdump(target_addr, {
offset: 0,
length: 64,
header: true,
ansi: true
}));
Interceptor.attach(ptr(target_addr), {
onEnter: function(args) {
console.error('Context information:');
console.error('Context  : ' + JSON.stringify(this.context));
console.error('Return   : ' + this.returnAddress);
console.warn('ThreadId : ' + this.threadId);
console.warn('Depth    : ' + this.depth);
console.warn('Errornr  : ' + this.err);
console.log("onEnter CheckSN()");
console.error("[BS] [!] backtrace:\n" + Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n") + "\n");
this.context_rdi = args[0];
console.log("onEnter CheckSN() users= " + Memory.readInt(this.context_rdi.add(48)));
Memory.writeInt(this.context_rdi.add(48), 1000);
console.warn("onEnter CheckSN() users= " + Memory.readInt(this.context_rdi.add(48)));
console.log("onEnter CheckSN() net check= " + Memory.readInt(this.context_rdi.add(60)));
Memory.writeInt(this.context_rdi.add(60), 0);
console.warn("onEnter CheckSN() net check= " + Memory.readInt(this.context_rdi.add(60)));
console.log("onEnter CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
Memory.writeInt(this.context_rdi.add(68), 47419);
console.warn("onEnter CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
},
onLeave: function(retval) {
console.log("onLeave CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
Memory.writeInt(this.context_rdi.add(68), 47419);
console.warn("onLeave CheckSN() left days= " + Memory.readInt(this.context_rdi.add(68)));
console.log("onLeave CheckSN() return : " + retval.toInt32());
retval.replace(ptr(0xDB));
console.warn("onLeave CheckSN() return : " + retval.toInt32());
},
});
