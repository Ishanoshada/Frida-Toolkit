function spoofLocation(newLat: number, newLong: number) {
function offsetLocation(lat: number, long: number) {
var randLat = lat + (Math.random() - 0.5) * 0.01;
var randLong = long + (Math.random() - 0.5) * 0.01;
return {
randLat,
randLong
};
}
var clLocation = ObjC.classes["CLLocation"]["- coordinate"];
Interceptor.attach(clLocation.implementation, {
onLeave: (curLocation) => {
const {
randLat,
randLong
} = offsetLocation(
newLat,
newLong
);
var newLocation = new ObjC.Object(curLocation)[
"- initWithLatitude:longitude:"
](randLat, randLong);
curLocation.replace(newLocation);
},
});
}
