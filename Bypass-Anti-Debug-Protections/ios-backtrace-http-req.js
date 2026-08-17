var resolver = new ApiResolver('objc');
resolver.enumerateMatches('-[* initWithURL*]', {
onMatch: function(match) {
Interceptor.attach(ptr(match.address), {
onEnter: function(args) {
var url = new ObjC.Object(args[2]);
console.log('New req to ' + url.toString() + ':\n' +
Thread.backtrace(this.context, Backtracer.ACCURATE)
.map(DebugSymbol.fromAddress).join('\n') + '\n');
}
});
console.log('[i] ' + match.name + ' hooked.');
},
onComplete: function() {  }
});
