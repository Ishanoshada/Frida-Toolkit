Java.perform(() => {
const Trace = Java.use('android.os.Trace');
const Thread = Java.use('java.lang.Thread');
const BinderProxy = Java.use('android.os.BinderProxy');
BinderProxy.transact.implementation = function(...args) {
const stacktrace = Thread.currentThread().getStackTrace();
const callingStack = stacktrace[3];
Trace.beginSection(callingStack.toString());
var result = this.transact(...args);
Trace.endSection();
return result;
};
})
