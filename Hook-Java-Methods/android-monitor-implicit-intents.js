Java.perform(function() {
var Activity = Java.use("android.app.Activity");
Activity.startActivityForResult.overload('android.content.Intent', 'int').implementation = function(intent, requestCode) {
this.startActivityForResult(intent, requestCode);
var action = intent.getAction();
var data = intent.getDataString();
console.log("startActivityForResult called with:");
console.log("Request Code: " + requestCode);
console.log("Action: " + action);
if (data !== null) {
console.log("Data: " + data);
} else {
console.log("No data associated with the intent.");
}
var extras = intent.getExtras();
if (extras !== null) {
var keys = extras.keySet().toArray();
console.log("Extras: ");
for (var i = 0; i < keys.length; i++) {
var key = keys[i];
console.log(key + ": " + extras.get(key));
}
} else {
console.log("No extras in the intent.");
}
};
Activity.onActivityResult.overload('int', 'int', 'android.content.Intent').implementation = function(requestCode, resultCode, data) {
this.onActivityResult(requestCode, resultCode, data);
console.log("onActivityResult called with:");
console.log("Request Code: " + requestCode);
console.log("Result Code: " + resultCode);
if (data !== null) {
var action = data.getAction();
var dataString = data.getDataString();
console.log("Returned Intent Action: " + action);
if (dataString !== null) {
console.log("Returned Intent Data: " + dataString);
} else {
console.log("No data associated with the returned intent.");
}
var extras = data.getExtras();
if (extras !== null) {
var keys = extras.keySet().toArray();
console.log("Returned Extras: ");
for (var i = 0; i < keys.length; i++) {
var key = keys[i];
console.log(key + ": " + extras.get(key));
}
} else {
console.log("No extras in the returned intent.");
}
} else {
console.log("No returned intent data.");
}
};
});
