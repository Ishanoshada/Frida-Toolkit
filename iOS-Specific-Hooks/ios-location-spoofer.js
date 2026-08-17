var spoof_latitude = 46.211275;
var spoof_longitude = 2.368013;
function spoof_location(lat, lon) {
var hook_cllocation = ObjC.classes["CLLocation"]["- coordinate"];
Interceptor.attach(hook_cllocation.implementation, {
onLeave: function (ret) {
var spoofed = (new ObjC.Object(ret)).initWithLatitude_longitude_(lat, lon);
ret.replace(spoofed);
}
});
}
function metersToDegrees(m) {
return m / 111111; }
function right(m = 50) {
spoof_longitude += metersToDegrees(m);
spoof_location(spoof_latitude, spoof_longitude);
}
function left(m = 50) {
spoof_longitude -= metersToDegrees(m);
spoof_location(spoof_latitude, spoof_longitude);
}
function up(m = 50) {
spoof_latitude += metersToDegrees(m);
spoof_location(spoof_latitude, spoof_longitude);
}
function down(m = 50) {
spoof_latitude -= metersToDegrees(m);
spoof_location(spoof_latitude, spoof_longitude);
}
spoof_location(spoof_latitude, spoof_longitude);
