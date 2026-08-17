/*************************************************************************************
* Name: frida-ios-cipher
* OS: iOS
* 
* Source: https: * Desc: Intercept all cryptography-related functions on iOS with Frida Api.
* refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: * refs:https: **************************************************************************************/
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
const t = {
enable: !0,
highlighting: !0,
crypto: {
enable: !0,
maxDataLength: 240,
printStack: !1,
aes: !0,
des: !0,
"3des": !0,
cast: !0,
rc4: !0,
rc2: !0,
blowfish: !0,
filter: []
},
hash: {
enable: !1,
maxInputDataLength: 240,
printStack: !1,
md2: !0,
md4: !0,
md5: !0,
sha1: !0,
sha224: !0,
sha256: !0,
sha384: !0,
sha512: !0,
filter: []
},
hmac: {
enable: !1,
maxInputDataLength: 240,
printStack: !1,
sha1: !0,
md5: !0,
sha224: !0,
sha256: !0,
sha384: !0,
sha512: !0,
filter: []
},
pbkdf: {
enable: !1,
printStack: !1,
filter: []
}
}, o = {
resetColor: t.highlighting ? "[0m" : "",
bold: t.highlighting ? "[1m" : "",
dim: t.highlighting ? "[2m" : "",
italic: t.highlighting ? "[3m" : "",
underline: t.highlighting ? "[4m" : "",
blink: t.highlighting ? "[5m" : "",
reverse: t.highlighting ? "[7m" : "",
hidden: t.highlighting ? "[8m" : "",
black: t.highlighting ? "[30m" : "",
red: t.highlighting ? "[31m" : "",
green: t.highlighting ? "[32m" : "",
yellow: t.highlighting ? "[33m" : "",
blue: t.highlighting ? "[34m" : "",
magenta: t.highlighting ? "[35m" : "",
cyan: t.highlighting ? "[36m" : "",
white: t.highlighting ? "[37m" : "",
bgBlack: t.highlighting ? "[40m" : "",
bgRed: t.highlighting ? "[41m" : "",
bgGreen: t.highlighting ? "[42m" : "",
bgYellow: t.highlighting ? "[43m" : "",
bgBlue: t.highlighting ? "[44m" : "",
bgMagenta: t.highlighting ? "[45m" : "",
bgCyan: t.highlighting ? "[46m" : "",
bgWhite: t.highlighting ? "[47m" : ""
}, e = 16, n = 16, a = 16, l = 20, r = 28, i = 32, c = 48, s = 64, h = {
0: "kCCEncrypt",
1: "kCCEncrypt",
3: "kCCBoth"
}, C = {
0: "kCCAlgorithmAES",
1: "kCCAlgorithmDES",
2: "kCCAlgorithm3DES",
3: "kCCAlgorithmCAST",
4: "kCCAlgorithmRC4",
5: "kCCAlgorithmRC2",
6: "kCCAlgorithmBlowfish"
}, g = {
1: "kCCOptionPKCS7Padding",
2: "kCCOptionECBMode"
}, u = {
1: "kCCModeECB",
2: "kCCModeCBC",
3: "kCCModeCFB",
4: "kCCModeCTR",
5: "kCCModeF8",
6: "kCCModeLRW",
7: "kCCModeOFB",
8: "kCCModeXTS",
9: "kCCModeRC4",
10: "kCCModeCFB8",
11: "kCCModeGCM",
12: "kCCModeCCM"
}, m = {
0: "ccNoPadding",
1: "ccPKCS7Padding",
12: "ccCBCCTS3"
}, d = {
1: "kCCModeOptionCTR_LE",
2: "kCCModeOptionCTR_BE"
}, p = {
16: "kCCKeySizeAES128|kCCKeySizeMaxCAST",
24: "kCCKeySizeAES192|kCCKeySize3DES",
32: "kCCKeySizeAES256",
8: "kCCKeySizeDES|kCCKeySizeMinBlowfish",
5: "kCCKeySizeMinCAST",
1: "kCCKeySizeMinRC4|kCCKeySizeMinRC2",
512: "kCCKeySizeMaxRC4",
128: "kCCKeySizeMaxRC2",
56: "kCCKeySizeMaxBlowfish"
}, y = {
0: "kCCHmacAlgSHA1",
1: "kCCHmacAlgMD5",
2: "kCCHmacAlgSHA256",
3: "kCCHmacAlgSHA384",
4: "kCCHmacAlgSHA512",
5: "kCCHmacAlgSHA224"
}, f = {
0: l,
1: a,
2: i,
3: c,
4: s,
5: r
}, b = {
1: "kCCPRFHmacAlgSHA1",
2: "kCCPRFHmacAlgSHA224",
3: "kCCPRFHmacAlgSHA256",
4: "kCCPRFHmacAlgSHA384",
5: "kCCPRFHmacAlgSHA512"
}, k = {
2: "kCCPBKDF2"
};
function M(t, o = 240) {
try {
return null == t ? "\n" : "\n" + hexdump(t, {
length: o
}) + "\n";
} catch (o) {
return o instanceof Error && console.error("print_arg error:", o.stack), t + "\n";
}
}
function S(t) {
try {
return null == t ? 0 : parseInt(t.toString());
} catch (t) {
return t instanceof Error && console.error("pointerToInt error:", t.stack), 0;
}
}
function L(t, o) {
if (null == o || 0 == o.length) console.log(t); else {
var e = !1;
for (let n of o) if (null != n && 0 != n.length && (e = !0, t.indexOf(n) >= 0)) return void console.log(t);
e || console.log(t);
}
}
function I(t) {
var o = "";
const e = t.split("\n");
for (const t of e) {
const e = t.split("");
e.length <= 58 ? e.splice(e.length, 0, "\n") : (e.splice(e.length, 0, "|\n"), e.splice(59, 0, "|")), 
e.splice(0, 2), o += e.join("");
}
return o;
}
function E() {
function e(o) {
switch (o) {
case 0:
return t.crypto.aes;
case 1:
return t.crypto.des;
case 2:
return t.crypto["3des"];
case 3:
return t.crypto.cast;
case 4:
return t.crypto.rc4;
case 5:
return t.crypto.rc2;
case 6:
return t.crypto.blowfish;
default:
return !0;
}
}
let n = Module.findExportByName("libSystem.B.dylib", "CCCrypt");
if (null == n) return void console.error("CCCrypt func is null");
Interceptor.attach(n, {
onEnter: function(n) {
if (this.enable = e(n[1].toInt32()), !this.enable) return;
this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCrypt", o.resetColor), 
this.log = this.log.concat(o.yellow, "[+] CCOperation: " + h[n[0].toInt32()], o.resetColor, "\n"),
this.log = this.log.concat(o.yellow, "[+] CCAlgorithm: " + C[n[1].toInt32()], o.resetColor, "\n"),
this.log = this.log.concat(o.yellow, "[+] CCOptions: " + g[n[2].toInt32()], o.resetColor, "\n"),
this.log = this.log.concat(o.yellow, "[+] KeySize: " + p[n[4].toInt32()], o.resetColor, "\n"),
this.log = this.log.concat(o.cyan, "[+] Key: \n" + M(n[3], n[4].toInt32()), o.resetColor, "\n"),
this.log = this.log.concat(o.cyan, "[+] IV: \n" + M(n[5], 16), o.resetColor, "\n");
let a = S(n[7]), l = Math.min(a, t.crypto.maxDataLength);
this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data : \n", "\n"),
this.log = this.log.concat(M(n[6], l)), this.dataOut = n[8], this.dataOutLength = n[10];
},
onLeave: function(e) {
if (!this.enable) return;
let n = S(this.dataOutLength.readPointer()), a = Math.min(n, t.crypto.maxDataLength);
this.log = this.log.concat(o.magenta, "[+] Data out len: ", a, "/", n, "\n"), this.log = this.log.concat("[+] Data out: \n", M(this.dataOut, a), "\n", o.resetColor), 
t.crypto.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
this.log = this.log.concat(o.green, "[*] EXIT CCCrypt", o.resetColor, "\n");
}
});
let a = {}, l = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreate");
if (null == l) return void console.error("CCCryptorCreate func is null ");
Interceptor.attach(l, {
onEnter: function(t) {
this.params = [];
for (let o = 0; o < 7; o++) this.params.push(t[o]);
},
onLeave: function(t) {
let n = {
enable: e(this.params[1]),
cRef: this.params[6].readPointer(),
dataMap: [],
dataOutMap: [],
totalLen: 0,
totalOutLen: 0,
originalLen: 0,
originalOutLen: 0,
log: "",
finish: !1,
CCAlgorithm: "",
CCOperation: "",
CCMode: "",
CCKeySize: "",
CCModeOptions: "",
CCPadding: "",
Key: "",
Iv: "null",
Tweak: "",
TweakLen: "",
NumRounds: ""
};
a[S(n.cRef)] = n, n.enable && (n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreate", o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: " + C[this.params[1].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[4].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.cyan, "[+] Key: \n", n.Key = M(this.params[3], S(this.params[4])), o.resetColor, "\n"),
0 != S(this.params[5]) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n", n.Iv = M(this.params[5], 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor));
}
});
let r = Module.findExportByName("libSystem.B.dylib", "CCCryptorCreateWithMode");
if (null == r) return void console.error("CCCryptorCreateWithMode func is null ");
Interceptor.attach(r, {
onEnter: function(t) {
this.params = [];
for (let o = 0; o < 12; o++) this.params.push(t[o]);
},
onLeave: function(t) {
let n = {
enable: e(this.params[2]),
cRef: ptr(0),
dataMap: [],
dataOutMap: [],
totalLen: 0,
totalOutLen: 0,
originalLen: 0,
originalOutLen: 0,
log: "",
finish: !1,
CCAlgorithm: "",
CCOperation: "",
CCMode: "",
CCKeySize: "",
CCModeOptions: "",
CCPadding: "",
Key: "",
Iv: "null",
Tweak: "",
TweakLen: "",
NumRounds: ""
};
try {
n.cRef = this.params[11].readPointer();
} catch (t) {
return void console.log("Error: read CCCryptorRef failed:", t);
}
if (a[S(n.cRef)] = n, !n.enable) return;
n.log = n.log.concat(o.green, "[*] ENTER CCCryptorCreateWithMode", o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCOperation: ", n.CCOperation = h[this.params[0].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCMode: ", n.CCMode = u[this.params[1].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCAlgorithm: ", n.CCAlgorithm = C[this.params[2].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCPadding: ", n.CCPadding = m[this.params[3].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] CCModeOptions: ", n.CCModeOptions = d[this.params[10].toInt32()], o.resetColor, "\n");
let l = this.params[8].toInt32();
l > 0 && 0 != S(this.params[7]) && (n.log = n.log.concat(o.cyan, "[+] tweak len: ", n.TweakLen = l, o.resetColor, "\n"),
n.log = n.log.concat(o.cyan, "[+] tweak: \n", n.Tweak = M(this.params[7], S(this.params[8])), o.resetColor, "\n")),
n.log = n.log.concat(o.cyan, "[+] numRounds: ", n.NumRounds = this.params[9].toInt32(), o.resetColor, "\n"),
n.log = n.log.concat(o.cyan, "[+] Key len: ", n.CCKeySize = p[this.params[6].toInt32()], o.resetColor, "\n"),
n.log = n.log.concat(o.cyan, "[+] Key: \n", n.Key = M(this.params[5], S(this.params[6])), o.resetColor, "\n"),
0 != S(this.params[4]) ? n.log = n.log.concat(o.cyan, "[+] Iv:\n", n.Iv = M(this.params[4], 16), o.resetColor, "\n") : n.log = n.log.concat(o.red, "[!] Iv: null", "\n", o.resetColor);
}
});
let i = Module.findExportByName("libSystem.B.dylib", "CCCryptorUpdate");
if (null == i) return void console.error("CCCryptorUpdate func is null");
Interceptor.attach(i, {
onEnter: function(t) {
this.params = [];
for (let o = 0; o < 6; o++) this.params.push(t[o]);
},
onLeave: function (e) {
let n = a[S(this.params[0])];
if (null == n) {
n = {
enable: t.crypto.enable,
cRef: this.params[0],
dataMap: [],
dataOutMap: [],
totalLen: 0,
totalOutLen: 0,
originalLen: 0,
originalOutLen: 0,
log: "",
finish: !1,
CCAlgorithm: "",
CCOperation: "",
CCMode: "",
CCKeySize: "",
CCModeOptions: "",
CCPadding: "",
Key: "",
Iv: "",
Tweak: "",
TweakLen: "",
NumRounds: ""
}, n.log = n.log.concat(o.green, "[*] ENTER CCCryptorUpdate (note: Cannot be associated with an existing CCCryptorRef, so the data encryption parameters are unknown, However, a list of encryption instances that are currently still being processed can be provided here.)", o.resetColor, "\n"),
n.log = n.log.concat(o.blue, "[=] The list is as follows:", o.resetColor, "\n");
for (let t in a) {
let e = a[t];
null == e || e.finish || (n.log = n.log.concat(o.cyan, "[+] CCCryptorRef: ", e.cRef + "(pointer)", " dump:\n", o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCAlgorithm: ", e.CCAlgorithm, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCOperation: ", e.CCOperation, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCMode: ", e.CCMode, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCKeySize: ", e.CCKeySize, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCModeOptions: ", e.CCModeOptions, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : CCPadding: ", e.CCPadding, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : Key: ", e.Key, o.resetColor, "\n"), n.log = n.log.concat(o.yellow, "[+] : Iv: ", e.Iv, o.resetColor, "\n"),
parseInt(e.TweakLen) > 0 && (n.log = n.log.concat(o.yellow, "[+] : TweakLen: ", e.TweakLen, o.resetColor, "\n"),
n.log = n.log.concat(o.yellow, "[+] : Tweak: ", e.Tweak, o.resetColor, "\n")), n.log = n.log.concat(o.yellow, "[+] : NumRounds: ", e.NumRounds, o.resetColor, "\n"));
}
n.log = n.log.concat(o.blue, "[=] End of list", o.resetColor, "\n"), a[S(this.params[0])] = n;
}
if (!n.enable) return;
n.originalLen += this.params[2].toInt32();
let l = t.crypto.maxDataLength - n.totalLen, r = S(this.params[2]);
if (r > 0 && l > 0) {
let t = Math.min(r, l), o = Memory.alloc(t);
Memory.copy(o, this.params[1], t), n.dataMap.push({
data: o,
len: t
}), n.totalLen += t;
}
let i = t.crypto.maxDataLength - n.totalOutLen, c = S(this.params[5].readPointer());
if (n.originalOutLen += c, c > 0 && i > 0) {
let t = Math.min(c, i), o = Memory.alloc(t);
Memory.copy(o, this.params[3], t), n.dataOutMap.push({
data: o,
len: t
}), n.totalOutLen += t;
}
}
});
let c = Module.findExportByName("libSystem.B.dylib", "CCCryptorFinal");
null != c ? Interceptor.attach(c, {
onEnter: function(t) {
this.params = [];
for (let o = 0; o < 4; o++) this.params.push(t[o]);
},
onLeave: function(e) {
let n = a[S(this.params[0])];
if (null == n) return void console.error("CCCryptorFinal model is null");
if (!n.enable) return;
if (n.totalOutLen < t.crypto.maxDataLength) {
let o = t.crypto.maxDataLength - n.totalOutLen, e = S(this.params[3].readPointer());
if (n.originalOutLen += e, e > 0 && o > 0) {
let t = Math.min(e, o), a = Memory.alloc(t);
Memory.copy(a, this.params[1], t), n.dataOutMap.push({
data: a,
len: t
}), n.totalOutLen += t;
}
}
let l = Memory.alloc(n.totalLen);
var r = 0;
n.dataMap.forEach((function(t) {
Memory.copy(l.add(r), t.data, t.len), r += t.len;
}));
let i = Memory.alloc(n.totalOutLen);
var c = 0;
n.dataOutMap.forEach((function(t) {
Memory.copy(i.add(c), t.data, t.len), c += t.len;
})), n.log = n.log.concat("[+] Data len: " + n.totalLen + "/" + n.originalLen + "\n"),
n.log = n.log.concat("[+] Data : \n", M(l, n.totalLen), "\n"), n.log = n.log.concat(o.magenta, "[+] Data out len: " + n.totalOutLen + "/" + n.originalOutLen + "\n"),
n.log = n.log.concat("[+] Data out: \n", M(i, n.totalOutLen), "\n", o.resetColor),
t.crypto.printStack && (n.log = n.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
n.log = n.log.concat(o.green, "[*] EXIT CCCryptorFinal ", o.resetColor, "\n"), n.finish = !0,
L(n.log, t.crypto.filter);
}
}) : console.error("CCCryptorFinal func is null");
}
function A(e, n) {
let a = Module.findExportByName("libSystem.B.dylib", e);
null != a ? (Interceptor.attach(a, {
onEnter: function(n) {
this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", e, o.resetColor, "\n");
let a = n[1].toInt32(), l = Math.min(a, t.hash.maxInputDataLength);
this.log = this.log.concat("[+] Data len: ", l, "/", a, "\n"), this.log = this.log.concat("[+] Data: \n", M(n[0], l), "\n");
},
onLeave: function (a) {
this.log = this.log.concat(o.magenta, "[+] Data out len: " + n, o.resetColor, "\n"),
this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(a, n), o.resetColor, "\n"),
t.hash.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
this.log = this.log.concat(o.green, "[*] EXIT ", e, o.resetColor, "\n"), L(this.log, t.hash.filter);
}
}), function() {
let a = {}, l = Module.findExportByName("libSystem.B.dylib", e + "_Init");
if (null == l) return void console.error(e + "_Init func is null");
Interceptor.attach(l, {
onEnter: function(t) {
let n = {
ctx: t[0],
dataMap: [],
totalLen: 0,
originalLen: 0,
log: ""
};
a[S(t[0])] = n, n.log = n.log.concat(o.green, "[*] ENTER " + e + "_Init\n", o.resetColor);
}
});
let r = Module.findExportByName("libSystem.B.dylib", e + "_Update");
if (null == r) return void console.error(e + "_Update func is null");
Interceptor.attach(r, {
onEnter: function(o) {
let e = a[S(o[0])];
if (null == e) return void console.error("model is null");
let n = S(o[2]), l = t.hash.maxInputDataLength - e.totalLen;
if (n > 0 && l > 0) {
e.originalLen += n;
let t = Math.min(n, l), a = Memory.alloc(t);
Memory.copy(a, o[1], t), e.dataMap.push({
data: a,
len: t
}), e.totalLen += t;
}
}
});
let i = Module.findExportByName("libSystem.B.dylib", e + "_Final");
null != i ? Interceptor.attach(i, {
onEnter: function(t) {
this.mdSha = t[0], this.ctxSha = t[1];
},
onLeave: function (l) {
let r = a[S(this.ctxSha)];
if (null == r) return void console.error(e + "_Final model is null");
if (r.totalLen <= 0) return void console.error("totalLen :", r.totalLen);
let i = Memory.alloc(r.totalLen);
var c = 0;
r.dataMap.forEach((function(t) {
Memory.copy(i.add(c), t.data, t.len), c += t.len;
})), r.log = r.log.concat("[+] Data len: " + r.totalLen + "/" + r.originalLen + "\n"),
r.log = r.log.concat("[+] Data :\n"), r.log = r.log.concat(M(i, r.totalLen), "\n"),
0 !== S(this.mdSha) ? (r.log = r.log.concat(o.magenta, "[+] Data out len: " + n + "\n"),
r.log = r.log.concat("[+] Data out:\n"), r.log = r.log.concat(M(ptr(this.mdSha), n), "\n", o.resetColor)) : r.log = r.log.concat(o.red, "[!]: Data out: null\n", o.resetColor),
t.hash.printStack && (r.log = r.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
r.log = r.log.concat(o.green, "[*] EXIT " + e + "_Final\n", o.resetColor), L(r.log, t.hash.filter);
}
}) : console.error(e + "_Final func is null");
}()) : console.error(e + " func is null");
}
function D() {
function e(o) {
switch (o) {
case 0:
return t.hmac.sha1;
case 1:
return t.hmac.md5;
case 2:
return t.hmac.sha256;
case 3:
return t.hmac.sha384;
case 4:
return t.hmac.sha512;
case 5:
return t.hmac.sha224;
default:
return !0;
}
}
let n = "CCHmac", a = Module.findExportByName("libSystem.B.dylib", n);
null != a ? (Interceptor.attach(a, {
onEnter: function (a) {
if (this.enable = e(a[0].toInt32()), !this.enable) return;
this.mdLen = f[a[0].toInt32()], this.log = "", this.log = this.log.concat(o.green, "[*] ENTER ", n, "\n"),
this.log = this.log.concat(o.yellow, "[+] Algorithm: ", y[a[0].toInt32()], "\n", o.resetColor),
this.log = this.log.concat(o.cyan, "[+] Key len: ", a[2].toInt32(), "\n"), this.log = this.log.concat(o.cyan, "[+] Key : \n", M(a[1], a[2].toInt32()), "\n", o.resetColor);
let l = a[4].toInt32(), r = Math.min(l, t.hmac.maxInputDataLength);
this.log = this.log.concat("[+] Data len: ", r, "/", l, "\n"), this.log = this.log.concat("[+] Data: \n", M(a[3], r), "\n"),
this.macOut = a[5];
},
onLeave: function(e) {
this.enable && (this.log = this.log.concat(o.magenta, "[+] Data out len: " + this.mdLen, o.resetColor, "\n"),
this.log = this.log.concat(o.magenta, "[+] Data out:\n", M(this.macOut, this.mdLen), o.resetColor, "\n"),
t.hmac.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
this.log = this.log.concat(o.green, "[*] EXIT ", n, o.resetColor, "\n"), L(this.log, t.hmac.filter));
}
}), function() {
let a = {}, l = Module.findExportByName("libSystem.B.dylib", n + "Init");
if (null == l) return void console.error(n + "Init func is null");
Interceptor.attach(l, {
onEnter: function(t) {
let l = {
ctx: t[0],
dataMap: [],
totalLen: 0,
originalLen: 0,
log: "",
mdLen: f[t[1].toInt32()],
enable: e(t[1].toInt32())
};
a[S(t[0])] = l, l.enable && (l.log = l.log.concat(o.green, "[*] ENTER " + n + "Init\n", o.resetColor),
l.log = l.log.concat(o.yellow, "[+] Algorithm: " + y[t[1].toInt32()] + "\n", o.resetColor),
l.log = l.log.concat(o.cyan, "[+] Key len: " + t[3].toInt32() + o.resetColor + "\n"),
l.log = l.log.concat(o.cyan, "[+] Key: \n" + M(t[2], S(t[3])) + "\n", o.resetColor));
}
});
let r = Module.findExportByName("libSystem.B.dylib", n + "Update");
if (null == r) return void console.error(n + "Update func is null");
Interceptor.attach(r, {
onEnter: function(o) {
let e = a[S(o[0])];
if (null == e) return void console.error(n + "Update model is null");
if (!e.enable) return;
let l = S(o[2]), r = t.hmac.maxInputDataLength - e.totalLen;
if (l > 0 && r > 0) {
e.originalLen += l;
let t = Math.min(l, r), n = Memory.alloc(t);
Memory.copy(n, o[1], t), e.dataMap.push({
data: n,
len: t
}), e.totalLen += t;
}
}
});
let i = Module.findExportByName("libSystem.B.dylib", n + "Final");
null != i ? Interceptor.attach(i, {
onEnter: function(t) {
this.mdOut = t[1], this.ctx = t[0];
},
onLeave: function(e) {
let l = a[S(this.ctx)];
if (null == l) return void console.error(n + "Final model is null");
if (!l.enable) return;
if (l.totalLen <= 0) return void console.error("totalLen :", l.totalLen);
let r = Memory.alloc(l.totalLen);
var i = 0;
l.dataMap.forEach((function (t) {
Memory.copy(r.add(i), t.data, t.len), i += t.len;
})), l.log = l.log.concat("[+] Data len: " + l.totalLen + "/" + l.originalLen + "\n"),
l.log = l.log.concat("[+] Data :\n"), l.log = l.log.concat(M(r, l.totalLen), "\n"),
l.log = l.log.concat(o.magenta, "[+] Data out len: " + l.mdLen + "\n"), l.log = l.log.concat("[+] Data out:\n"),
l.log = l.log.concat(M(ptr(this.mdOut), l.mdLen), "\n", o.resetColor), t.hmac.printStack && (l.log = l.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
l.log = l.log.concat(o.green, "[*] EXIT " + n + "Final\n", o.resetColor), L(l.log, t.hmac.filter);
}
}) : console.error(n + "Final func is null");
}()) : console.error(n + " func is null");
}
function B() {
let e = Module.findExportByName("libSystem.B.dylib", "CCKeyDerivationPBKDF");
if (null == e) return void console.error("CCKeyDerivationPBKDF func is null");
Interceptor.attach(e, {
onEnter: function(t) {
this.params = [];
for (let o = 0; o < 9; o++) this.params.push(t[o]);
},
onLeave: function(e) {
var n = "";
n = (n = (n = (n = (n = (n = (n = (n = (n = (n = n.concat(o.green, "[*] ENTER CCKeyDerivationPBKDF", o.resetColor, "\n")).concat(o.yellow, "[+] Algorithm: ", k[this.params[0].toInt32()], "\n", o.resetColor)).concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[this.params[5].toInt32()], "\n", o.resetColor)).concat(o.cyan, "[+] Rounds: ", String(S(this.params[6])), "\n", o.resetColor)).concat(o.cyan, "[+] Password len: ", this.params[2].toInt32(), "\n")).concat(o.cyan, "[+] Password : \n", M(this.params[1], this.params[2].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] Salt len: ", this.params[4].toInt32(), "\n")).concat(o.cyan, "[+] Salt : \n", M(this.params[3], this.params[4].toInt32()), "\n", o.resetColor)).concat(o.cyan, "[+] DerivedKey len: ", this.params[8].toInt32(), "\n")).concat(o.cyan, "[+] DerivedKey : \n", M(this.params[7], this.params[8].toInt32()), "\n", o.resetColor),
t.pbkdf.printStack && (n = n.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")),
L(n = n.concat(o.green, "[*] EXIT CCKeyDerivationPBKDF", o.resetColor, "\n"), t.pbkdf.filter);
}
});
let n = Module.findExportByName("libSystem.B.dylib", "CCCalibratePBKDF");
null != n ? Interceptor.attach(n, {
onEnter: function(t) {
this.log = "", this.log = this.log.concat(o.green, "[*] ENTER CCCalibratePBKDF", o.resetColor, "\n"),
this.log = this.log.concat(o.yellow, "[+] Algorithm: ", k[t[0].toInt32()], "\n", o.resetColor),
this.log = this.log.concat(o.yellow, "[+] PseudoRandomAlgorithm: ", b[t[3].toInt32()], "\n", o.resetColor),
this.log = this.log.concat(o.cyan, "[+] Password len: ", t[1].toInt32(), o.resetColor, "\n"), 
this.log = this.log.concat(o.cyan, "[+] Salt len: ", t[2].toInt32(), o.resetColor, "\n"), 
this.log = this.log.concat(o.cyan, "[+] DerivedKey len: ", t[4].toInt32(), o.resetColor, "\n"),
this.log = this.log.concat(o.cyan, "[+] Msec : ", S(t[5]), o.resetColor, "\n");
},
onLeave: function(e) {
this.log = this.log.concat(o.cyan, "[+] IterNum : \n", S(e), o.resetColor, "\n"), 
t.pbkdf.printStack && (this.log = this.log.concat(o.blue, "[+] stack:\n", Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join("\n"), o.resetColor, "\n")), 
this.log = this.log.concat(o.green, "[*] EXIT CCCalibratePBKDF", o.resetColor, "\n"),
L(this.log, t.pbkdf.filter);
}
}) : console.error("CCCalibratePBKDF func is null");
}
t.enable && (t.crypto.enable && E(), t.hash.enable && (t.hash.sha1 && A("CC_SHA1", 20), 
t.hash.sha224 && A("CC_SHA224", 28), t.hash.sha256 && A("CC_SHA256", 32), t.hash.sha384 && A("CC_SHA384", 48), 
t.hash.sha512 && A("CC_SHA512", 64), t.hash.md2 && A("CC_MD2", 16), t.hash.md4 && A("CC_MD4", 16), 
t.hash.md5 && A("CC_MD5", 16), t.hmac.enable && D(), t.pbkdf.enable && B()));
},{}]},{},[1])
