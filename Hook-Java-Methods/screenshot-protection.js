Java.perform(function() {
var Window = Java.use("android.view.Window");
Window.setFlags.implementation = function(flags, mask) {
var FLAG_SECURE = 0x2000;
flags = flags & ~FLAG_SECURE;
mask = mask & ~FLAG_SECURE;
console.log("Bypassed FLAG_SECURE");
return this.setFlags(flags, mask);
};
});
