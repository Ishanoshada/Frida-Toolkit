function bin2string(array) {
var result = "";
for (var index = 0; index < array.length; index++) {
result += String.fromCharCode(array[index]);
}
return result;
}
Java.perform(function () {
var rootBypassing = Java.use("sg.vantagepoint.uncrackable1.MainActivity");
rootBypassing.a.implementation = function () {
console.log("Root Bypassed");
var passcode = Java.use("sg.vantagepoint.a.a");
passcode.a.implementation = function (x1, x2) {
var passcodeFunctionCall = [];
passcodeFunctionCall = this.a(x1, x2);
var output = bin2string(passcodeFunctionCall);
console.log("Passcode : " + output);
return passcodeFunctionCall;
};
};
});
