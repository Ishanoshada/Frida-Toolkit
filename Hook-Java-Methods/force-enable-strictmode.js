Java.perform(function() {
const looperClz = Java.use('android.os.Looper')
const handlerClz = Java.use('android.os.Handler')
const runnableIntf = Java.use('java.lang.Runnable')
const strictmode = Java.use('android.os.StrictMode')
const tpBuilder = Java.use('android.os.StrictMode$ThreadPolicy$Builder')
const vmpBuilder = Java.use('android.os.StrictMode$VmPolicy$Builder')
var mainLooper = looperClz.getMainLooper()
var handler = handlerClz.$new(mainLooper)
var runnableClz = Java.registerClass({
name: 'EnforceStrictModeRunnable',
implements: [runnableIntf],
methods: {
run: function() {
const tp = tpBuilder.$new().detectAll().penaltyLog().penaltyFlashScreen().build()
const vmp = vmpBuilder.$new().detectAll().penaltyLog().build()
strictmode.setThreadPolicy(tp)
strictmode.setVmPolicy(vmp)
}
}
});
handler.post(runnableClz.$new());
})
