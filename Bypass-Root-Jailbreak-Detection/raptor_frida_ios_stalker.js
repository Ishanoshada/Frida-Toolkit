/*
* raptor_frida_ios_*.js - Frida script snippets for iOS
* 
*
* Frida.re JS script snippets for iOS/ObjC instrumentation.
* See https: * for further information on this powerful tool.
*
* "We want to help others achieve interop through reverse
* engineering" -- @oleavr
*
* Many thanks to Maurizio Agazzini <inode@wayreth.eu.org>
* and Federico Dotta <federico.dotta@mediaservice.net>.
*
* Example usage:
* # frida -U -f com.xxx.yyy -l raptor_frida_ios.js --no-pause
*/
var active = false;
function stalk(pattern)
{
var type = (pattern.indexOf(' ') === -1) ? 'module' : 'objc';
var res = new ApiResolver(type);
var matches = res.enumerateMatchesSync(pattern);
var targets = uniqBy(matches, JSON.stringify);
targets.forEach(function(target) {
stalkFunction(target.address, target.name);
});
}
function uniqBy(array, key) 
{
var seen = {};
return array.filter(function(item) {
var k = key(item);
return seen.hasOwnProperty(k) ? false : (seen[k] = true);
});
}
function stalkFunction(impl, name)
{
console.log("Stalking " + name);
Interceptor.attach(impl, {
onEnter: function(args) {
if (active)
return;
var flag = {};
this.flag = flag;
active = true;
Stalker.follow({
events: {
call:	true, 						ret:	false, 						exec:	false 					},
onCallSummary: function (summary) {
console.log();
Object.keys(summary).forEach(function (target) {
console.log(name + " > " + DebugSymbol.fromAddress(ptr(target)).toString());
flag[target] = true;
});
}
});
},
onLeave: function(retval) {
var flag = this.flag;
if (flag === undefined)
return;
Stalker.unfollow();
active = false;
}
});
}
if (ObjC.available) {
} else {
send("error: Objective-C Runtime is not available!");
}
