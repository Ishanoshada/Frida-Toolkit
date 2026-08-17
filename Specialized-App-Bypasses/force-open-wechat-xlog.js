Java.perform(() => {
Java.choose('com.tencent.mars.xlog.Xlog', {
onMatch: function(instance) {
console.log('set console xlog open')
instance.setConsoleLogOpen(0, true)
},
onComplete: function() {
}
})
})
