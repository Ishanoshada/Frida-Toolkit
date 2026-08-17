Java.enumerateLoadedClasses({
onMatch: function(classname) {
if (classname.indexOf('Headers') !== -1 &&
classname.indexOf('okhttp') !== -1) {
console.log(classname);
}
},
onComplete: function() {}
});
