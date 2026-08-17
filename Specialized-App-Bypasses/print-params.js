Interceptor.attach(Module.findExportByName("libhwui.so", "_ZN8SkBitmap14tryAllocPixelsEPNS_9AllocatorE"), {
onEnter: function (args) {
console.log('args found at ' + args[1]);
console.log('arg[2] = ' + args[2].toInt32());
console.log('arg[3]= ' + args[3].toInt32());
console.log('arg[4] = ' + args[4].toInt32());
console.log('arg[5] = ' + args[5].toInt32());
console.log('arg[6] = ' + args[6].toInt32());
console.log('arg[7] = ' + args[7].toInt32());
console.log('arg[8] = ' + args[8].toInt32());
console.log('arg[9] = ' + args[9].toInt32());
console.log('arg[10] = ' + args[10].toInt32());
console.log('arg[11] = ' + args[11].toInt32());
}
});
