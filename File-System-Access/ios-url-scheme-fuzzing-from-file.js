/* 99% of this code stolen from github.com/dki
* iOS URL Scheme Fuzzing, Read Fuzz List From File
* Usage: frida -U --codeshare s1xtw03/ios-url-scheme-fuzzing-from-file SpringBoard
*
* Return all registered URL schemes by app (iOS < 11)
*      dumpSchemes();
*
* Open the specified URL
*      openURL("somescheme: *
* Find the executable name for a particular scheme
*      bundleExecutableForScheme("somescheme");
*
* Emulate single home button click (for app backgrounding)
*      homeSinglePress();
*
* Fuzz a particular URL - use {0} as placeholder for insertion points
*      fuzz("somescheme: *
* Move all crash logs matching a particular string to /tmp
*      moveCrashLogs("MyApp");
*
*
* You'll typically want to call openURL for the target scheme once before
* fuzzing to dismiss the prompt that appears the first time
*
* openURL("somescheme: * addFuzzFromFile("/tmp/yourfile")
* fuzzStrings.push("somefancyfuzzstring");
* fuzz("somescheme: *
*/
function openURL(url) {
var w = ObjC.classes.LSApplicationWorkspace.defaultWorkspace();
var toOpen = ObjC.classes.NSURL.URLWithString_(url);
return w.openSensitiveURL_withOptions_(toOpen, null);
}
function homeSinglePress() {
var version = ObjC.classes.UIDevice.currentDevice().systemVersion().toString();
if (version.startsWith("9.")) {         ObjC.schedule(ObjC.mainQueue, function() {
ObjC.classes.SBUIController.sharedInstance().clickedMenuButton();
});
} else if (version.startsWith("10.") || version.startsWith("11.")) {         ObjC.schedule(ObjC.mainQueue, function() {
ObjC.classes.SBUIController.sharedInstance().handleHomeButtonSinglePressUp();
});
} else {
console.log("Sorry, I only tested this on iOS 9 - 11! :(");
}
}
function moveCrashLogs(appname) {
var match = appname + "*.ips";
var pred = ObjC.classes.NSPredicate.predicateWithFormat_('SELF like "' + match + '"');
var fm = ObjC.classes.NSFileManager.defaultManager();
var dirlist = fm.contentsOfDirectoryAtPath_error_("/private/var/mobile/Library/Logs/CrashReporter", NULL);
var results = dirlist.filteredArrayUsingPredicate_(pred);
if (results.count() > 0) {
for (var i = 0; i < results.count(); i++) {
var src = results.objectAtIndex_(i).toString();
fm.moveItemAtPath_toPath_error_("/private/var/mobile/Library/Logs/CrashReporter/" + src, "/tmp/" + src, NULL);
}
return true;
}
return false;
}
function addFuzzFromFile(filepath) {
var fm = ObjC.classes.NSFileManager.defaultManager();
if(!fm.isReadableFileAtPath_(filepath)) {
return("Cannot read file at the provided path. This should be on the iOS device!")
}
var fileasstring = ObjC.classes.NSString.stringWithContentsOfFile_(filepath, "NSUTF8StringEncoding", NULL);
var fileasarray = fileasstring.componentsSeparatedByString_("\n");
for(var i = 0; i < fileasarray.count(); i++)
{
fuzzStrings.push(fileasarray.objectAtIndex_(i));
}
return ("Ya bidding be done");
}
if (!String.format) {
String.format = function(format) {
var args = Array.prototype.slice.call(arguments, 1);
return format.replace(/{(\d+)}/g, function(match, number) {
return typeof args[number] != 'undefined' ?
args[number] :
match;
});
};
}
var fuzzStrings = ["0",
"1",
"-1",
"null",
"nil",
"99999999999999999999999999999999999",
Array(257).join("A"),
Array(1026).join("A"),
"'",
"%20d",
"%20n",
"%20x",
"%20s"
];
fuzzStrings.iter = function() {
var index = 0;
var data = this;
return {
next: function() {
return {
value: data[index],
done: index++ == (data.length - 1)
};
},
hasNext: function() {
return index < data.length;
}
}
};
function bundleExecutableForScheme(scheme) {
var apps = ObjC.classes.LSApplicationWorkspace.defaultWorkspace().applicationsAvailableForHandlingURLScheme_(scheme);
if (apps.count() != 1) {
return null;
}
var appProxy = apps.objectAtIndex_(0);     var bundleExecutable = appProxy.bundleExecutable();
if (bundleExecutable !== null) {
return bundleExecutable.toString();
}
return null;
}
function dumpSchemes() {
var map = {};
var schemes = ObjC.classes.LSApplicationWorkspace.defaultWorkspace().publicURLSchemes();
for (var i = 0; i < schemes.count(); i++) {
var name = bundleExecutableForScheme(schemes.objectAtIndex_(i));
if (!(name in map)) {
map[name] = [];
}
map[name].push(schemes.objectAtIndex_(i).toString());
}
return map;
}
function fuzz(url) {
var appname = bundleExecutableForScheme(url.split(':')[0]);
if (appname === null) {
console.log("Could not determine which app handles this URL!");
return;
}
function Fuzzer(url, appname, iter) {
this.url = url;
this.appname = appname;
this.iter = iter;
}
Fuzzer.prototype.checkForCrash = function(done) {
homeSinglePress();
if (moveCrashLogs(this.appname)) {
console.log("Crashed!");
}
if (!done) {
this.fuzz();
}
};
Fuzzer.prototype.fuzz = function() {
var term = this.iter.next();
var fuzzedURL = String.format(this.url, term.value);
if (openURL(fuzzedURL)) {
console.log("Opened URL: " + fuzzedURL);
} else {
console.log("URL refused by SpringBoard: " + fuzzedURL);
}
ObjC.classes.NSThread.sleepForTimeInterval_(3);
this.checkForCrash(term.done);
};
console.log("Watching for crashes from " + appname + "...");
if (moveCrashLogs(appname)) {
console.log("Moved one or more logs to /tmp/ before fuzzing!");
}
var iter = fuzzStrings.iter();
var fuzzer = new Fuzzer(url, appname, iter);
fuzzer.fuzz();
}
