Java.perform(function () {
var ProtectedApp = Java.use("mobi.foo.sama.ProtectedApp");
ProtectedApp.onCreate.implementation = function () {
console.log("Bypassing ProtectedApp.onCreate");
};
ProtectedApp.AsfG.implementation = function () {
console.log("Bypassing ProtectedApp.AsfG");
return 0;     };
});
