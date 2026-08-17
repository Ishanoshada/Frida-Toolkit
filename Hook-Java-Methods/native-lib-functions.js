var package_name = "package.name";
var class_name = "class_name";
Java.perform(function() {
var Process = Java.use(package_name + '.' + class_name);
console.log('\nMethods available on ' + class_name + ' :-:');
var methods = Process.class.getDeclaredMethods();
methods.forEach(function(method) {
var methodName = method.getName();
var parameterTypes = method.getParameterTypes();
var parameterInfo = parameterTypes.map(function(type) {
return type.getName();
}).join(', ');
console.log(methodName + '(' + parameterInfo + ')');
});
var instance = Process.$new();
methods.forEach(function(method) {
var methodName = method.getName();
var parameterTypes = method.getParameterTypes();
if (parameterTypes.length === 0) {
try {
var result = instance[methodName]();
console.log('\x1b[32m[+] ' + methodName + '(): ' + result + '\x1b[0m');             } catch (e) {
console.log('\x1b[31m[!] Error calling ' + methodName + '(): ' + e.message + '\x1b[0m');             }
}
if (parameterTypes.length === 1 && parameterTypes[0].getName() === 'boolean') {
try {
var result = instance[methodName](true);
console.log('\x1b[34m[+] ' + methodName + '(true): ' + result + '\x1b[0m');             } catch (e) {
console.log('\x1b[31m[!] Error calling ' + methodName + '(true): ' + e.message + '\x1b[0m');             }
}
});
});
