/*  Android ssl certificate pinning bypass script for various methods
by Maurizio Siddu
Run with:
frida -U -f [APP_ID] -l frida_multiple_unpinning.js --no-pause
*/
setTimeout(function() {
Java.perform(function() {
var ver = Java.use('android.os.Build$VERSION');
ver.SDK_INT.value = 15;
});
}, 0);
