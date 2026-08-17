Java.perform(function() {
const StringBuilder = Java.use('java.lang.StringBuilder');
StringBuilder.toString.implementation = function() {
var res = this.toString();
return res;
};
});
