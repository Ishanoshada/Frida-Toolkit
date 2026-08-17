/*
LinkedIn: https:Twitter: https:Apple Documentation: https:*/
function spoof_location(spoof_latitude, spoof_longitude)
{
var hook_cllocation = ObjC.classes["CLLocation"]["- coordinate"]
Interceptor.attach(hook_cllocation.implementation, {
onLeave: function(return_value) {
var spoofed_return_value = (new ObjC.Object(return_value)).initWithLatitude_longitude_(spoof_latitude, spoof_longitude)
return_value.replace(spoofed_return_value)
}
});
}
