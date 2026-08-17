const FOLDER_PATH = "/data/local/tmp/";
function getRandomInt(max) {
return Math.floor(Math.random() * max);
}
function dumpByteBuffer(buf) {
var remaining = buf.remaining();
const filename = FOLDER_PATH + 'dump' + getRandomInt(99999) + '.tflite';
console.log("[*] Opening file name=" + filename + " to write " + remaining + " bytes");
const f = new File(filename, 'wb');
var outBuf = new Uint8Array(remaining);
const progressInterval = Math.max(100, Math.floor(remaining / 100));
for (var i = 0; i < remaining; i += 1000) {
outBuf[i] = buf.get();
if (i % progressInterval === 0) {
const progress = Math.floor((i / remaining) * 100);
console.log(`[*] Writing... ${progress}% completed (${i} / ${remaining} bytes)`);
}
}
console.log("[*] Writing " + remaining + " bytes...");
f.write(outBuf);
f.close();
remaining = buf.remaining();
if (remaining > 0) {
console.log("[-] Error: There are " + remaining + " remaining bytes!");
} else {
console.log("[+] File dumped successfully in " + filename);
}
}
Java.perform(() => {
const NativeInterpreterWrapper = (function() {
try {
return Java.use('org.tensorflow.lite.NativeInterpreterWrapper')
} catch {
return false
}
})()
if (NativeInterpreterWrapper) {
NativeInterpreterWrapper.createModelWithBuffer.overload('java.nio.ByteBuffer', 'long').implementation = function(byteBuffer, errorReporterPtr) {
console.log("[+] Called NativeInterpreterWrapper.createModelWithBuffer");
const result = this.createModelWithBuffer(byteBuffer, errorReporterPtr);
dumpByteBuffer(byteBuffer)
return result;
};
NativeInterpreterWrapper.createModel.overload('java.lang.String', 'long').implementation = function(str, errorReporterPtr) {
console.log("[+] Called NativeInterpreterWrapper.createModel");
const result = this.createModel(str, errorReporterPtr);
console.log("[*] Capturing model from string is not implemented yet! The string is either a filepath, or a buffer. The buffer may break your terminal and/or crash your app.")
const answer = prompt("Print the string to console? (y/n)")
if (answer.toLowerCase() == "y") {
console.log(str)
}
return result
}
} else {
console.log("org.tensorflow.lite.NativeInterpreterWrapper.createModelWithBuffer not found! Is your app using TFLite?")
}
});
