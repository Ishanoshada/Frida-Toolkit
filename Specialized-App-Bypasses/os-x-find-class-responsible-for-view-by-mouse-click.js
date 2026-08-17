function getAllClassSubclassing(subclassString) {
var cachedClasses = {};
var numClasses = ObjC.api.objc_getClassList(NULL, 0);
var classHandles = Memory.alloc(numClasses * Process.pointerSize);
numClasses = ObjC.api.objc_getClassList(classHandles, numClasses);
for (var i = 0; i !== numClasses; i++) {
var handle = classHandles.add(i * Process.pointerSize).readPointer();
var name = ObjC.api.class_getName(handle).readUtf8String();
var isNSObjOrResponder = false;
var wasResponderChain = false;
var curList = [];
for (
var candidate = handle; candidate != null && candidate != "0x0" && !isNSObjOrResponder; candidate = ObjC.api.class_getSuperclass(candidate)
) {
var candidateName = ObjC.api.class_getName(candidate).readUtf8String();
if (candidateName == "NSObject" || candidateName == subclassString) {
isNSObjOrResponder = true;
wasResponderChain = candidateName == subclassString;
} else {
curList += [candidateName];
}
}
if (wasResponderChain) {
cachedClasses[name] = handle;
}
}
return cachedClasses;
}
var responderSubclasses = getAllClassSubclassing("NSResponder");
for (var className in responderSubclasses) {
var fridaCurClass = ObjC.classes[className];
function closureWrapper(classString, classHandle) {
var mouseDownOriginal = fridaCurClass["- mouseDown:"];
Interceptor.attach(mouseDownOriginal.implementation, {
onEnter: function(args) {
var event = ObjC.Object(args[2]);
console.log(
"\n" +
classString +
' mouseDown:@"' +
event.toString() +
'"] object self: ' +
args[0]
);
console.log("Methods:");
console.log(classHandle.$ownMethods.join("\n"));
console.log("IVars:");
console.log(classHandle.$ivars.join("\n"));
},
});
}
closureWrapper(className, fridaCurClass);
}
