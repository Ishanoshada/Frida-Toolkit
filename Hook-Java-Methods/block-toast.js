Java.perform(function() {
var Toast = Java.use("android.widget.Toast");
var Thread = Java.use("java.lang.Thread");
var originalMakeText = Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int');
Toast.makeText.overload('android.content.Context', 'java.lang.CharSequence', 'int').implementation = function(context, text, duration) {
var toastText = text.toString();
if (toastText.includes("Ø§Ù…Ú©Ø§Ù† Ø¨Ø§Ø² Ú©Ø±Ø¯Ù†")) {
console.log("[!] TARGET TOAST CREATED - BLOCKING: " + toastText);
var fakeToast = originalMakeText.call(this, context, text, duration);
fakeToast.show.implementation = function() {
console.log("[!] Blocked target toast from showing: " + toastText);
return;
};
return fakeToast;
}
return originalMakeText.call(this, context, text, duration);
};
console.log("[*] Targeted Toast blocker active for 'Ø§Ù…Ú©Ø§Ù† Ø¨Ø§Ø² Ú©Ø±Ø¯Ù†'");
});
