const lat = -23.6269477;
const lng = -46.4701341;
Java.perform(function () {
var Location = Java.use("android.location.Location");
Location.getLatitude.implementation = function() {
send("Overwriting Lat to " + lat);
return lat;
}
Location.getLongitude.implementation = function() {
send("Overwriting Lng to " + lng);
return lng;
}
})
