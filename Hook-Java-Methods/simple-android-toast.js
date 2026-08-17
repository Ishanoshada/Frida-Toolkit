/* 
Simple Android Toast
https:*/
Java.perform(function() {
var context = Java.use('android.app.ActivityThread').currentApplication().getApplicationContext();
Java.scheduleOnMainThread(function() {
var toast = Java.use("android.widget.Toast");
toast.makeText(context, Java.use("java.lang.String").$new("This is works!"), 1).show();
});
});
