/* *******************************************************************
* Just a proof of concept supporting md5 only.
*
* Really easy to improve for multi-hashes.
******************************************************************* */
const md5_regex = /[a-fA-F0-9]{32}/gi;
const KEEP_ORIGINAL_CHARS = 4;
const REPLACEMENT_CHAR = '*';
function replace_string(string, lenToReplace, replacementChar) {
return string.substring(0, lenToReplace).split("").map(item => item = replacementChar).join("").concat(string.substring(lenToReplace, string.length));
}
function censor_hash(str, p1, offset, s) {
const lenToReplace = str.length - KEEP_ORIGINAL_CHARS;
return replace_string(str, lenToReplace, REPLACEMENT_CHAR);
}
var write_ptr = Module.findExportByName(null, "write")
Interceptor.attach(write_ptr, {
onEnter: function(args) {
const source_string = args[1].readUtf8String();
var replacement_string = source_string.replace(md5_regex, censor_hash);
args[1].writeUtf8String(replacement_string);
},
onLeave: function(retval) {
}
})
