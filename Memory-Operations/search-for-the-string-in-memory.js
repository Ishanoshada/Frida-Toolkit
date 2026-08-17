function stringToBytesHex(str) {
var bytes = [];
for (var i = 0; i < str.length; i++) {
var byteHex = str.charCodeAt(i).toString(16).toUpperCase();
if (byteHex.length === 1) {
byteHex = '0' + byteHex;
}
bytes.push(byteHex);
}
return bytes.join(' ');
}
function findString(string, indexModule) {
var m = Process.enumerateModules()[indexModule];
var pattern = stringToBytesHex(string)
var results = Memory.scanSync(m.base, m.size, pattern);
console.log(hexdump(ptr(results[0].address)))
}
