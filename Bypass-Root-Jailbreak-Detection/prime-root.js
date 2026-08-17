function logger(message, type = "info") {
const colors = {
error: "\x1b[31m",         warn: "\x1b[33m",         info: "\x1b[34m",         success: "\x1b[32m",         debug: "\x1b[36m",         reset: "\x1b[0m"     };
const prefixes = {
error: "[!]",
warn: "[*]",
info: "[i]",
success: "[+]",
debug: "[#]"
};
const logType = colors[type.toLowerCase()] ? type.toLowerCase() : "info";
const color = colors[logType];
const prefix = prefixes[logType];
console.log(`${color}${prefix} ${message}${colors.reset}`);
}
Java.perform(function() {
/*
1. File check
2. Application package check
3. Debugger check
4. Command execution check
5. Frida check
6. Developer mode check
7. Root properties
8. RootBeer check
*/
logger("Prime root is running...", "info");
var RootFiles = [
"/su",
"magisk",
"Superuser",
"frida",
"gdb",
"daemonsu",
"busybox",
"kingroot",
"adb",
];
try {
logger("\'File.exists\' function hooking...", "info");
var File = Java.use("java.io.File");
File.exists.implementation = function() {
var path = this.getAbsolutePath();
if (RootFiles.some(keyword => path.includes(keyword))) {
logger("Blocked access to: " + path, "success");
return false;
}
return this.exists();
};
var openAddr = Module.findGlobalExportByName('open');
var fopenAddr = Module.findGlobalExportByName('fopen');
var accessAddr = Module.findGlobalExportByName('access');
logger("'open':\t " + openAddr, "info");
logger("'fopen':\t " + fopenAddr, "info");
logger("'access':\t " + accessAddr, "info");
const NULL = ptr("0");
function shouldBlockPath(path) {
if (!path) return false;
for (let i = 0; i < RootFiles.length; i++) {
const blocked = RootFiles[i];
if (path.includes(blocked)) {
return true;
}
}
return false;
}
Interceptor.attach(openAddr, {
onEnter: function(args) {
this.block = false;
const path = args[0].readCString();
if (shouldBlockPath(path)) {
this.block = true;
logger(`Blocked open() for: ${path}`, "success");
}
},
onLeave: function(retval) {
if (this.block) {
return -1;
}
}
});
Interceptor.attach(fopenAddr, {
onEnter: function(args) {
this.block = false;
const path = args[0].readCString();
if (shouldBlockPath(path)) {
this.block = true;
logger(`Blocked fopen() for: ${path}`, "success");
}
},
onLeave: function(retval) {
if (this.block) {
return retval.replace(ptr(0));
}
}
});
Interceptor.attach(accessAddr, {
onEnter: function(args) {
this.block = false;
const path = args[0].readCString();
if (shouldBlockPath(path)) {
this.block = true;
logger(`Blocked access() for: ${path}`, "success");
}
},
onLeave: function(retval) {
if (this.block) {
return -1;
}
}
});
} catch (e) {
logger("Error occured @ \'File.exists\': " + e, "error");
}
var RootPackages = [
".su",
"super",
"root",
"magisk",
"kingroot",
"ramdroid",
"rommanager",
"edxposed",
"hack",
"xposed",
"busybox",
"com.noshufou.android.su",
"com.noshufou.android.su.elite",
"eu.chainfire.supersu",
"com.koushikdutta.superuser",
"com.thirdparty.superuser",
"com.yellowes.su",
"com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license",
"com.dimonvideo.luckypatcher",
"com.chelpus.lackypatch",
"com.ramdroid.appquarantine",
"com.ramdroid.appquarantinepro",
"com.devadvance.rootcloak",
"com.devadvance.rootcloakplus",
"de.robv.android.xposed.installer",
"com.saurik.substrate",
"com.zachspong.temprootremovejb",
"com.amphoras.hidemyroot",
"com.amphoras.hidemyrootadfree",
"com.formyhm.hiderootPremium",
"com.formyhm.hideroot",
"me.phh.superuser",
"eu.chainfire.supersu.pro",
"com.kingouser.com",
"com.topjohnwu.magisk",
"com.koushikdutta.rommanager",
"com.koushikdutta.rommanager.license",
"com.dimonvideo.luckypatcher",
"com.chelpus.lackypatch",
"com.ramdroid.appquarantine",
"com.ramdroid.appquarantinepro",
"com.chelpus.luckypatcher",
"com.blackmartalpha",
"org.blackmart.market",
"com.allinone.free",
"com.repodroid.app",
"org.creeplays.hack",
"com.baseappfull.fwd",
"com.zmapp",
"com.dv.marketmod.installer",
"org.mobilism.android",
"com.android.wp.net.log",
"com.android.camera.update",
"cc.madkite.freedom",
"com.solohsu.android.edxp.manager",
"org.meowcat.edxposed.manager",
"com.xmodgame",
"com.cih.game_cih",
"com.charles.lpoqasert",
"catch_.me_.if_.you_.can_"
];
try {
logger("\'PackageManager.getPackageInfo\' function hooking...", "info");
var PackageManager = Java.use("android.app.ApplicationPackageManager");
PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pname, flags) {
if (RootPackages.some(keyword => pname.includes(keyword))) {
logger("Blocked root-related package: " + pname, "success");
pname = "com.google.fake";                 return this.getPackageInfo(pname, flags);
}
return this.getPackageInfo.overload('java.lang.String', 'int').call(this, pname, flags);
};
} catch (e) {
logger("Error occured @ packages checking: " + e, "error");
}
try {
logger("\'Debug.isDebuggerConnected\' function hooking...", "success");
var Debug = Java.use('android.os.Debug');
Debug.isDebuggerConnected.implementation = function() {
logger('isDebuggerConnected() check bypassed', "success");
return false;
};
} catch (e) {
logger("Error occured @ debugger checking: " + e, "error");
}
try {
logger("\'Runtime.exec\' function hooking...", "info");
var blockCommands = [
"su",
"mount",
"which su",
"magisk",
"busybox",
"pm"
];
var Runtime = Java.use("java.lang.Runtime");
var ProcessBuilder = Java.use('java.lang.ProcessBuilder');
Runtime.exec.overload("java.lang.String").implementation = function(cmd) {
logger("Runtime.exec called with: " + cmd, "info");
if (blockCommands.some(blockCmd => cmd.includes(blockCmd))) {
logger("Blocked root-related command: " + cmd, "success");
cmd = "nonexistcommand";
this.exec(cmd);
}
return this.exec(cmd);
};
ProcessBuilder.start.implementation = function() {
var cmd = this.command.call(this);                         var cmdString = Java.use('java.lang.String').valueOf(cmd);
logger("ProcessBuilder.start called with: " + cmdString, "info");
if (blockCommands.some(blockCmd => cmdString.includes(blockCmd))) {
logger("Blocked command: " + cmdString, "success");
return null;             }
return this.start.call(this);         };
} catch (e) {
logger("Error occured @ command execution: " + e, "error");
}
try {
const connAddr = Module.getGlobalExportByName("connect");
Interceptor.attach(connAddr, {
onEnter: function(args) {
},
onLeave: function(retval) {
if (this.frida_detection) {
logger("[Debugger Check] Frida Port detection bypassed", "success");
retval.replace(-1);
}
}
});
Interceptor.attach(Module.getGlobalExportByName("ptrace"), {
onLeave: function(retval) {
logger("[Debugger Check] Ptrace check bypassed", "success");
retval.replace(0);
}
});
} catch (e) {
logger("Error occured @ Frida check: " + e, "error");
}
try {
var SSecure = Java.use("android.provider.Settings$Secure");
SSecure.getStringForUser.overload('android.content.ContentResolver', 'java.lang.String', 'int').implementation = function(Content, Name, Flag) {
if (Name.indexOf("development_settings_enabled") >= 0) {
logger("Developer mode check bypassed for: " + Name, "success");
return this.getStringForUser.call(this, Content, "bypassed", Flag);
}
return this.getStringForUser(Content, Name, Flag);
};
} catch (err) {
logger('[Developer Mode Check] Error: ' + err, "error");
}
var RootProperties = {
"ro.build.selinux": "1",
"ro.debuggable": "0",
"service.adb.root": "0",
"ro.secure": "1"
};
var RootPropertiesKeys = [];
for (var k in RootProperties) RootPropertiesKeys.push(k);
try {
var RootBeer = Java.use("com.scottyab.rootbeer.RootBeer");
var Utils = Java.use("com.scottyab.rootbeer.util.Utils");
RootBeer.detectRootManagementApps.overload().implementation = function() {
logger("Hooked detectRootManagementApps", "success");
return false;
};
RootBeer.detectPotentiallyDangerousApps.overload().implementation = function() {
logger("Hooked detectPotentiallyDangerousApps", "success");
return false;
};
RootBeer.detectTestKeys.overload().implementation = function() {
logger("Hooked detectTestKeys", "success");
return false;
};
RootBeer.checkForBusyBoxBinary.overload().implementation = function() {
logger("Hooked checkForBusyBoxBinary");
return false;
};
RootBeer.checkForSuBinary.overload().implementation = function() {
logger("Hooked checkForSuBinary", "success");
return false;
};
RootBeer.checkSuExists.overload().implementation = function() {
logger("Hooked checkSuExists", "success");
return false;
};
RootBeer.checkForRWPaths.overload().implementation = function() {
logger("Hooked checkForRWPaths", "success");
return false;
};
RootBeer.checkForDangerousProps.overload().implementation = function() {
logger("Hooked checkForDangerousProps", "success");
return false;
};
RootBeer.checkForRootNative.overload().implementation = function() {
logger("Hooked checkForRootNative", "success");
return false;
};
RootBeer.detectRootCloakingApps.overload().implementation = function() {
logger("Hooked detectRootCloakingApps", "success");
return false;
};
Utils.isSelinuxFlagInEnabled.overload().implementation = function() {
logger("Hooked isSelinuxFlagInEnabled", "success");
return false;
};
RootBeer.checkForMagiskBinary.overload().implementation = function() {
logger("Hooked checkForMagiskBinary", "success");
return false;
};
RootBeer.isRooted.overload().implementation = function() {
logger("Hooked isRooted", "success");
return false;
};
console.log("[+] All RootBeer detection methods hooked successfully!");
} catch (e) {
logger("Error occured @ RootBeer check: " + e.message, "error");
}
});
function readByteArray(address, length) {
var buffer = new ArrayBuffer(length);
var view = new Uint8Array(buffer);
for (var i = 0; i < length; i++) {
view[i] = Memory.readU8(address.add(i));
}
return buffer;
}
