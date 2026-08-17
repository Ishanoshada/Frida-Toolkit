/* Description: Show all class name
* Mode: S+A
* Version: 1.0
* 
*/
Java.perform(function() {
Java.enumerateLoadedClasses({
onMatch: function(className) {
console.log(className);
},
onComplete: function() {}
});
});
