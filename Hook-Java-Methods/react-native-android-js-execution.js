const package_name = 'com.example.app';
const f = new File(`/data/data/${package_name}/files/hermes-hook.js`, 'w');
f.write(`console.log(JSON.stringify(this.process)); console.log('hello from React Native!');`);
f.close();
if (Java.available) {
Java.perform(() => {
const waitForClass = (className, callback) => {
const interval = setInterval(() => {
try {
Java.use(className);
clearInterval(interval);
callback();
} catch (e) {
}
}, 10);
};
const hookJS = () => {
try {
const func = Java.use('com.facebook.react.bridge.CatalystInstanceImpl').loadScriptFromAssets;
func.implementation = function(assetManager, assetURL, z) {
this.loadScriptFromAssets(assetManager, assetURL, z);
this.loadScriptFromFile(`/data/data/${package_name}/files/hermes-hook.js`, `/data/data/${package_name}/files/hermes-hook.js`, z);
};
} catch (e) {
console.error(e);
}
};
waitForClass('com.facebook.soloader.SoLoader', () => {
let SoLoader = Java.use('com.facebook.soloader.SoLoader');
SoLoader.init.overload('android.content.Context', 'int').implementation = function(context, i) {
this.init(context, i);
hookJS();
};
SoLoader.init.overload('android.content.Context', 'int', 'com.facebook.soloader.SoFileLoader').implementation = function(context, i, soFileLoader) {
this.init(context, i, soFileLoader);
hookJS();
};
SoLoader.init.overload('android.content.Context', 'int', 'com.facebook.soloader.SoFileLoader', '[Ljava.lang.String;').implementation = function(context, i, soFileLoader, strArr) {
this.init(context, i, soFileLoader, strArr);
hookJS();
};
SoLoader.init.overload('android.content.Context', 'boolean').implementation = function(context, z) {
this.init(context, z);
hookJS();
};
});
});
}
