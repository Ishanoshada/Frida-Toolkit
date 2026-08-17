Java.perform(function(){
try {
var Root = Java.use("cordova.plugin.devicecompile.devicecompile");
if (Root) {
console.log("cordova.plugin.devicecompile detected");
Root.IsDrived.overload().implementation = function(){
return false;
};
} else {
console.log("cordova.plugin.devicecompile Not detected");
}
} catch (error) {
console.error("An error occurred:", error);
}
});
