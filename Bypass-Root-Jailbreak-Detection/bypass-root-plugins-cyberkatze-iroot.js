Java.perform(function() {
let IRoot = Java.use("de.cyberkatze.iroot.IRoot");
IRoot["execute"].implementation = function(str, jSONArray, callbackContext) {
this["execute"](str, jSONArray, callbackContext);
console.log(`Bypass Root [!]`);
return false;
};
});
