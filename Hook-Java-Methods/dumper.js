Java.perform(function() {
try {
var classes = Java.enumerateClassesSync('com.mm.droid.livetv*');         classes.forEach(function(className) {
try {
var clazz = Java.use(className);
console.log('Hookeando mÃ©todos da classe: ' + className);
var methods = clazz.class.getDeclaredMethods();
methods.forEach(function(method) {
try {
var methodName = method.getName();
console.log('MÃ©todo encontrado: ' + methodName);
clazz[methodName].implementation = function() {
console.log('MÃ©todo chamado: ' + methodName);
return this[methodName].apply(this, arguments);                         };
} catch (e) {
console.log('Erro ao hookear o mÃ©todo: ' + e);
}
});
} catch (e) {
console.log('Erro ao hookear a classe: ' + e);
}
});
} catch (e) {
console.log('Erro ao listar classes: ' + e);
}
});
eshare-scripts QQGroup: 143824179 .
