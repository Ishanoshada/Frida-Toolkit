/**
This works with Telegram and other APPs that prevent making screenshots. It works by setting FLAG_SECURE = 0x2000 in multiple places
**/
import Java from 'frida-java-bridge';
function log(message: string) {
console.log(`[Screenshot] ${message}`);
}
Java.perform(() => {
const FLAG_SECURE = 0x2000;
let bypassCount = 0;
try {
const Window = Java.use('android.view.Window');
const LayoutParams = Java.use('android.view.WindowManager$LayoutParams');
const WindowManagerImpl = Java.use('android.view.WindowManagerImpl');
const WindowManagerGlobal = Java.use('android.view.WindowManagerGlobal');
const SurfaceView = Java.use('android.view.SurfaceView');
Window.setFlags.implementation = function(flags: number, mask: number) {
if ((flags & FLAG_SECURE) || (mask & FLAG_SECURE)) {
log(`Blocking FLAG_SECURE in Window.setFlags (bypass #${++bypassCount})`);
flags = flags & ~FLAG_SECURE;
mask = mask & ~FLAG_SECURE;
}
this.setFlags(flags, mask);
};
Window.addFlags.implementation = function(flags: number) {
if (flags & FLAG_SECURE) {
log(`Blocking FLAG_SECURE in Window.addFlags (bypass #${++bypassCount})`);
flags = flags & ~FLAG_SECURE;
}
if (flags !== 0) {
this.addFlags(flags);
}
};
LayoutParams.$init.overloads.forEach((constructor: any) => {
constructor.implementation = function(...args: any[]) {
const result = constructor.apply(this, args);
try {
const flagsField = LayoutParams.class.getDeclaredField('flags');
flagsField.setAccessible(true);
let flags = flagsField.getInt(this);
if (flags & FLAG_SECURE) {
flagsField.setInt(this, flags & ~FLAG_SECURE);
log(`Removed FLAG_SECURE from LayoutParams constructor (bypass #${++bypassCount})`);
}
} catch (e) {}
return result;
};
});
WindowManagerImpl.addView.overload('android.view.View', 'android.view.ViewGroup$LayoutParams').implementation =
function(view: any, params: any) {
try {
const flagsField = LayoutParams.class.getDeclaredField('flags');
flagsField.setAccessible(true);
let flags = flagsField.getInt(params);
if (flags & FLAG_SECURE) {
flagsField.setInt(params, flags & ~FLAG_SECURE);
let windowType = "unknown";
try {
const typeField = LayoutParams.class.getDeclaredField('type');
typeField.setAccessible(true);
windowType = typeField.getInt(params).toString();
} catch (e) {}
log(`Removed FLAG_SECURE from WindowManager.addView (type: ${windowType}, bypass #${++bypassCount})`);
}
} catch (e) {}
this.addView(view, params);
};
WindowManagerImpl.updateViewLayout.implementation = function(view: any, params: any) {
try {
const flagsField = LayoutParams.class.getDeclaredField('flags');
flagsField.setAccessible(true);
let flags = flagsField.getInt(params);
if (flags & FLAG_SECURE) {
flagsField.setInt(params, flags & ~FLAG_SECURE);
log(`Removed FLAG_SECURE from updateViewLayout (bypass #${++bypassCount})`);
}
} catch (e) {}
this.updateViewLayout(view, params);
};
SurfaceView.setSecure.implementation = function(isSecure: boolean) {
if (isSecure) {
log(`Blocking SurfaceView.setSecure(true) (bypass #${++bypassCount})`);
}
this.setSecure(false);
};
try {
const SurfaceControl = Java.use('android.view.SurfaceControl');
if (SurfaceControl.Transaction) {
const Transaction = Java.use('android.view.SurfaceControl$Transaction');
if (Transaction.setSecure) {
Transaction.setSecure.implementation = function(sc: any, isSecure: boolean) {
if (isSecure) {
log(`Blocking SurfaceControl.Transaction.setSecure(true) (bypass #${++bypassCount})`);
return this.setSecure(sc, false);
}
return this.setSecure(sc, isSecure);
};
}
}
} catch (e) {
}
try {
const Display = Java.use('android.view.Display');
Display.getFlags.implementation = function() {
const flags = this.getFlags();
if (flags & 0x2) {                     log(`Removing FLAG_SECURE from Display.getFlags`);
return flags & ~0x2;
}
return flags;
};
} catch (e) {}
function clearAllSecureFlags() {
Java.choose('android.app.Activity', {
onMatch: function(activity: any) {
try {
const window = activity.getWindow();
const attrs = window.getAttributes();
const flagsField = LayoutParams.class.getDeclaredField('flags');
flagsField.setAccessible(true);
let flags = flagsField.getInt(attrs);
if (flags & FLAG_SECURE) {
window.clearFlags(FLAG_SECURE);
flagsField.setInt(attrs, flags & ~FLAG_SECURE);
window.setAttributes(attrs);
log(`Cleared FLAG_SECURE from ${activity.getClass().getName()}`);
}
} catch (e) {}
},
onComplete: function() {}
});
}
setTimeout(clearAllSecureFlags, 1000);
setInterval(clearAllSecureFlags, 3000);
log('=== Universal Screenshot Bypass Active ===');
log(`Hooked all major secure flag methods`);
log(`Targeting app: ${Java.use('android.app.ActivityThread').currentApplication().getApplicationContext().getPackageName()}`);
} catch (error) {
log(`Setup error: ${error}`);
}
});
