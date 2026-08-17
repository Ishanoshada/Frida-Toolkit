Java.perform(function() {
var currentActivity;
var Activity = Java.use('android.app.Activity');
Activity.onCreate.overload('android.os.Bundle').implementation = function(savedInstanceState) {
this.onCreate.overload('android.os.Bundle').call(this, savedInstanceState);
currentActivity = this;
console.log("The current Activity is: " + currentActivity.getClass().getName());
var stack = Java.use("android.util.Log").getStackTraceString(Java.use("java.lang.Exception").$new())
console.log("Here is your stacktrace: " + stack);
}
});
