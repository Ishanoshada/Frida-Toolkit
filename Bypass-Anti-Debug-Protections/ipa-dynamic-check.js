function app_info(DEBUG) {
console.log("")
console.warn("--------------------------------")
console.warn("|        å¾…æµ‹è¯•åº”ç”¨ä¿¡æ¯        |")
console.warn("--------------------------------")
try {
console.log("Bundle Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleName").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Display Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleDisplayName").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Executable Name: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleExecutable").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Bundle Identifier: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleIdentifier").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Info Dictionary Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleInfoDictionaryVersion").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Numeric Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleNumericVersion").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Short Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleShortVersionString").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Bundle Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleVersion").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Minimum OS Version: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("MinimumOSVersion").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Bundle Package Type: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundlePackageType").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("BuildMachineOSBuild: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("BuildMachineOSBuild").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("Development Region: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("CFBundleDevelopmentRegion").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
try {
console.log("iPhone Environment Required: " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("LSRequiresIPhoneOS").toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
var mainBundlePath = String(ObjC.classes.NSBundle.mainBundle())
mainBundlePath = mainBundlePath.substring(0, mainBundlePath.indexOf(">"))
mainBundlePath = mainBundlePath.substring(mainBundlePath.indexOf("<") + 1)
console.log("App Bundle Path    : " + mainBundlePath)
}
function raw_app_info_plist(DEBUG) {
console.log("")
console.warn("--------------------------------")
console.warn("|      Info.plist æ–‡ä»¶å†…å®¹     |")
console.warn("--------------------------------")
try {
console.log(ObjC.classes.NSBundle.mainBundle().infoDictionary().toString())
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
}
function app_transport_security(DEBUG) {
console.log("")
console.warn("-----------------------------------")
console.warn("|ATS (App Transport Security) è®¾ç½®|")
console.warn("-----------------------------------")
console.warn("å‚è€ƒèµ„æ–™: https:    var dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
if (dictKeys.containsObject_("NSAppTransportSecurity")) {
var atsDictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").allKeys();
for (var i = 0; i < atsDictKeys.count(); i++) {
if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoads") {
if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoads").toString() == "1") {
console.log("[*] Issue: åœ¨Info.plistä¸­è®¾ç½®äº† 'NSAllowsArbitraryLoads'")
console.log("[*] Detail: æŒ‡ç¤ºæ˜¯å¦ä¸ºæ‰€æœ‰ç½‘ç»œè¿žæŽ¥ç¦ç”¨ ATS")
console.log("")
}
}
if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoadsForMedia") {
if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoadsForMedia").toString() == "1") {
console.log("[*] Issue: åœ¨Info.plistä¸­è®¾ç½®äº† 'NSAllowsArbitraryLoadsForMedia'")
console.log("[*] Detail: æŒ‡ç¤ºæ˜¯å¦å¯¹ä½¿ç”¨ AV Foundation æ¡†æž¶å‘å‡ºçš„è¯·æ±‚ç¦ç”¨ ATSã€‚")
console.log("")
}
}
if (atsDictKeys.objectAtIndex_(i) == "NSAllowsArbitraryLoadsInWebContent") {
if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsArbitraryLoadsInWebContent").toString() == "1") {
console.log("[*] Issue: åœ¨Info.plistä¸­è®¾ç½®äº† 'NSAllowsArbitraryLoadsInWebContent'")
console.log("[*] Detail: æŒ‡ç¤ºæ˜¯å¦ä¸ºä»Ž Web è§†å›¾å‘å‡ºçš„è¯·æ±‚ç¦ç”¨ ATS")
console.log("")
}
}
if (atsDictKeys.objectAtIndex_(i) == "NSAllowsLocalNetworking") {
if (ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSAllowsLocalNetworking").toString() == "1") {
console.log("[*] Issue: åœ¨Info.plistä¸­è®¾ç½®äº† 'NSAllowsLocalNetworking'")
console.log("[*] Detail: æŒ‡ç¤ºæ˜¯å¦å…è®¸åŠ è½½æœ¬åœ°èµ„æº.")
console.log("")
}
}
if (atsDictKeys.objectAtIndex_(i) == "NSExceptionDomains") {
console.log("[*] Issue: åœ¨Info.plistçš„ 'NSAppTransportSecurity' å—ä¸­è®¾ç½®äº† 'NSExceptionDomains'")
console.log("[*] Detail: é’ˆå¯¹ç‰¹å®šåŸŸåè¿›è¡Œ ATS ä¾‹å¤–çš„è®¾ç½®, å¯ä½¿ç”¨ä¸å®‰å…¨çš„HTTPåè®®ä¼ è¾“æ•°æ®")
console.log("[*] åŒ…å«åŸŸå:")
var atsExceptionDomainsDict = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSExceptionDomains");
var atsExceptionDomainsDictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_("NSAppTransportSecurity").objectForKey_("NSExceptionDomains").allKeys();
for (var i = 0; i < atsExceptionDomainsDictKeys.count(); i++) {
console.log("    " + atsExceptionDomainsDictKeys.objectAtIndex_(i));
}
}
}
}
}
function protected_resources_permissions(DEBUG) {
console.log("")
console.warn("-----------------------------------")
console.warn("|           æ•æ„Ÿæƒé™æ£€æµ‹          |")
console.warn("-----------------------------------")
console.warn("å‚è€ƒèµ„æ–™: https:    var dictKeys = ObjC.classes.NSBundle.mainBundle().infoDictionary().allKeys();
var permissionListArray = ["NSBluetoothAlwaysUsageDescription", "NSBluetoothPeripheralUsageDescription", "NSCalendarsUsageDescription", "NSRemindersUsageDescription", "NSCameraUsageDescription", "NSMicrophoneUsageDescription", "NSContactsUsageDescription", "NSFaceIDUsageDescription", "NSDesktopFolderUsageDescription", "NSDocumentsFolderUsageDescription", "NSDownloadsFolderUsageDescription", "NSNetworkVolumesUsageDescription", "NSRemovableVolumesUsageDescription", "NSFileProviderPresenceUsageDescription", "NSFileProviderDomainUsageDescription", "NSHealthClinicalHealthRecordsShareUsageDescription", "NSHealthShareUsageDescription", "NSHealthUpdateUsageDescription", "NSHealthRequiredReadAuthorizationTypeIdentifiers", "NSHomeKitUsageDescription", "NSLocationAlwaysAndWhenInUseUsageDescription", "NSLocationUsageDescription", "NSLocationWhenInUseUsageDescription", "NSLocationAlwaysUsageDescription", "NSAppleMusicUsageDescription", "NSMotionUsageDescription", "NFCReaderUsageDescription", "NSPhotoLibraryAddUsageDescription", "NSPhotoLibraryUsageDescription", "NSAppleScriptEnabled", "NSAppleEventsUsageDescription", "NSSiriUsageDescription", "NSSpeechRecognitionUsageDescription", "NSVideoSubscriberAccountUsageDescription", "UIRequiresPersistentWiFi"]
var permissionListNameDict = {
"NSBluetoothAlwaysUsageDescription": "èŽ·å–è“ç‰™æƒé™",
"NSBluetoothPeripheralUsageDescription": "èŽ·å–è“ç‰™æƒé™",
"NSCalendarsUsageDescription": "èŽ·å–æ—¥å¿—æƒé™",
"NSRemindersUsageDescription": "Reminders Usage Description",
"NSCameraUsageDescription": "èŽ·å–ç›¸æœºæƒé™",
"NSMicrophoneUsageDescription": "èŽ·å–éº¦å…‹é£Žæƒé™",
"NSContactsUsageDescription": "èŽ·å–è”ç³»äººæƒé™",
"NSFaceIDUsageDescription": "èŽ·å–Face IDæƒé™",
"NSDesktopFolderUsageDescription": "èŽ·å–æ¡Œé¢æ–‡ä»¶å¤¹æƒé™",
"NSDocumentsFolderUsageDescription": "èŽ·å–æ–‡æ¡£æ–‡ä»¶å¤¹æƒé™",
"NSDownloadsFolderUsageDescription": "èŽ·å–ä¸‹è½½æ–‡ä»¶å¤¹æƒé™",
"NSNetworkVolumesUsageDescription": "èŽ·å–ç½‘ç»œå·æƒé™",
"NSRemovableVolumesUsageDescription": "èŽ·å–ä¾¿æºå¼ç£ç›˜æƒé™",
"NSFileProviderPresenceUsageDescription": "èŽ·å– File Provider Presence Usage æƒé™",
"NSFileProviderDomainUsageDescription": "èŽ·å– File Provider Domain Usage æƒé™",
"NSHealthClinicalHealthRecordsShareUsageDescription": "èŽ·å–å¥åº·æƒé™",
"NSHealthShareUsageDescription": "èŽ·å–å¥åº·æƒé™",
"NSHealthUpdateUsageDescription": "èŽ·å–å¥åº·æƒé™",
"NSHealthRequiredReadAuthorizationTypeIdentifiers": "èŽ·å–HealthKitæƒé™",
"NSHomeKitUsageDescription": "èŽ·å–HomeKitæƒé™",
"NSLocationAlwaysAndWhenInUseUsageDescription": "èŽ·å–åŽå°å®šä½æƒé™",
"NSLocationUsageDescription": "èŽ·å–å®šä½æƒé™",
"NSLocationWhenInUseUsageDescription": "èŽ·å–å®šä½æƒé™",
"NSLocationAlwaysUsageDescription": "èŽ·å–åŽå°å®šä½æƒé™",
"NSAppleMusicUsageDescription": "èŽ·å–åª’ä½“åº“æƒé™",
"NSMotionUsageDescription": "èŽ·å–è¿åŠ¨æƒé™",
"NFCReaderUsageDescription": "èŽ·å–NFCæƒé™",
"NSPhotoLibraryAddUsageDescription": "èŽ·å–ç…§ç‰‡æƒé™",
"NSPhotoLibraryUsageDescription": "èŽ·å–ç…§ç‰‡æƒé™",
"NSAppleScriptEnabled": "èŽ·å–AppleScriptæƒé™",
"NSAppleEventsUsageDescription": "èŽ·å–AppleEventsæƒé™",
"NSSystemAdministrationUsageDescription": "èŽ·å–ç³»ç»Ÿç®¡ç†å‘˜æƒé™",
"ITSAppUsesNonExemptEncryption": "è®¾ç½®ä½¿ç”¨ä¸è¢«å‡ºå£é™åˆ¶çš„åŠ å¯†",
"ITSEncryptionExportComplianceCode": "è®¾ç½®å‡ºå£åˆè§„ä»£ç ",
"NSSiriUsageDescription": "èŽ·å–siriæƒé™",
"NSSpeechRecognitionUsageDescription": "èŽ·å–è¯­éŸ³è¯†åˆ«æƒé™",
"NSVideoSubscriberAccountUsageDescription": "èŽ·å–è§†é¢‘è®¢é˜…æƒé™",
"UIRequiresPersistentWiFi": "èŽ·å–wifiæƒé™"
};
var _flag = true;
for (var i = 0; i < permissionListArray.length; i++) {
try {
if (dictKeys.containsObject_(permissionListArray[i])) {
console.log("Resource : " + permissionListArray[i])
console.log("Name     : " + permissionListNameDict[permissionListArray[i]])
console.log("Value    : " + ObjC.classes.NSBundle.mainBundle().infoDictionary().objectForKey_(permissionListArray[i]).toString())
console.log("")
_flag = false;
}
} catch (err) {
if (DEBUG) {
console.error("[!] Error: " + err.message);
}
}
}
if (_flag) {
console.log("[*] æ— ä»»ä½•ç”³è¯·æƒé™");
} else {
raw_app_info_plist();
}
}
function set_hook(DEBUG) {
var _checks = [{
name: "uname èŽ·å–ä¿¡æ¯",             fun_type: "native",             fun_name: "uname",
fun_class: null,
onEnter: function(args) {
console.log("uname èŽ·å–ä¿¡æ¯");
},
onLeave: function(ret) {}
},
{
name: "UIDevice localizedModel èŽ·å–è®¾å¤‡è¯­è¨€",
fun_type: "ObjC",             fun_name: "- localizedModel",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice localizedModel èŽ·å–è®¾å¤‡è¯­è¨€");
},
onLeave: function(ret) {}
},
{
name: "UIDevice systemVersion èŽ·å–è®¾å¤‡ç‰ˆæœ¬",
fun_type: "ObjC",
fun_name: "- systemVersion",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice systemVersion èŽ·å–è®¾å¤‡ç‰ˆæœ¬");
},
onLeave: function(ret) {}
},
{
name: "UIDevice model èŽ·å–è®¾å¤‡åž‹å·",
fun_type: "ObjC",
fun_name: "- model",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice model èŽ·å–è®¾å¤‡åž‹å·");
},
onLeave: function(ret) {}
},
{
name: "UIDevice name èŽ·å–è®¾å¤‡åç§°",
fun_type: "ObjC",
fun_name: "- name",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice name èŽ·å–è®¾å¤‡åç§°");
},
onLeave: function(ret) {}
},
{
name: "UIDevice systemName èŽ·å–è®¾å¤‡åç§°",
fun_type: "ObjC",
fun_name: "- systemName",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice systemName èŽ·å–è®¾å¤‡åç§°");
},
onLeave: function(ret) {}
},
{
name: "UIDevice orientation èŽ·å–è®¾å¤‡åç§°",
fun_type: "ObjC",
fun_name: "- orientation",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice orientation èŽ·å–è®¾å¤‡åç§°");
},
onLeave: function(ret) {}
},
{
name: "UIDevice identifierForVendor èŽ·å–è®¾å¤‡åç§°",
fun_type: "ObjC",
fun_name: "- identifierForVendor",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice identifierForVendor èŽ·å–è®¾å¤‡åç§°");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo hostName ä¸»æœºåç§°",
fun_type: "ObjC",
fun_name: "- hostName",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo hostName ä¸»æœºåç§°");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo operatingSystemVersionString æ“ä½œç³»ç»Ÿç‰ˆæœ¬1",
fun_type: "ObjC",
fun_name: "- operatingSystemVersionString",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo operatingSystemVersionString æ“ä½œç³»ç»Ÿç‰ˆæœ¬1");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo operatingSystemVersion æ“ä½œç³»ç»Ÿç‰ˆæœ¬2",
fun_type: "ObjC",
fun_name: "- operatingSystemVersion",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo operatingSystemVersion æ“ä½œç³»ç»Ÿç‰ˆæœ¬2");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo processorCount æ ¸å¿ƒæ•°",
fun_type: "ObjC",
fun_name: "- processorCount",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo processorCount æ ¸å¿ƒæ•°");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo activeProcessorCount å¯ç”¨æ ¸å¿ƒæ•°",
fun_type: "ObjC",
fun_name: "- activeProcessorCount",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo activeProcessorCount å¯ç”¨æ ¸å¿ƒæ•°");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo physicalMemory å†…å­˜æ€»é‡",
fun_type: "ObjC",
fun_name: "- physicalMemory",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo physicalMemory å†…å­˜æ€»é‡");
},
onLeave: function(ret) {}
},
{
name: "NSProcessInfo systemUptime ç³»ç»Ÿå¯åŠ¨æ—¶é—´",
fun_type: "ObjC",
fun_name: "- systemUptime",
fun_class: "NSProcessInfo",
onEnter: function(args) {
console.log("NSProcessInfo systemUptime ç³»ç»Ÿå¯åŠ¨æ—¶é—´");
},
onLeave: function(ret) {}
},
{
name: "CTCarrier carrierName SIMå¡è¿è¥å•†åç§°",
fun_type: "ObjC",
fun_name: "- carrierName",
fun_class: "CTCarrier",
onEnter: function(args) {
console.log("CTCarrier carrierName SIMå¡è¿è¥å•†åç§°");
},
onLeave: function(ret) {}
},
{
name: "CTCarrier mobileCountryCode SIMå¡è¿è¥å•†ä»£ç 1",
fun_type: "ObjC",
fun_name: "- mobileCountryCode",
fun_class: "CTCarrier",
onEnter: function(args) {
console.log("CTCarrier mobileCountryCode SIMå¡è¿è¥å•†ä»£ç 1");
},
onLeave: function(ret) {}
},
{
name: "CTCarrier mobileNetworkCode SIMå¡è¿è¥å•†ä»£ç 2",
fun_type: "ObjC",
fun_name: "- mobileNetworkCode",
fun_class: "CTCarrier",
onEnter: function(args) {
console.log("CTCarrier mobileNetworkCode SIMå¡è¿è¥å•†ä»£ç 2");
},
onLeave: function(ret) {}
},
{
name: "CTCarrier isoCountryCode SIMå¡è¿è¥å•†ä»£ç 3",
fun_type: "ObjC",
fun_name: "- isoCountryCode",
fun_class: "CTCarrier",
onEnter: function(args) {
console.log("CTCarrier isoCountryCode SIMå¡è¿è¥å•†ä»£ç 3");
},
onLeave: function(ret) {}
},
{
name: "NSLocale localeIdentifier è¯­è¨€çŽ¯å¢ƒæ ‡è¯†ç¬¦",
fun_type: "ObjC",
fun_name: "- localeIdentifier",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale localeIdentifier è¯­è¨€çŽ¯å¢ƒæ ‡è¯†ç¬¦");
},
onLeave: function(ret) {}
},
{
name: "NSLocale languageCode è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 1",
fun_type: "ObjC",
fun_name: "- languageCode",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale languageCode è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 1");
},
onLeave: function(ret) {}
},
{
name: "NSLocale collatorIdentifier è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 2",
fun_type: "ObjC",
fun_name: "- collatorIdentifier",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale collatorIdentifier è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 2");
},
onLeave: function(ret) {}
},
{
name: "NSLocale countryCode è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 3",
fun_type: "ObjC",
fun_name: "- countryCode",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale countryCode è¯­è¨€çŽ¯å¢ƒçš„è¯­è¨€ä»£ç 3");
},
onLeave: function(ret) {}
},
{
name: "NSLocale currencySymbol è¯­è¨€çŽ¯å¢ƒçš„è´§å¸ç¬¦å·",
fun_type: "ObjC",
fun_name: "- currencySymbol",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale currencySymbol è¯­è¨€çŽ¯å¢ƒçš„è´§å¸ç¬¦å·");
},
onLeave: function(ret) {}
},
{
name: "NSLocale currencyCode è¯­è¨€çŽ¯å¢ƒçš„è´§å¸ä»£ç ",
fun_type: "ObjC",
fun_name: "- currencyCode",
fun_class: "NSLocale",
onEnter: function(args) {
console.log("NSLocale currencyCode è¯­è¨€çŽ¯å¢ƒçš„è´§å¸ä»£ç ");
},
onLeave: function(ret) {}
},
{
name: "NSTimeZone systemTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯1",
fun_type: "ObjC",
fun_name: "systemTimeZone",
fun_class: "NSTimeZone",
onEnter: function(args) {
console.log("NSTimeZone systemTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯1");
},
onLeave: function(ret) {}
},
{
name: "NSTimeZone defaultTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯2",
fun_type: "ObjC",
fun_name: "defaultTimeZone",
fun_class: "NSTimeZone",
onEnter: function(args) {
console.log("NSTimeZone defaultTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯2");
},
onLeave: function(ret) {}
},
{
name: "NSTimeZone localTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯3",
fun_type: "ObjC",
fun_name: "localTimeZone",
fun_class: "NSTimeZone",
onEnter: function(args) {
console.log("NSTimeZone localTimeZone èŽ·å–æ—¶é—´ä¿¡æ¯3");
},
onLeave: function(ret) {}
},
{
name: "UIDevice batteryMonitoringEnabled èŽ·å–ç”µæ± ä¿¡æ¯1",
fun_type: "ObjC",
fun_name: "batteryMonitoringEnabled",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice batteryMonitoringEnabled èŽ·å–ç”µæ± ä¿¡æ¯1");
},
onLeave: function(ret) {}
},
{
name: "UIDevice batteryState èŽ·å–ç”µæ± ä¿¡æ¯2",
fun_type: "ObjC",
fun_name: "- batteryState",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice batteryState èŽ·å–ç”µæ± ä¿¡æ¯2");
},
onLeave: function(ret) {}
},
{
name: "UIDevice batteryLevel èŽ·å–ç”µæ± ä¿¡æ¯3",
fun_type: "ObjC",
fun_name: "- batteryLevel",
fun_class: "UIDevice",
onEnter: function(args) {
console.log("UIDevice batteryLevel èŽ·å–ç”µæ± ä¿¡æ¯3");
},
onLeave: function(ret) {}
},
]
console.log("")
console.warn("--------------------------------")
console.warn("|     App Call Information     |")
console.warn("--------------------------------")
for (var i = 0; i < _checks.length; i++) {
var _tmp_fun = null;
if (_checks[i]['fun_type'] == "native") {
_tmp_fun = Module.findExportByName(null, _checks[i].fun_name);
} else if (_checks[i]['fun_type'] == "ObjC") {
_tmp_fun = ObjC.classes[_checks[i].fun_class][_checks[i].fun_name];
if (_tmp_fun) {
_tmp_fun = _tmp_fun.implementation;
} else {
if (DEBUG) {
console.log(_checks[i].name);
}
continue;
}
} else {
continue;
}
Interceptor.attach(_tmp_fun, {
onEnter: _checks[i].onEnter,
onLeave: _checks[i].onLeave
})
}
}
function _exec() {
app_info();
app_transport_security();
protected_resources_permissions();
set_hook();
}
setImmediate(_exec);
