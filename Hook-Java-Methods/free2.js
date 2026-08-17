Java.perform(function() {
let BoxUtil = Java.use("cn.tongdun.android.shell.utils.BoxUtil");
BoxUtil.limitBox.implementation = function(jSONObject, i){
let ret = this.limitBox(jSONObject, i);
console.log(JSON.stringify(jSONObject));
return ret;
};
});
