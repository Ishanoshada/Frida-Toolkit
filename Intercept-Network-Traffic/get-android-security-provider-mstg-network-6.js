Java.perform(function () { 
var Sec = Java.use("java.security.Security");
var SecInstance = Sec.$new(); 
console.log(SecInstance.getProviders());
});
