console.log('Listening For Requests...');
function toHexString(byteArray) {
return Array.from(byteArray, function(byte) {
return ('0' + (byte & 0xFF).toString(16)).slice(-2);
}).join('')
}
if (ObjC.available) {
try {
var className = "NSURLRequest";
var funcName = "- initWithURL:";
var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
Interceptor.attach(hook.implementation, {
onEnter: function(args) {
console.log('NSURLRequest with URL: ' + ObjC.Object(args[2]));
},
});
} catch (error) {
console.log("[!] Exception: " + error.message);
}
try {
var className = "SRWebSocket";        var funcName = "- send:";
var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
Interceptor.attach(hook.implementation, {
onEnter: function(args) {
var socketURL = ObjC.Object(args[0]).url().absoluteString().toString();
var data = ObjC.Object(args[2]);
console.log('LGSRWebSocket (' + ObjC.Object(args[0]) + ') ---> ' + socketURL);
console.log('Data: ' + data);
for (var i = 0; i < data.length(); i++) {
console.log(data.characterAtIndex_(i).toString(16) + ' --> ' + data.characterAtIndex_(i).toString());
}
},
});
} catch (error) {
console.log("[!] Exception: " + error.message);
}
try {
var className = "SRWebSocket";        var funcName = "- _handleMessage:";
var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
Interceptor.attach(hook.implementation, {
onEnter: function(args) {
console.log('LGSRWebSocket received: ' + ObjC.Object(args[2]));
},
});
} catch (error) {
console.log("[!] Exception: " + error.message);
}
} else {
console.log("Objective-C Runtime is not available!");
}
