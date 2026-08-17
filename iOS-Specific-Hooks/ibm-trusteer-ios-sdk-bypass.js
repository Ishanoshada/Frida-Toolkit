if (ObjC.available)
{
try {
const Tas = ObjC.classes.Tas;
const TasDraGetRiskItemCount = Tas['- TasDraGetRiskItemCount:'];
TasDraGetRiskItemCount.implementation = ObjC.implement(TasDraGetRiskItemCount, function(handle, selector, arg1) {
console.log(`Called TasDraGetRiskItemCount`);
arg1 = 0;
return 0;
})
} catch(err) {
console.log("[!] Exception while hooking: " + err.message);
} 
} else {
console.log("Objective-C Runtime is not available!");
}
