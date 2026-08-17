function bypass_connectivity_plus_byHookSearch(searchstring) {
var type = "module";
var res = new ApiResolver(type);
var matches = res.enumerateMatchesSync(searchstring);
var targets = uniqBy(matches, JSON.stringify);
var target = targets[0];
console.log("[!] Found at address: " + target.address + ", name: " + target.name);
Interceptor.attach(target.address, {
onEnter: function(args) {
console.log("[!] Hook: " + target.address + ", name: " + target.name);
},
onLeave: function(retval) {
console.log("\t[!]  retval: " + retval);
if (retval == 0x3) {
retval.replace(0x3);                 console.log("\t\t[+] Wi-Fi check bypassed");
}
}
});
}
if (ObjC.available) {   
bypass_connectivity_plus_byHookSearch("exports:connectivity_plus!*current*Type*");
} else {
send("error: Objective-C Runtime is not available!");
}
