/**
* v4.1.0-stealth â€“ full hardening, minimal noise
* covers: /proc/tcp, task threads, selective native hooks
* @ridhoae303
*/
var debug = true;
var sslByp = false;
var IMEI = "";
var AND_ID = "";
var PHONE = "";
var INSTALLER = "com.android.vending";
var DEVICE_MODEL = "";
var DEVICE_MANUFACTURER = "";
var NETWORK_OPERATOR = "";
var TAG = "[F-STEALTH]";
var ver = "4.1.0";
function lg(m) { if (debug) console.log(TAG + " " + m); }
function li(m) { console.log(TAG + " " + m); }
function le(m) { console.error(TAG + " " + m); }
function genImei() {
var pref = ["35","86","89","01","13"];
var rand = pref[Math.floor(Math.random() * pref.length)];
for (var i = 0; i < 13; i++) rand += Math.floor(Math.random() * 10);
var sum = 0;
for (var i = 0; i < 15; i++) {
var digit = parseInt(rand[i]);
if (i % 2 == 1) digit *= 2;
sum += Math.floor(digit / 10) + (digit % 10);
}
var checksum = (10 - (sum % 10)) % 10;
return rand.substring(0, 14) + checksum;
}
function genAndroidId() {
var hex = "0123456789abcdef";
var id = "";
for (var i = 0; i < 16; i++) id += hex[Math.floor(Math.random() * 16)];
return id;
}
function genPhone() {
var prefixes = ["0812","0813","0821","0852","0878","0896"];
var pref = prefixes[Math.floor(Math.random() * prefixes.length)];
for (var i = 0; i < 8; i++) pref += Math.floor(Math.random() * 10);
return pref;
}
function genModel() {
var models = ["SM-G998B", "Pixel 6 Pro", "IN2023", "LE2115", "M2102J20SG"];
return models[Math.floor(Math.random() * models.length)];
}
function genManufacturer() {
var mans = ["samsung", "Google", "OnePlus", "Xiaomi", "Oppo"];
return mans[Math.floor(Math.random() * mans.length)];
}
function genOperator() {
var ops = ["Telkomsel", "Indosat", "XL Axiata", "Tri", "Smartfren"];
return ops[Math.floor(Math.random() * ops.length)];
}
function setRandomValues() {
IMEI = genImei();
AND_ID = genAndroidId();
PHONE = genPhone();
DEVICE_MODEL = genModel();
DEVICE_MANUFACTURER = genManufacturer();
NETWORK_OPERATOR = genOperator();
li("IMEI: " + IMEI);
li("Android ID: " + AND_ID);
li("Phone: " + PHONE);
li("Model: " + DEVICE_MODEL);
li("Manufacturer: " + DEVICE_MANUFACTURER);
li("Operator: " + NETWORK_OPERATOR);
}
function safeHook(cls, method, impl) {
try {
var target = Java.use(cls);
if (target[method]) {
target[method].implementation = impl;
lg("hooked " + cls + "." + method);
return true;
}
} catch (e) {
le("fail " + cls + "." + method + ": " + e.message);
}
return false;
}
function isSuspiciousCommand(cmd) {
if (!cmd) return false;
var lower = cmd.toLowerCase().trim();
var patterns = [
"frida", "xposed", "busybox", "magisk", "su",
"tcpdump", "dalvikvm", "app_process"
];
for (var i = 0; i < patterns.length; i++) {
if (lower.indexOf(patterns[i]) !== -1) return true;
}
return false;
}
function patch() {
li("script v" + ver + " (native-hardened, low noise)");
Java.perform(function () {
try {
var pkg = Java.use("android.app.ActivityThread").currentApplication().getPackageName();
li("target: " + pkg);
} catch (e) { li("can't read pkg"); }
safeHook("android.app.ApplicationPackageManager", "getPackageInfo", function (pkg, flags) {
var ret = this.getPackageInfo.call(this, pkg, flags);
if (ret && ret.signatures) {
var fakeSig = Java.array('android.content.pm.Signature', [Java.use('android.content.pm.Signature').$new("308203c3")]);
ret.signatures = fakeSig;
lg("sig replaced " + pkg);
}
return ret;
});
safeHook("android.app.ApplicationPackageManager", "getInstallerPackageName", function (pkg) {
var ret = this.getInstallerPackageName.call(this, pkg);
try {
var cur = Java.use("android.app.ActivityThread").currentApplication().getPackageName();
if (pkg === cur) return INSTALLER;
} catch (e) {}
return ret;
});
safeHook("java.security.Signature", "verify", function (sig) { return true; });
safeHook("android.app.ApplicationPackageManager", "checkSignatures", function (a, b) { return 0; });
safeHook("android.telephony.TelephonyManager", "getDeviceId", function () { return IMEI; });
try { Java.use("android.telephony.TelephonyManager").getDeviceId.overload('int').implementation = function (slot) { return IMEI; }; } catch (e) {}
safeHook("android.telephony.TelephonyManager", "getImei", function () { return IMEI; });
try { Java.use("android.telephony.TelephonyManager").getImei.overload('int').implementation = function (slot) { return IMEI; }; } catch (e) {}
safeHook("android.telephony.TelephonyManager", "getMeid", function () { return "99000000000000"; });
safeHook("android.telephony.TelephonyManager", "getSimSerialNumber", function () { return "8982123456789012345"; });
safeHook("android.telephony.TelephonyManager", "getSubscriberId", function () { return "310260123456789"; });
safeHook("android.telephony.TelephonyManager", "getLine1Number", function () { return PHONE; });
safeHook("android.telephony.TelephonyManager", "getNetworkOperatorName", function () { return NETWORK_OPERATOR; });
safeHook("android.provider.Settings$Secure", "getString", function (resolver, name) {
var ret = this.getString.call(this, resolver, name);
if (name == "android_id") return AND_ID;
return ret;
});
safeHook("android.provider.Settings$System", "getString", function (resolver, name) {
var ret = this.getString.call(this, resolver, name);
if (name == "android_id") return AND_ID;
return ret;
});
var Build = Java.use("android.os.Build");
Build.MODEL.value = DEVICE_MODEL;
Build.MANUFACTURER.value = DEVICE_MANUFACTURER;
Build.PRODUCT.value = "razor";
Build.BRAND.value = "google";
Build.DEVICE.value = "razor";
Build.FINGERPRINT.value = "google/razor/razor:5.0.1/LRX22C/1602158:user/release-keys";
try { Build.getSerial.implementation = function () { return "0123456789abcdef"; }; } catch (e) {}
safeHook("java.io.File", "exists", function () {
var p = this.getAbsolutePath();
var bad = [
"/system/bin/su","/system/xbin/su","/sbin/su",
"/system/app/Superuser.apk","/system/bin/busybox",
"/data/local/tmp/frida-server",
"/data/local/tmp/re.frida.server",
"/data/local/tmp/frida-agent",
"/data/local/tmp/gadget.config",
"/data/local/tmp/hluda-server"
];
for (var i = 0; i < bad.length; i++) {
if (p.indexOf(bad[i]) !== -1) return false;
}
if (p.toLowerCase().indexOf("frida") !== -1 || p.toLowerCase().indexOf("gadget") !== -1) return false;
return this.exists();
});
try { Java.use("de.robv.android.xposed.XposedBridge").hookAllMethods.implementation = function () { return null; }; } catch (e) {}
safeHook("java.lang.System", "loadLibrary", function (lib) {
if (lib.indexOf("frida") !== -1) return;
return this.loadLibrary(lib);
});
safeHook("android.os.Debug", "isDebuggerConnected", function () { return false; });
try {
var am = Java.use("android.app.ActivityManager");
am.getRunningAppProcesses.implementation = function () {
var procs = this.getRunningAppProcesses();
var filt = Java.use("java.util.ArrayList").$new();
for (var i = 0; i < procs.size(); i++) {
var p = procs.get(i);
if (p.processName.toLowerCase().indexOf("frida") === -1) filt.add(p);
}
return filt;
};
} catch (e) {}
if (sslByp) {
safeHook("javax.net.ssl.HttpsURLConnection", "setSSLSocketFactory", function (f) {});
safeHook("javax.net.ssl.HostnameVerifier", "verify", function (host, sess) { return true; });
}
try {
var ni = Java.use("java.net.NetworkInterface");
ni.getHardwareAddress.implementation = function () {
return Java.array('byte', [0x02,0x00,0x00,0x00,0x00,0x00]);
};
} catch (e) {}
try {
var Sys = Java.use("java.lang.System");
var origProp = Sys.getProperty;
Sys.getProperty.overload('java.lang.String').implementation = function (key) {
var val = origProp.call(this, key);
if (key == "ro.debuggable") val = "0";
if (key == "ro.secure") val = "1";
if (key == "ro.build.tags") val = "release-keys";
return val;
};
} catch (e) {}
try {
var pkgMgr = Java.use("android.app.ApplicationPackageManager");
pkgMgr.hasSystemFeature.implementation = function (feat) {
if (feat.indexOf("telephony") !== -1 || feat.indexOf("wifi") !== -1 || feat.indexOf("bluetooth") !== -1) return true;
if (feat == "android.hardware.type.watch") return false;
return this.hasSystemFeature(feat);
};
} catch (e) {}
li("anti-kill hooks");
try { Java.use("android.app.Activity").finish.implementation = function () { lg("finish blocked"); }; } catch (e) {}
try { Java.use("android.app.Activity").finishAffinity.implementation = function () { lg("finishAffinity blocked"); }; } catch (e) {}
try { Java.use("android.app.Activity").moveTaskToBack.implementation = function (flag) { return false; }; } catch (e) {}
try { Java.use("java.lang.System").exit.implementation = function (code) { lg("exit blocked"); }; } catch (e) {}
try { Java.use("java.lang.System").runFinalizersOnExit.implementation = function (val) {}; } catch (e) {}
try { Java.use("android.os.Process").killProcess.implementation = function (pid) { lg("killProcess blocked"); }; } catch (e) {}
try { Java.use("android.os.Process").sendSignal.implementation = function (pid, sig) { if (sig == 9 || sig == 15) return; return this.sendSignal(pid, sig); }; } catch (e) {}
try { var am2 = Java.use("android.app.ActivityManager"); am2.killBackgroundProcesses.implementation = function (pkg) { lg("killBackground blocked " + pkg); }; } catch (e) {}
try { var am3 = Java.use("android.app.ActivityManager"); am3.restartPackage.implementation = function (pkg) { lg("restartPackage blocked " + pkg); }; } catch (e) {}
li("play integrity bypass");
try {
var dgc = Java.use("com.google.android.gms.droidguard.DroidGuardClient");
dgc.attest.implementation = function (params, cb) {
var fake = Java.use("org.json.JSONObject").$new();
fake.put("tokenResult", "fake_token_" + Date.now());
cb.onSuccess(fake);
};
} catch (e) {}
try {
var integrity = Java.use("com.google.android.play.core.integrity.IntegrityManager");
integrity.requestIntegrityToken.implementation = function (req, cb) {
cb.onSuccess("fake_integrity_token");
};
} catch (e) {}
try {
var snet = Java.use("com.google.android.gms.safetynet.SafetyNetApi");
snet.attest.implementation = function (client, nonce) { return null; };
} catch (e) {}
try {
var ThreadLocal = Java.use("java.lang.ThreadLocal");
var currentPath = ThreadLocal.$new();
var sensitiveFis = new WeakMap();  
var FileInputStream = Java.use("java.io.FileInputStream");
var File = Java.use("java.io.File");
function isSensitivePath(path) {
if (!path) return false;
var p = path.toLowerCase();
return (p.indexOf("/proc/self/maps") !== -1 ||
p.indexOf("/proc/self/smaps") !== -1 ||
p.indexOf("/proc/self/status") !== -1 ||
p.indexOf("/proc/self/task") !== -1 ||
p.indexOf("/proc/net/tcp") !== -1 ||
p.indexOf("/proc/net/tcp6") !== -1 ||
p.indexOf("/proc/self/fd") !== -1);
}
FileInputStream.$init.overload('java.io.File').implementation = function (file) {
var path = file.getAbsolutePath();
if (isSensitivePath(path)) {
currentPath.set(path);
sensitiveFis.set(this, true);
}
return this.$init.call(this, file);
};
FileInputStream.$init.overload('java.lang.String').implementation = function (name) {
var f = File.$new(name);
var path = f.getAbsolutePath();
if (isSensitivePath(path)) {
currentPath.set(path);
sensitiveFis.set(this, true);
}
return this.$init.call(this, name);
};
FileInputStream.close.implementation = function () {
if (sensitiveFis.get(this)) {
currentPath.set(null);
sensitiveFis.delete(this);
}
return this.close.call(this);
};
var BufferedReader = Java.use("java.io.BufferedReader");
BufferedReader.readLine.implementation = function () {
var line = this.readLine.call(this);
var path = currentPath.get();
if (path === null || line === null) return line;
var lowerPath = path.toLowerCase();
if (lowerPath.indexOf("/maps") !== -1 || lowerPath.indexOf("/smaps") !== -1) {
if (line.toLowerCase().indexOf("frida") !== -1) {
return this.readLine();                     }
}
else if (lowerPath.endsWith("/status") && lowerPath.indexOf("/task/") === -1) {
if (line.startsWith("TracerPid:")) {
return "TracerPid:\t0";
}
}
else if (lowerPath.indexOf("/task/") !== -1) {
if (lowerPath.endsWith("/status") && line.startsWith("Name:")) {
if (/frida|gum-js|gadget/i.test(line)) {
return "Name:\tthread_main";                         }
} else if (lowerPath.endsWith("/comm")) {
if (/frida|gum-js|gadget/i.test(line)) {
return "main";                         }
}
}
else if (lowerPath.indexOf("/proc/net/tcp") !== -1) {
if (line.toLowerCase().indexOf("69b6") !== -1 || line.toLowerCase().indexOf("frida") !== -1) {
return this.readLine();                     }
}
else if (lowerPath.indexOf("/proc/self/fd") !== -1) {
if (line.toLowerCase().indexOf("frida") !== -1) {
return this.readLine();
}
}
return line;
};
} catch (e) { le("extended proc filter fail: " + e); }
try {
var Runtime = Java.use("java.lang.Runtime");
var IOException = Java.use("java.io.IOException");
Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
if (isSuspiciousCommand(cmd)) throw IOException.$new("No such file or directory");
return this.exec.call(this, cmd);
};
Runtime.exec.overload('[Ljava.lang.String;').implementation = function (cmdarray) {
var joined = "";
for (var i = 0; i < cmdarray.length; i++) joined += String(cmdarray[i]) + " ";
if (isSuspiciousCommand(joined)) throw IOException.$new("No such file or directory");
return this.exec.call(this, cmdarray);
};
Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;').implementation = function (cmd, envp) {
if (isSuspiciousCommand(cmd)) throw IOException.$new("No such file or directory");
return this.exec.call(this, cmd, envp);
};
Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function (cmdarray, envp) {
var joined = "";
for (var i = 0; i < cmdarray.length; i++) joined += String(cmdarray[i]) + " ";
if (isSuspiciousCommand(joined)) throw IOException.$new("No such file or directory");
return this.exec.call(this, cmdarray, envp);
};
var ProcessBuilder = Java.use("java.lang.ProcessBuilder");
ProcessBuilder.start.implementation = function () {
var command = this.command();
var joined = "";
for (var i = 0; i < command.size(); i++) joined += String(command.get(i)) + " ";
if (isSuspiciousCommand(joined)) throw IOException.$new("No such file or directory");
return this.start.call(this);
};
} catch (e) { le("cmd block: " + e); }
try {
var FileClass = Java.use("java.io.File");
FileClass.listFiles.overload().implementation = function () {
var files = this.listFiles.call(this);
if (!files) return files;
var filtered = Java.use("java.util.ArrayList").$new();
for (var i = 0; i < files.length; i++) {
var name = files[i].getName().toLowerCase();
if (name.indexOf("frida") === -1 && name.indexOf("gadget") === -1) filtered.add(files[i]);
}
return filtered.toArray(Java.array('java.io.File', []));
};
FileClass.list.overload().implementation = function () {
var names = this.list.call(this);
if (!names) return names;
var filtered = Java.use("java.util.ArrayList").$new();
for (var i = 0; i < names.length; i++) {
var n = String(names[i]).toLowerCase();
if (n.indexOf("frida") === -1 && n.indexOf("gadget") === -1) filtered.add(names[i]);
}
return filtered.toArray(Java.array('java.lang.String', []));
};
} catch (e) { le("file listing hide: " + e); }
}); 
Interceptor.attach(Module.findExportByName("libc.so", "open"), {
onEnter: function (args) {
this.path = Memory.readUtf8String(args[0]);
var path = this.path.toLowerCase();
if (path.indexOf("frida-agent") !== -1 ||
path.indexOf("gadget") !== -1 ||
path.indexOf("frida-server") !== -1 ||
path.indexOf("re.frida.server") !== -1) {
this.block = true;
this.retval = -1;
}
},
onLeave: function (retval) {
if (this.block) {
retval.replace(ptr(-1));
}
}
});
Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
onEnter: function (args) {
this.path = Memory.readUtf8String(args[0]);
var path = this.path.toLowerCase();
if (path.indexOf("frida-agent") !== -1 ||
path.indexOf("gadget") !== -1 ||
path.indexOf("frida-server") !== -1 ||
path.indexOf("re.frida.server") !== -1) {
this.block = true;
}
},
onLeave: function (retval) {
if (this.block) {
retval.replace(ptr(0));
}
}
});
var blockedFds = {};
Interceptor.attach(Module.findExportByName("libc.so", "open"), {
onLeave: function (retval) {
if (this.block) {
var fd = retval.toInt32();
if (fd >= 0) {
blockedFds[fd] = true;
}
}
}
});
Interceptor.attach(Module.findExportByName("libc.so", "read"), {
onEnter: function (args) {
var fd = args[0].toInt32();
this.fd = fd;
if (blockedFds[fd]) {
this.blockRead = true;
}
},
onLeave: function (retval) {
if (this.blockRead) {
retval.replace(ptr(0));
}
}
});
Interceptor.attach(Module.findExportByName("libc.so", "close"), {
onEnter: function (args) {
var fd = args[0].toInt32();
if (blockedFds[fd]) {
delete blockedFds[fd];
}
}
});
Interceptor.attach(Module.findExportByName(null, "dlopen"), {
onEnter: function (args) {
this.path = Memory.readUtf8String(args[0]);
if (this.path && (this.path.indexOf("frida-agent") !== -1 || this.path.indexOf("gadget") !== -1)) {
this.block = true;
}
},
onLeave: function (retval) {
if (this.block) {
retval.replace(ptr(0));
}
}
});
Interceptor.attach(Module.findExportByName(null, "android_dlopen_ext"), {
onEnter: function (args) {
this.path = Memory.readUtf8String(args[0]);
if (this.path && (this.path.indexOf("frida-agent") !== -1 || this.path.indexOf("gadget") !== -1)) {
this.block = true;
}
},
onLeave: function (retval) {
if (this.block) {
retval.replace(ptr(0));
}
}
});
var property_get = Module.findExportByName("libc.so", "__system_property_get");
if (property_get) {
Interceptor.attach(property_get, {
onEnter: function (args) {
this.name = Memory.readUtf8String(args[0]);
this.valuePtr = args[1];
},
onLeave: function (retval) {
if (!this.name) return;
switch (this.name) {
case "ro.debuggable":
Memory.writeUtf8String(this.valuePtr, "0");
retval.replace(ptr(1));
break;
case "ro.secure":
Memory.writeUtf8String(this.valuePtr, "1");
retval.replace(ptr(1));
break;
case "ro.build.tags":
Memory.writeUtf8String(this.valuePtr, "release-keys");
retval.replace(ptr(1));
break;
case "ro.product.model":
Memory.writeUtf8String(this.valuePtr, DEVICE_MODEL);
retval.replace(ptr(1));
break;
case "ro.product.manufacturer":
Memory.writeUtf8String(this.valuePtr, DEVICE_MANUFACTURER);
retval.replace(ptr(1));
break;
case "ro.product.brand":
Memory.writeUtf8String(this.valuePtr, "google");
retval.replace(ptr(1));
break;
case "ro.product.device":
Memory.writeUtf8String(this.valuePtr, "razor");
retval.replace(ptr(1));
break;
case "ro.product.name":
Memory.writeUtf8String(this.valuePtr, "razor");
retval.replace(ptr(1));
break;
case "ro.build.fingerprint":
Memory.writeUtf8String(this.valuePtr, "google/razor/razor:5.0.1/LRX22C/1602158:user/release-keys");
retval.replace(ptr(1));
break;
}
}
});
}
li("native hooks: selective open/fopen/dlopen + property sync");
}
setRandomValues();
setTimeout(function () {
if (Java.available) {
patch();
} else {
le("Java not available");
}
}, 100);
rpc.exports = {
setImei: function (v) { IMEI = v; li("IMEI updated " + v); },
setAndroidId: function (v) { AND_ID = v; li("Android ID updated " + v); },
setPhone: function (v) { PHONE = v; li("Phone updated " + v); },
setModel: function (v) { DEVICE_MODEL = v; li("Model updated " + v); },
setManufacturer: function (v) { DEVICE_MANUFACTURER = v; li("Manufacturer updated " + v); },
setOperator: function (v) { NETWORK_OPERATOR = v; li("Operator updated " + v); },
reload: function () { patch(); },
version: function () { return ver; }
};
li("Script v" + ver + " loaded, RPC ready.");
