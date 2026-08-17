Java.perform(function() {
console.log("teste1");
var clazz = Java.use('br.com.mobileexploitation.a003variables.MobileExploitationData');
clazz.setData.implementation = function() {
console.log("teste2");
var b1 = Java.use("java.lang.Boolean").$new("True");
return b1;
}
});
/*
Java.perform(function() {
var clazz = Java.use('br.com.mobileexploitation.a003variables.MobileExploitationData');
clazz.setData3.implementation = function() {
return clazz.setData3.apply(this, arguments);
}
});
*/
