Java.perform(function () {
var classHooked = false; 
function tryHooking() {
if (classHooked) return; 
try {
var NotificationCompatBuilder = Java.use('androidx.core.app.NotificationCompat$Builder');
NotificationCompatBuilder.setContentTitle.overload('java.lang.CharSequence').implementation = function (title) {
console.log('setContentTitle called with:', title);
return this.setContentTitle(title);
};
NotificationCompatBuilder.setContentText.overload('java.lang.CharSequence').implementation = function (text) {
console.log('setContentText called with:', text);
return this.setContentText(text);
};
console.log('Successfully hooked NotificationCompat$Builder methods');
classHooked = true;         } catch (e) {
setTimeout(tryHooking, 1000);         }
}
tryHooking();
});
