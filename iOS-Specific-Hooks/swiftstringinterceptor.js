function reverseString(str) {
return str.split('').reverse().join('');
}
function hexToString(hex) {
let str = '';
for (let i = 0; i < hex.length; i += 2) {
str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
}
return reverseString(str);
}
function stringToHex(str) {
let reversedStr = reverseString(str);
let hexString = '';
for (let i = 0; i < reversedStr.length; i++) {
let hex = reversedStr.charCodeAt(i).toString(16);
hexString += hex.padStart(2, '0');
}
return '0x' + hexString;
}
function replaceString(nameOfTheFunction, newString) {
var someFunc = Module.findExportByName(null, nameOfTheFunction);
Interceptor.attach(someFunc, {
onEnter: function(args) {
var toStringAddr = Module.findExportByName("libswiftFoundation.dylib", "$sSS21_builtinStringLiteral17utf8CodeUnitCount7isASCIISSBp_BwBi1_tcfC");
Interceptor.attach(toStringAddr, {
onEnter(args) {
var builtinPointer = args[0];
var utf8CodeUnitCount = args[1];
var isASCII = args[2].toInt32();
args[1] = ptr(0x9)
},
onLeave(retVal) {
retVal.replace(stringToHex(newString));
}
})
}
})
}
