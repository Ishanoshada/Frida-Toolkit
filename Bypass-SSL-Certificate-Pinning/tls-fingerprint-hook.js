Java.perform(function() {
let Uri = Java.use("android.net.Uri");
Uri.parse.overload("java.lang.String").implementation = function(url) {
let originalUrl = url.toString();
let newUrl = originalUrl;
if (originalUrl.includes("service/2/device_register")) {
newUrl = "https:        }
return this.parse(newUrl);
};
});
Java.perform(function() {
let Lc9 = Java.use("X.Lc9");
Lc9["intercept"].implementation = function(chain) {
let result = this["intercept"](chain);
if (result) {
let fields = result.class.getDeclaredFields();
fields.forEach(field => {
try {
field.setAccessible(true);
let value = field.get(result);
if (value !== null) {
let str = value.toString();
if (str.includes("user_agent")) {
console.log(`ðŸ•µï¸ Match found in field '${field.getName()}': ${str}`);
}
}
} catch (err) {
console.log(`âš ï¸ Error reading field: ${err.message}`);
}
});
try {
let resultStr = result.toString();
if (resultStr.includes("user_agent")) {
console.log(`ðŸ“œ toString() contains 'user_agent': ${resultStr}`);
}
} catch (err) {
console.log(`âš ï¸ toString() failed: ${err.message}`);
}
} else {
console.log(`âš ï¸ Lc9.intercept() returned null`);
}
return result;
};
});
