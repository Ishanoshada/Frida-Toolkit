Java.perform(function () {
var Build = Java.use("android.os.Build");
var SystemProperties = Java.use("android.os.SystemProperties");
var vendorId = SystemProperties.get("ro.preinstall.vendorid");
console.log("Vendor ID: " + vendorId);
if (vendorId && vendorId.includes("stb_vendor")) {
console.log("Dispositivo Ã© um Set-Top Box!");
}
var secondDisplayPkg = SystemProperties.get("debug.second-display.pkg");
console.log("Second Display Package: " + secondDisplayPkg);
if (secondDisplayPkg) {
console.log("Dispositivo tem suporte para TV ou segundo display!");
}
var firmware = SystemProperties.get("ro.product.firmware");
console.log("Firmware: " + firmware);
if (firmware && firmware.includes("stb_firmware")) {
console.log("Dispositivo possui firmware para Set-Top Box!");
}
});
