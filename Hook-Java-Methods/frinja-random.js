/*
License: (CC BY-SA 4.0) 
* */
setImmediate(function() {
Java.perform(function() {
var random = Java.use("java.util.Random");
random.$init.overload("long").implementation = function(seed) {
console.log("[*] Random("+seed+") constructor called\n");
return random.$init.overload("long").call(this, seed);
}
random.$init.overload().implementation = function() {
console.log("[*] Random() constructor called\n");
return random.$init.overload().call(this);
}
random.nextInt.overload().implementation = function () {
var intVal = this.nextInt();
console.log("[*] Random.nextInt called: " + intVal + "\n");
return intVal;
};
random.nextInt.overload('int').implementation = function (var0) {
var intVal = this.nextInt(var0);
console.log("[*] Random.nextInt with bound: " + var0 + " called: " + intVal + "\n");
return intVal;
};
random.nextDouble.implementation = function () {
var doubleVal = this.nextDouble();
console.log("[*] Random.nextDouble called: " + doubleVal + "\n");
return doubleVal;
};
random.nextGaussian.implementation = function () {
var doubleVal = this.nextGaussian();
console.log("[*] Random.nextGaussian called: " + doubleVal + "\n");
return doubleVal;
};
random.nextBoolean.implementation = function () {
var booleanVal = this.nextBoolean();
console.log("[*] Random.nextBoolean called: " + booleanVal + "\n");
return booleanVal;
};
random.nextFloat.implementation = function () {
var floatVal = this.nextFloat();
console.log("[*] Random.nextFloat called: " + floatVal + "\n");
return floatVal;
};
random.nextLong.implementation = function () {
var longVal = this.nextLong();
console.log("[*] Random.nextLong called: " + longVal + "\n");
return longVal;
};
});
});
