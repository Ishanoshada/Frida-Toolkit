if (ObjC.available) 
{
try
{
var className = "";
var funcName = "";
var hook = eval('ObjC.classes.' + className + '["' + funcName + '"]');
var newretval = ptr("0x0");
Interceptor.attach(hook.implementation, 
{
onEnter: function(args) 
{
console.log("\n==== Hooked " + className + " -> " + funcName + " ====");
console.log("[+] Class Name: " + className);
console.log("[+] Method Name: " + funcName); 
try 
{
console.log("\tInstance: " + this);
} 
catch (e) 
{
console.log("\t[!] Could not read instance: " + e.message);
}
for (var i = 0; i < args.length; i++) {
console.log("\tArg[" + i + "]: " + args[i] + " (Type: " + typeof args[i] + ")");
try 
{
var objcArg = ObjC.Object(args[i]);
console.log("\tArg[" + i + "] as ObjC: " + objcArg.toString());
console.log("\tArg[" + i + "] Class: " + objcArg.$className);
} catch (e) {}
}                
},
onLeave: function(retval) 
{
console.log("[+] Class Name: " + className);
console.log("[+] Method Name: " + funcName);
console.log("\tReturn Value Type: " + typeof retval);
console.log("\tOriginal Value: " + retval);
console.log("==== End Hook ====\n");
}
});
}
catch(error) 
{
console.log("[!] Exception: " + error.message); 
}
}  
else 
{
console.log("Objective-C Runtime is not available!"); 
}
