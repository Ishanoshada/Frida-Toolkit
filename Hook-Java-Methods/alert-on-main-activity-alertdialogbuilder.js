Java.perform(function() {
var ActivityThread = Java.use("android.app.ActivityThread");
var AlertDialogBuilder = Java.use("android.app.AlertDialog$Builder");
var DialogInterfaceOnClickListener = Java.use('android.content.DialogInterface$OnClickListener');
const options = [
"Yeah",
"Test",
"Yeah",
"AAAAA"
];
Java.use("android.app.Activity").onCreate.overload("android.os.Bundle").implementation = function(savedInstanceState) {
var application = ActivityThread.currentApplication();
var launcherIntent = application.getPackageManager().getLaunchIntentForPackage(application.getPackageName());
var launchActivityInfo = launcherIntent.resolveActivityInfo(application.getPackageManager(), 0);
if (launchActivityInfo.name.value === this.getComponentName().getClassName()) {
var alert = AlertDialogBuilder.$new(this);
alert.setTitle(Java.use("java.lang.StringBuilder").$new("yes title"));
alert.setSingleChoiceItems(Java.array('java.lang.CharSequence', options), 0, Java.registerClass({
name: 'dialogue.OnClickListenerSingleChoice',
implements: [DialogInterfaceOnClickListener],
methods: {
getName: function() {
return 'OnClickListenerSingleChoice';
},
onClick: function(dialog, value) {
console.log(options[value])
}
}
}).$new());
alert.setNegativeButton(Java.use("java.lang.StringBuilder").$new("test button"), Java.registerClass({
name: 'dialogue.OnClickListenerNegative',
implements: [DialogInterfaceOnClickListener],
methods: {
getName: function() {
return 'OnClickListenerNegative';
},
onClick: function(dialog, value) {
console.log(options[value])
}
}
}).$new());
alert.create().show();
}
return this.onCreate.overload("android.os.Bundle").call(this, savedInstanceState);
};
});
