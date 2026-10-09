#!/usr/bin/env python3
import json
import os.path
import sys
from subprocess import run
from tempfile import NamedTemporaryFile
import frida
from pycparser.c_ast import Decl, Enum, Enumerator, IdentifierType, PtrDecl, Struct, TypeDecl, Typedef
from pycparser.c_generator import CGenerator
from pycparser.c_parser import CParser
dev = next(iter(dev for dev in frida.enumerate_devices() if dev.type == 'tether'))
session = dev.attach(sys.argv[1])
script = session.create_script(r"""(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
var _set = require("babel-runtime/core-js/set");
var _set2 = _interopRequireDefault(_set);
var _getIterator2 = require("babel-runtime/core-js/get-iterator");
var _getIterator3 = _interopRequireDefault(_getIterator2);
var _log = require("babel-runtime/core-js/math/log2");
var _log2 = _interopRequireDefault(_log);
var _map2 = require("babel-runtime/core-js/map");
var _map3 = _interopRequireDefault(_map2);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var convention = void 0;
if (Process.arch === "arm64" && Process.platform === "darwin") {
convention = {
selfRegister: 'x20',
errorRegister: 'x21',
indirectResultRegister: 'x8',
maxInlineArgument: 128,         maxInlineReturn: 4 * Process.pointerSize,         firstArgRegister: 'x0',
maxVoluntaryInt: Process.pointerSize,
maxInt: 8,
maxIntAlignment: 8
};
} else if (Process.arch === "arm" && Process.platform === "darwin") {
convention = {
selfRegister: 'r10',
errorRegister: 'r8',
indirectResultRegister: undefined,         maxInlineArgument: 64,         maxInlineReturn: 4 * Process.pointerSize,         firstArgRegister: 'r0',
maxVoluntaryInt: Process.pointerSize,
maxInt: 8,
maxIntAlignment: 4
};
} else {
throw new Error("unknown platform");
}
var errors = new _map3.default();
var storeError = new NativeCallback(function storeError() {
errors.set(Process.getCurrentThreadId(), callStack);
}, 'void', ['pointer']);
function checkTrampolineError() {
var id = Process.getCurrentThreadId();
var val = errors.get(id, callStack);
errors.remove(id);
return val;
}
function makeCallTrampoline(func, withError, self, indirectResult) {
if (!withError && !self && !indirectResult) return { callAddr: func };
var buf = Memory.alloc(Process.pageSize);
var wr = void 0,
putBlxImm = void 0;
if (Process.arch === "arm64") {
wr = new Arm64Writer(buf);
putBlxImm = 'putBlImm';
} else {
wr = new ThumbWriter(buf);
putBlxImm = 'putBlxImm';
}
if (withError) wr.putLdrRegAddress(convention.errorRegister, ptr(0));
if (self) wr.putLdrRegAddress(convention.selfRegister, self);
if (indirectResult) {
if (!convention.indirectResultRegister) throw new Error("only provide the indirect result pointer on platforms with a specific register for it!");
wr.putLdrRegAddress(convention.indirectResultRegister, indirectResult);
}
if (withError) {
wr[putBlxImm](func);
if (Process.arch === "arm64") wr.putTstRegImm(convention.errorRegister, ptr(0));else wr.putCmpRegImm(convention.errorRegister, ptr(0));
wr.putBCondLabel('ne', 'err_case');
wr.putRet(); 
wr.putLabel('err_case');
wr.putMovRegReg(convention.firstArgRegister, convention.errorRegister);
wr[putBlxImm](storeError);
wr.putRet();
} else {
wr.putBImm(func);
}
wr.flush();
wr.dispose();
Memory.protect(buf, Process.pageSize, 'r-x');
var callAddr = void 0;
if (Process.arch === "arm64") callAddr = buf;else callAddr = buf.or(ptr(1));
return {
'callAddr': callAddr,
'_buf': buf
};
};
function semanticLowering(signature) {
function typeNeedsIndirection(t) {
return t.kind === "Existential";
}
function addArg(type, indirect, ownership, target, special) {
if (!indirect && type.kind === "Tuple") {
type.tupleElements().forEach(function (e) {
return addArg(e.type, indirect, ownership, target, special);
});
} else {
indirect = indirect || typeNeedsIndirection(type);
target.push({ type: type, indirect: indirect, ownership: ownership, special: special });
}
}
var args = [];
var swiftArgs = signature.getArguments();
for (var i = 0; i < swiftArgs.length; i++) {
var indirect = swiftArgs[i].inout;
var isSelf = i === 0 && false;         addArg(swiftArgs[i].type, indirect, args, indirect ? "keep" : "transfer", isSelf ? "self" : null);
}
var rets = [];
addArg(signature.returnType, false, "return_take", rets, null);
if (signature.flags.doesThrow) {
addArg(Swift._typesByName.get("Swift.Error"), true, "return_take", rets, "error");
}
return { args: args, rets: rets };
}
function physicalLowering(semantic) {
var legalTypesAndOffsets = [];
var specialCases = [];
var pointerType = "int" + Process.pointerSize * 8;
function nextPowerOf2(val) {
return Math.pow(2, Math.ceil((0, _log2.default)(val)));
}
function minimalInt(numValues) {
var log2 = Math.ceil((0, _log2.default)(numValues));
var nextMultipleOf8 = 8 + log2 - log2 % 8;
return nextPowerOf2(nextMultipleOf8);
}
function addEmpty(start, end, res) {
res.push(["empty", start, end]);
}
function addSwiftType(type, offset, res) {
if (res === undefined) res = [];
switch (type.kind) {
case "Class":
case "ObjCClassWrapper":
case "ForeignClass":
case "Metatype":
case "Existential":
res.push([pointer, offset, offset + Process.pointerSize]);
break;
case "Struct":
{
var prevEnd = offset;
type.fields().forEach(function (f) {
var offs = offset + f.offset;
if (prevEnd < offs) addEmpty(prevEnd, offs, res);
if (f.weak) {
res.push([pointer, offs, offs + Process.pointerSize]);
prevEnd = offs + Process.pointerSize;
} else {
addSwiftType(f.type, offs, res);
prevEnd = offs + f.type.canonicalType.valueWitnessTable.size;
}
});
var end = offset + type.canonicalType.valueWitnessTable.size;
if (prevEnd < end) addEmpty(prevEnd, offs, res);
break;
}
case "Tuple":
{
var _prevEnd = offset;
type.tupleElements().forEach(function (e) {
var offs = offset + e.offset;
if (_prevEnd < offs) addEmpty(_prevEnd, offs, res);
addSwiftType(e.type, offs, res);
_prevEnd = offs + e.type.canonicalType.valueWitnessTable.size;
});
var _end = offset + type.canonicalType.valueWitnessTable.size;
if (_prevEnd < _end) addEmpty(_prevEnd, offs, res);
break;
}
case "ErrorObject":
case "ExistentialMetatype":
case "Function":
throw new Error("conversion to legal type for types of '" + type.kind + "' not yet implemented");             case "Optional":
case "Enum":
{
var numPayloads = type.nominalType.enum_.getNumPayloadCases();
var numEmpty = type.nominalType.enum_.getNumEmptyCases();
var enumSize = type.canonicalType.valueWitnessTable.size;
if (numPayloads === 0) {
res.push(["int" + enumSize * 8, offset, offset + enumSize]);
} else if (numPayloads === 1) {
var payloadType = type.enumCases()[0].type;
addSwiftType(payloadType, offset, res);                         var payloadVwt = payloadType.canonicalType.valueWitnessTable;
var extraInhabitants = payloadVwt.extraInhabitantFlags.getNumExtraInhabitants();
if (extraInhabitants < numEmpty) {
var tagSize = minimalInt(numEmpty + numPayloads);
var _offs = offset + payloadVwt.size;
res.push(["int" + tagSize, _offs, _offs + tagSize]);
} else {
res.push(["opaque", offset, offset + enumSize]);
}
} else {
var enumCases = type.enumCases();
var largestSize = enumCases.reduce(function (s, c) {
if (c.type) return Math.max(s, c.type.canonicalType.valueWitnessTable.size);else return s;
}, 0);
if (enumSize > largestSize) {
res.push(["opaque", offset + largestSize, offset + enumSize]);
}
for (var i = 0; i < enumCases.length; i++) {
if (enumCases[i].type) {
addSwiftType(enumCases[i].type, offset, res);
}
}
if (numEmpty > 1) {
var _tagSize = minimalInt(numEmpty);
res.push(["opaque", offset, offset + _tagSize]);
}
}
break;
}
case "Opaque":
{
var t = type.getCType();
if (t === undefined) throw new Error("the equivalent C type for type '" + type + "' is not known.");
if (t === "pointer") t = pointerType;
if (t.startsWith("uint")) t = t.slice(1);
if (t.startsWith("int") && parseInt(t.slice(3)) > convention.maxInt) t = "opaque";
container.push([t, offset]);
break;
}
default:
throw new Error("type '" + type + "' is of unknown kind '" + type.kind + "'");
}
}
for (var i = 0; i < semantic.length; i++) {
if (semantic[i].special) {
specialCases.push(semantic[i].special);
continue;
}
if (semantic[i].indirect) legalTypesAndOffsets.push([pointerType, 0, Process.pointerSize]);else legalTypesAndOffsets.push(addSwiftType(semantic[i].type, 0));
}
function combineAdjacent() {
var maps = {
empty: new _map3.default(),
opaque: new _map3.default()
};
for (var _i = 0; _i < legalTypesAndOffsets.length; _i++) {
var legalType = legalTypesAndOffsets[_i][0];
var map = maps[legalType];
if (map === undefined) continue;
for (var j = legalTypesAndOffsets[_i][1]; j < legalTypesAndOffsets[_i][2]; j++) {
if (map.has(j)) {
var other = map.get(j);
var start = Math.min(legalTypesAndOffsets[_i][1], legalTypesAndOffsets[other][1]);
var end = Math.max(legalTypesAndOffsets[_i][2], legalTypesAndOffsets[other][2]);
for (var k = legalTypesAndOffsets[other][1]; k < legalTypesAndOffsets[other][1]; k++) {
map.delete(k);
}
legalTypesAndOffsets[other][1] = start;
legalTypesAndOffsets[other][2] = end;
_i = other - 1;                     break;
} else {
map.set(j, _i);
}
}
}
}
combineAdjacent();
var indicesByOffset = new _map3.default();
for (var _i2 = 0; _i2 < legalTypesAndOffsets.length; _i2++) {
for (var j = legalTypesAndOffsets[_i2][1]; j < legalTypesAndOffsets[_i2][2]; j++) {
if (!indicesByOffset.has(j)) indicesByOffset.set(j, []);
indicesByOffset.get(j).push(_i2);
}
}
for (var _iterator = indicesByOffset.entries(), _isArray = Array.isArray(_iterator), _i3 = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
var _ref;
if (_isArray) {
if (_i3 >= _iterator.length) break;
_ref = _iterator[_i3++];
} else {
_i3 = _iterator.next();
if (_i3.done) break;
_ref = _i3.value;
}
var _ref4 = _ref,
offset = _ref4[0],
indices = _ref4[1];
if (indices.length <= 1) continue;
for (var _i10 = 1; _i10 < indices.length; _i10++) {
var t0 = legalTypesAndOffsets[indices[_i10 - 1]];
var t1 = legalTypesAndOffsets[indices[_i10]];
if (t0[0] === t1[0]) continue;
t0[0] = t1[0] = "opaque";
}
}
combineAdjacent();
for (var _i4 = 0; _i4 < legalTypesAndOffsets.length; _i4++) {
if (legalTypesAndOffsets[_i4][0] === "empty" || legalTypesAndOffsets[_i4][0] === "opaque") continue;
var naturalAlignment = void 0;
var size = legalTypesAndOffsets[_i4][2] - legalTypesAndOffsets[_i4][1];
if (legalTypesAndOffsets[_i4][0].startsWith("int")) {
naturalAlignment = Math.min(size, convention.maxVoluntaryInt);
} else {
naturalAlignment = size;
}
if (legalTypesAndOffsets[_i4][1] % naturalAlignment !== 0) {
legalTypesAndOffsets[_i4][0] = "opaque";
}
}
combineAdjacent();
for (var _i5 = 0; _i5 < legalTypesAndOffsets.length; _i5++) {
var _size = legalTypesAndOffsets[_i5][2] - legalTypesAndOffsets[_i5][1];
if (legalTypesAndOffsets[_i5][0].startsWith("int") && _size <= convention.maxVoluntaryInt) legalTypesAndOffsets[_i5][0] = "opaque";
}
combineAdjacent();
combineAdjacent = undefined;         for (var _i6 = 0; _i6 < legalTypesAndOffsets.length; _i6++) {
if (legalTypesAndOffsets[_i6][0] !== "opaque") continue;
var start = legalTypesAndOffsets[_i6][1];
var end = legalTypesAndOffsets[_i6][2];
var nextBoundary = start - start % convention.maxVoluntaryInt + convention.maxVoluntaryInt;
while (nextBoundary < end - end % convention.maxVoluntaryInt) {
legalTypesAndOffsets.push(["opaque", start, nextBoundary]);
start = nextBoundary;
nextBoundary += convention.maxVoluntaryInt;
}
legalTypesAndOffsets[_i6][1] = start;
}
var perStorageUnit = new _map3.default();
var lastStorageUnit = 0;
for (var _i7 = 0; _i7 < legalTypesAndOffsets.length; _i7++) {
if (legalTypesAndOffsets[_i7][0] !== "opaque") continue;
var _start = legalTypesAndOffsets[_i7][1];
var storageUnit = (_start - _start % convention.maxVoluntaryInt) / convention.maxVoluntaryInt;
if (!perStorageUnit.has(storageUnit)) perStorageUnit.set(storageUnit, []);
perStorageUnit.get(storageUnit).push(_i7);
lastStorageUnit = Math.max(lastStorageUnit, storageUnit);
}
var toRemove = [];
for (var _iterator2 = perStorageUnit.values(), _isArray2 = Array.isArray(_iterator2), _i8 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
var _ref2;
if (_isArray2) {
if (_i8 >= _iterator2.length) break;
_ref2 = _iterator2[_i8++];
} else {
_i8 = _iterator2.next();
if (_i8.done) break;
_ref2 = _i8.value;
}
var sharedUnit = _ref2;
var _start2 = Number.POSITIVE_INFINITY;
var _end2 = Number.NEGATIVE_INFINITY;
for (var _iterator4 = sharedUnit, _isArray4 = Array.isArray(_iterator4), _i11 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
var _ref5;
if (_isArray4) {
if (_i11 >= _iterator4.length) break;
_ref5 = _iterator4[_i11++];
} else {
_i11 = _iterator4.next();
if (_i11.done) break;
_ref5 = _i11.value;
}
var _i12 = _ref5;
_start2 = Math.min(legalTypesAndOffsets[_i12][1], _start2);
_end2 = Math.max(legalTypesAndOffsets[_i12][2], _end2);
}
toRemove = toRemove.concat(sharedUnit.slice(1));
var _size2 = void 0;
for (_size2 = 1; _start2 + _size2 < _end2; _size2 *= 2) {}
var newStart = _start2 & ~(_size2 - 1);
if (newStart != _start2) _size2 *= 2;
var newEnd = newStart + _size2;
legalTypesAndOffsets[sharedUnit[0]] = ["int" + (_size2 * 8).toString(), newStart, newEnd];
}
toRemove.sort().reverse();
for (var _iterator3 = toRemove, _isArray3 = Array.isArray(_iterator3), _i9 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
var _ref3;
if (_isArray3) {
if (_i9 >= _iterator3.length) break;
_ref3 = _iterator3[_i9++];
} else {
_i9 = _iterator3.next();
if (_i9.done) break;
_ref3 = _i9.value;
}
var _i13 = _ref3;
legalTypesAndOffsets.splice(_i13, 1);
}
legalTypesAndOffsets.sort(function (a, b) {
return a[1] - b[1];
});
return legalTypesAndOffsets;
}
function convertToCParams(signature) {
var _semanticLowering = semanticLowering(signature),
semanticArgs = _semanticLowering[0],
semanticRets = _semanticLowering[1];
var _map = [semanticArgs, semanticRets].map(physicalLowering),
physicalArgs = _map[0],
physicalRets = _map[1];
var lowered = [];
var argInfos = [];
var argTypes = [];
for (var i = 0; i < method.args.length; i++) {
var elem = toCheck.shift();
if (elem.kind === "Tuple") {
toCheck = elem.elements.map(function (e) {
return e.type;
}).concat(toCheck);
} else {
argTypes.push(elem);
}
}
for (var _i14 = 0; _i14 < params.length; _i14++) {
var type = method.args[_i14].type;
var lowering = getLowering(params[_i14]);
var vwt = type.canonicalType.valueWitnessTable;
if (vwt.size === 0)             continue;
if (method.args[_i14].inout || vwt.flags.IsNonBitwiseTakable || vwt.size > CC.maxInlineArgument) {
lowered.push({ size: Process.pointerSize, stride: Process.pointerSize, indirect: true });
} else {
lowered.push({ size: vwt.size, stride: vwt.stride, indirect: false });
}
}
var remainingSpace = 0;
for (var _i15 = 0; _i15 < lowered.length; _i15++) {}
var indirectReturn = false;
var cReturnType = 'void';
if (method.returnType) {
var _vwt = method.returnType.valueWitnessTable;
if (_vwt.size > CC.maxInlineReturn || _vwt.flags.IsNonPOD) {
indirectReturn = true;
lowered.unshift({ size: Process.pointerSize, stride: Process.pointerSize, indirect: true });
} else {
var alignedSize = _vwt.size;
var remaining = 0;
cReturnType = [];
var _arr = [8, 4, 2, 1];
for (var _i16 = 0; _i16 < _arr.length; _i16++) {
var size = _arr[_i16];
while (size <= convention.maxVoluntaryInt && alignedSize > 0 && alignedSize % size === 0) {
cReturnType.push('uint' + (size * 8).toString());
alignedSize -= size;
}
}
}
}
var overlappedWithSuccessor = new _set2.default();
for (var _i17 = 0; _i17 < params.length; _i17++) {}
var cParams = [],
cArgTypes = [];
for (var _i18 = 0; _i18 < params.length; _i18++) {}
return { cParams: cParams, lowered: lowered };
}
module.exports = {
convention: convention,
makeCallTrampoline: makeCallTrampoline,
checkTrampolineError: checkTrampolineError
};
},{"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/math/log2":11,"babel-runtime/core-js/set":22}],2:[function(require,module,exports){
'use strict';
var _stringify = require('babel-runtime/core-js/json/stringify');
var _stringify2 = _interopRequireDefault(_stringify);
var _getIterator2 = require('babel-runtime/core-js/get-iterator');
var _getIterator3 = _interopRequireDefault(_getIterator2);
var _keys = require('babel-runtime/core-js/object/keys');
var _keys2 = _interopRequireDefault(_keys);
var _typeof2 = require('babel-runtime/helpers/typeof');
var _typeof3 = _interopRequireDefault(_typeof2);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
require('../../loader');
function makeJsonCompat(obj) {
switch (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) {
case "number":
case "string":
case "boolean":
case "undefined":
return obj;
}
if (obj === null) return null;
if (obj instanceof NativePointer || obj instanceof Int64 || obj instanceof UInt64) return obj.toString();
var res = obj instanceof Array ? [] : {};
for (var _iterator = (0, _keys2.default)(obj), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
var _ref;
if (_isArray) {
if (_i >= _iterator.length) break;
_ref = _iterator[_i++];
} else {
_i = _iterator.next();
if (_i.done) break;
_ref = _i.value;
}
var prop = _ref;
if (["canonicalType", "nominalType", "getSize", "fixedName", "_name", "Type", "withoutClassBound", "getObjCObject", "withClassBound"].indexOf(prop) !== -1) continue;
var val = obj[prop];
if (val instanceof Function && !("isGeneric" in val)) {
if (val.length == 0) val = val.call(obj);else continue;
}
if (val && typeof val === "function" && "isGeneric" in val) {
val = val.toString();
}
res[prop] = makeJsonCompat(val);
}
return res;
}
rpc.exports = {
run: function run() {
var types = Swift.enumerateTypesSync();
var out = {};
types.forEach(function (t) {
if (t.isGeneric()) return;
out[t.toString()] = makeJsonCompat(t);
if (t.kind === "Existential") out[t.toString()].witnessTableCount = t.canonicalType.flags.getNumWitnessTables();
if (t.kind != "Class" || t.canonicalType.isTypeMetadata()) out[t.toString()].size = t.canonicalType.valueWitnessTable.size;else out[t.toString()].size = '0x' + Process.pointerSize.toString(16);
});
return (0, _stringify2.default)(out);
},
demangle: function demangle(str) {
return Swift.isSwiftName(str) ? Swift.demangle(str) : str;
},
pointersize: function pointersize() {
return Process.pointerSize;
}
};
},{"../../loader":4,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/json/stringify":9,"babel-runtime/core-js/object/keys":17,"babel-runtime/helpers/typeof":25}],3:[function(require,module,exports){
"use strict";
var _keys = require('babel-runtime/core-js/object/keys');
var _keys2 = _interopRequireDefault(_keys);
var _set = require('babel-runtime/core-js/set');
var _set2 = _interopRequireDefault(_set);
var _from = require('babel-runtime/core-js/array/from');
var _from2 = _interopRequireDefault(_from);
var _map = require('babel-runtime/core-js/map');
var _map2 = _interopRequireDefault(_map);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var metadata = require('./metadata');
var types = require('./types');
var mangling = require('./mangling');
var swiftValue = require('./swift-value');
var CC = require('./calling-convention').convention;
var Swift = void 0;
var _api = null;
var _leakedMemory = []; 
var size_t = Process.pointerSize === 8 ? 'uint64' : Process.pointerSize === 4 ? 'uint32' : "unsupported platform";
Swift = module.exports = {
get available() {
return Module.findBaseAddress("libswiftCore.dylib") !== null;
},
isSwiftName: function isSwiftName(symbol) {
var name = symbol.name || symbol;
return name.startsWith(mangling.MANGLING_PREFIX);
},
/*hook(target, callbacks, signature) {
let interceptorCallbacks = {};
if ("onEnter" in callbacks) {
interceptorCallbacks.onEnter = function(args) {
callbacks.onEnter([]);
};
}
if ("onLeave" in callbacks) {
interceptorCallbacks.onLeave = function(retval) {
callbacks.onLeave(null);
};
}
Interceptor.attach(target, interceptorCallbacks);
},*/
_mangled: new _map2.default(),
getMangled: function getMangled(name) {
return this._mangled.get(name);
},
demangle: function demangle(name) {
if (!Swift.isSwiftName(name)) throw new Error("function name '" + name + "' is not a mangled Swift function");
var cStr = Memory.allocUtf8String(name);
var demangled = this._api.swift_demangle(cStr, name.length, ptr(0), ptr(0), 0);
var res = Memory.readUtf8String(demangled);
if ("free" in this._api) this._api.free(demangled);
this._mangled.set(res, name);
return res;
},
_typesByName: null,
enumerateTypesSync: function enumerateTypesSync() {
var typesByName = types.findAllTypes(this._api);
this._typesByName = typesByName;
return (0, _from2.default)(typesByName.values());
},
makeTupleType: function makeTupleType(labels, innerTypes) {
if (innerTypes.length != labels.length) throw new Error("labels array and innerTypes array need the same length!");
var elements = innerTypes.length ? Memory.alloc(Process.pointerSize * innerTypes.length) : ptr(0);
var labelsStr = Memory.allocUtf8String(labels.join(" ") + " ");
for (var i = 0; i < innerTypes.length; i++) {
Memory.writePointer(elements.add(i * Process.pointerSize), innerTypes[i].canonicalType._ptr);
}
var valueWitnesses = ptr(0);
var pointer = this._api.swift_getTupleTypeMetadata(innerTypes.length, elements, labelsStr, valueWitnesses);
var canonical = new metadata.TargetMetadata(pointer);
if (canonical.labels.toString === labelsStr.toString()) _leakedMemory.push(labelsStr); 
return new types.Type(null, canonical);
},
makeFunctionType: function makeFunctionType(args, returnType, flags) {
var data = Memory.alloc(Process.pointerSize * (2 + args.length));
var writeFlags = ptr(args.length).and(metadata.TargetFunctionTypeFlags.NumArgumentsMask);
if (flags && flags.doesThrow) writeFlags = writeFlags.or(ptr(metadata.TargetFunctionTypeFlags.ThrowsMask));
if (flags && flags.convention) writeFlags = writeFlags.or(ptr(metadata.FunctionMetadataConvention[flags.convention] << metadata.TargetFunctionTypeFlags.ConventionShift));
Memory.writePointer(data, writeFlags);
for (var i = 0; i < args.length; i++) {
var val = void 0;
if ("canonicalType" in args[i]) val = args[i].canonicalType._ptr;else {
val = args[i].type.canonicalType._ptr;
if (args[i].inout) val = val.or(1);
}
Memory.writePointer(data.add((i + 1) * Process.pointerSize), val);
}
if (returnType === null) returnType = this.makeTupleType([], []);         Memory.writePointer(data.add((args.length + 1) * Process.pointerSize), returnType.canonicalType._ptr);
var pointer = this._api.swift_getFunctionTypeMetadata(data);
return new types.Type(null, new metadata.TargetMetadata(pointer));
},
_typeFromCanonical: function _typeFromCanonical(pointer, name) {
return new types.Type(null, new metadata.TargetMetadata(pointer), name);
},
get _api() {
if (_api !== null) return _api;
if (!this.available) return null;
var temporaryApi = {};
var pending = [{
module: "libsystem_malloc.dylib",
functions: {
"free": ['void', ['pointer']]
},
optionals: {
"free": "leaks don't break functionality"
}
}, {
module: "libmacho.dylib",
functions: {
"getsectiondata": ['pointer', ['pointer', 'pointer', 'pointer', 'pointer']]
}
}, {
module: "libswiftFoundation.dylib",
functions: {
"_T0SS10FoundationE8EncodingV4utf8ACfau": ['pointer', []],
"_T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF": ['pointer', ['pointer', 'pointer', 'pointer']]
}
}, {
module: "CoreFoundation",
functions: {
"CFGetRetainCount": ['long', ['pointer']]
}
}, {
module: "Foundation",
functions: {
'objc_storeStrong': ['void', ['pointer', 'pointer']]
}
}, {
module: "libswiftCore.dylib",
variables: new _set2.default(["_T0SSs14StringProtocolsWP",             "_T0SSs16TextOutputStreamsWP",             "_T0s19_emptyStringStorages6UInt32Vv",             "_swift_release"]),
functions: {
"swift_demangle": ['pointer', ['pointer', size_t, 'pointer', 'pointer', 'int32']],
'swift_unknownRetain': ['void', ['pointer']],
'swift_unknownRelease': ['void', ['pointer']],
'swift_bridgeObjectRelease': ['void', ['pointer']],
'swift_weakLoadStrong': ['pointer', ['pointer']],
'swift_weakAssign': ['void', ['pointer', 'pointer']],
'swift_release': ['void', ['pointer']],
'swift_retain': ['void', ['pointer']],
'swift_projectBox': ['pointer', ['pointer']],
'swift_stringFromUTF8InRawMemory': ['void', ['pointer', 'pointer', size_t]],
"swift_getTupleTypeMetadata": ['pointer', [size_t, 'pointer', 'pointer', 'pointer']],
"swift_getExistentialMetatypeMetadata": ['pointer', ['pointer']],
"swift_getExistentialTypeMetadata": ['pointer', ['int8', 'pointer', size_t, 'pointer']],
"swift_getObjCClassMetadata": ['pointer', ['pointer']],
"swift_getFunctionTypeMetadata": ['pointer', ['pointer']],
"swift_getForeignTypeMetadata": ['pointer', ['pointer']],
"swift_getMetatypeMetadata": ['pointer', ['pointer']],
"swift_getEnumCaseSinglePayload": ['int', ['pointer', 'pointer', 'uint']],
"swift_getEnumCaseMultiPayload": ['uint', ['pointer', 'pointer']],
'swift_conformsToProtocol': ['pointer', ['pointer', 'pointer']],
'swift_dynamicCast': ['bool', ['pointer', 'pointer', 'pointer', 'pointer', size_t]],
"swift_getDynamicType": ['pointer', ['pointer', 'pointer', 'int8']],
"swift_getTypeByName": ['pointer', ['pointer', size_t]],
"swift_getTypeName": [['pointer', 'pointer'], ['pointer', 'uchar']],
"_T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF": CC.indirectResultRegister === undefined ?
['void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']] :
['void', ['pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']]
}
}];
pending.forEach(function (api) {
var functions = api.functions || {};
var variables = api.variables || new _set2.default();
var optionals = api.optionals || {};
var exportByName = Module.enumerateExportsSync(api.module).reduce(function (result, exp) {
result[exp.name] = exp;
return result;
}, {});
(0, _keys2.default)(functions).forEach(function (name) {
var exp = exportByName[name];
if (exp !== undefined && exp.type === 'function') {
var signature = functions[name];
if (typeof signature === 'function') {
signature.call(temporaryApi, exp.address);
} else {
temporaryApi[name] = new NativeFunction(exp.address, signature[0], signature[1], signature[2]);
}
} else if (!(name in optionals)) {
throw new Error('missing function \'' + name + '\' in module \'' + api.module);
}
});
variables.forEach(function (name) {
var exp = exportByName[name];
if (exp !== undefined && exp.type === 'variable') {
temporaryApi[name] = exp.address;
} else if (!(name in optionals)) {
throw new Error('missing variable \'' + name + '\' in module \'' + api.module);
}
});
});
_api = temporaryApi;
return _api;
}
};
},{"./calling-convention":1,"./mangling":5,"./metadata":6,"./swift-value":151,"./types":152,"babel-runtime/core-js/array/from":7,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/keys":17,"babel-runtime/core-js/set":22}],4:[function(require,module,exports){
(function (global){
'use strict';
global._debug = true;
var Swift = require('./index');
var mangling = require('./mangling');
Object.defineProperty(global, 'Swift', {
value: Swift,
configurable: true,
enumerable: true
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./index":3,"./mangling":5}],5:[function(require,module,exports){
"use strict";
module.exports = {
MANGLING_PREFIX: "_T" };
},{}],6:[function(require,module,exports){
"use strict";
var _log = require('babel-runtime/core-js/math/log2');
var _log2 = _interopRequireDefault(_log);
var _create = require('babel-runtime/core-js/object/create');
var _create2 = _interopRequireDefault(_create);
var _getIterator2 = require('babel-runtime/core-js/get-iterator');
var _getIterator3 = _interopRequireDefault(_getIterator2);
var _entries = require('babel-runtime/core-js/object/entries');
var _entries2 = _interopRequireDefault(_entries);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var mangling = require('./mangling');
function flagsToObject(definition, value) {
var res = {};
for (var _iterator = (0, _entries2.default)(definition), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
var _ref;
if (_isArray) {
if (_i >= _iterator.length) break;
_ref = _iterator[_i++];
} else {
_i = _iterator.next();
if (_i.done) break;
_ref = _i.value;
}
var _ref2 = _ref,
flagName = _ref2[0],
flagVal = _ref2[1];
res[flagName] = (value & flagVal) === flagVal;
}
return res;
}
var ValueWitnessFlags = {
AlignmentMask: 0x0000FFFF,
IsNonPOD: 0x00010000,
IsNonInline: 0x00020000,
HasExtraInhabitants: 0x00040000,
HasSpareBits: 0x00080000,
IsNonBitwiseTakable: 0x00100000,
HasEnumWitnesses: 0x00200000
};
function TypeLayout(pointer) {
this._ptr = pointer;
}
TypeLayout.prototype = {
get size() {
return Memory.readPointer(this._ptr.add(0));
},
get flags() {
return flagsToObject(ValueWitnessFlags, Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32());
},
get stride() {
return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
},
get extraInhabitantFlags() {
if (!this.flags.HasExtraInhabitants) return 0;
return new ExtraInhabitantFlags(this._ptr.add(3 * Process.pointerSize));
}
};
function ExtraInhabitantFlags(pointer) {
this._ptr = pointer;
}
ExtraInhabitantFlags.NumExtraInhabitantsMask = 0x7FFFFFFF;
ExtraInhabitantFlags.prototype = {
get data() {
return Memory.readPointer(this._ptr);
},
getNumExtraInhabitants: function getNumExtraInhabitants() {
return this.data & ExtraInhabitantFlags.NumExtraInhabitantsMask;
}
};
function ValueWitnessTable(pointer) {
TypeLayout.call(this, pointer.add(17 * Process.pointerSize));
this._vwt = pointer;
}
ValueWitnessTable.prototype = (0, _create2.default)(TypeLayout.prototype, {
destroyBuffer: {
value: function value(buffer, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(0)), 'void', ['pointer', 'pointer'])(buffer, self);
},
enumerable: true
},
initializeBufferWithCopyOfBuffer: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(1 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
projectBuffer: {
value: function value(buffer, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(2 * Process.pointerSize)), 'pointer', ['pointer', 'pointer'])(buffer, self);
},
enumerable: true
},
deallocateBuffer: {
value: function value(buffer, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(3 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(buffer, self);
},
enumerable: true
},
destroy: {
value: function value(object, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(4 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(object, self);
},
enumerable: true
},
initializeBufferWithCopy: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(5 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
initializeWithCopy: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(6 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
assignWithCopy: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(7 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
initializeBufferWithTake: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(8 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
initializeWithTake: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(9 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
assignWithTake: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(10 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
allocateBuffer: {
value: function value(buffer, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(11 * Process.pointerSize)), 'pointer', ['pointer', 'pointer'])(buffer, self);
},
enumerable: true
},
initializeBufferWithTakeOfBuffer: {
value: function value(dest, src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(12 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(dest, src, self);
},
enumerable: true
},
destroyArray: {
value: function value(array, n, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(13 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer'])(array, n, self);
},
enumerable: true
},
initializeArrayWithCopy: {
value: function value(dest, src, n, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(14 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
},
enumerable: true
},
initializeArrayWithTakeFrontToBack: {
value: function value(dest, src, n, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(15 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
},
enumerable: true
},
initializeArrayWithTakeBackToFront: {
value: function value(dest, src, n, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(16 * Process.pointerSize)), 'pointer', ['pointer', 'pointer', 'pointer', 'pointer'])(dest, src, n, self);
},
enumerable: true
},
isValueInline: {
get: function get() {
return !this.flags.IsNonInline;
},
enumerable: true
}
});
function ExtraInhabitantsValueWitnessTable(pointer) {
ValueWitnessTable.call(this, pointer);
}
ExtraInhabitantsValueWitnessTable.prototype = (0, _create2.default)(ValueWitnessTable.prototype, {
storeExtraInhabitant: {
value: function value(dest, index, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(21 * Process.pointerSize)), 'void', ['pointer', 'int', 'pointer'])(dest, index, self);
},
enumerable: true
},
getExtraInhabitant: {
value: function value(src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(22 * Process.pointerSize)), 'int', ['pointer', 'pointer'])(src, self);
},
enumerable: true
}
});
function EnumValueWitnessTable(pointer) {
ExtraInhabitantsValueWitnessTable.call(this, pointer);
}
EnumValueWitnessTable.prototype = (0, _create2.default)(ExtraInhabitantsValueWitnessTable.prototype, {
getEnumTag: {
value: function value(src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(23 * Process.pointerSize)), 'int', ['pointer', 'pointer'])(src, self);
},
enumerable: true
},
destructiveProjectEnumData: {
value: function value(src, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(24 * Process.pointerSize)), 'void', ['pointer', 'pointer'])(src, self);
},
enumerable: true
},
destructiveInjectEnumTag: {
value: function value(src, tag, self) {
return new NativeFunction(Memory.readPointer(this._vwt.add(25 * Process.pointerSize)), 'void', ['pointer', 'int', 'pointer'])(src, tag, self);
},
enumerable: true
}
});
function TargetProtocolConformanceRecord(ptr) {
this._ptr = ptr;
}
TargetProtocolConformanceRecord.prototype = {
get protocol() {
return new TargetProtocolDescriptor(RelativeIndirectablePointer(this._ptr.add(0)));
},
get directType() {
return RelativeIndirectablePointer(this._ptr.add(4));
},
get indirectClass() {
return RelativeIndirectablePointer(this._ptr.add(4));
},
get typeDescriptor() {
return RelativeIndirectablePointer(this._ptr.add(4));
},
get witnessTable() {
return RelativeDirectPointer(this._ptr.add(8));
},
get witnessTableAccessor() {
return RelativeDirectPointer(this._ptr.add(8));
},
get flags() {
return Memory.readU32(this._ptr.add(12));
},
getTypeKind: function getTypeKind() {
var TypeKindMask = 0x0000000F;
var TypeKindShift = 0;
return (this.flags & TypeKindMask) >>> TypeKindShift;     },
getConformanceKind: function getConformanceKind() {
var ConformanceKindMask = 0x00000010;
var ConformanceKindShift = 4;
return (this.flags & ConformanceKindMask) >>> ConformanceKindShift;     },
getDirectType: function getDirectType() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.NonuniqueDirectType:
break;
case TypeMetadataRecordKind.UniqueDirectClass:
case TypeMetadataRecordKind.UniqueIndirectClass:
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
throw new Error("not direct type metadata");
}
return new TargetMetadata(this.directType);
},
getDirectClass: function getDirectClass() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueDirectClass:
break;
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.NonuniqueDirectType:
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
case TypeMetadataRecordKind.UniqueIndirectClass:
throw new Error("not direct class object");
}
return this.directType;
},
getIndirectClass: function getIndirectClass() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueIndirectClass:
break;
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.UniqueDirectClass:
case TypeMetadataRecordKind.NonuniqueDirectType:
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
throw new Error("not indirect class object");
}
return this.indirectClass;
},
getNominalTypeDescriptor: function getNominalTypeDescriptor() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
break;
case TypeMetadataRecordKind.UniqueDirectClass:
case TypeMetadataRecordKind.UniqueIndirectClass:
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.NonuniqueDirectType:
throw new Error("not generic metadata pattern");
}
return new TargetNominalTypeDescriptor(this.typeDescriptor);
},
getStaticWitnessTable: function getStaticWitnessTable() {
switch (this.getConformanceKind()) {
case ProtocolConformanceReferenceKind.WitnessTable:
break;
case ProtocolConformanceReferenceKind.WitnessTableAccessor:
throw new Error("no witness table");
}
return this.witnessTable;
},
getWitnessTableAccessor: function getWitnessTableAccessor() {
switch (this.getConformanceKind()) {
case ProtocolConformanceReferenceKind.WitnessTableAccessor:
break;
case ProtocolConformanceReferenceKind.WitnessTable:
throw new Error("not witness table accessor");
}
return new NativeFunction(this.witnessTableAccessor, 'pointer', ['pointer']);
},
getCanonicalTypeMetadata: function getCanonicalTypeMetadata(api) {
var classMetadata = null;
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.UniqueDirectType:
return this.getDirectType();
case TypeMetadataRecordKind.NonuniqueDirectType:
return new TargetMetadata(api.swift_getForeignTypeMetadata(this.getDirectType()._ptr));
case TypeMetadataRecordKind.UniqueIndirectClass:
classMetadata = Memory.readPointer(this.getIndirectClass());
break;
case TypeMetadataRecordKind.UniqueDirectClass:
classMetadata = this.getDirectClass();
break;
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
case TypeMetadataRecordKind.Universal:
return null;
}
if (classMetadata !== null && !classMetadata.isNull()) return new TargetMetadata(api.swift_getObjCClassMetadata(classMetadata));
return null;
},
getWitnessTable: function getWitnessTable(type) {
switch (this.getConformanceKind()) {
case ProtocolConformanceReferenceKind.WitnessTable:
return this.getStaticWitnessTable();
case ProtocolConformanceReferenceKind.WitnessTableAccessor:
return this.getWitnessTableAccessor()(this.type);
}
}
};
var ProtocolConformanceReferenceKind = {
WitnessTable: 0,
WitnessTableAccessor: 1
};
var FieldTypeFlags = {
Indirect: 1,
Weak: 2,
typeMask: 0x3
};
var TypeMetadataRecordKind = {
Universal: 0,
UniqueDirectType: 1,
NonuniqueDirectType: 2,
UniqueIndirectClass: 3,
UniqueNominalTypeDescriptor: 4,
UniqueDirectClass: 0xF
};
function FlaggedPointer(type, bitPos) {
var flagMask = 1 << bitPos;
var pointerBitMask = ~flagMask;
return function (val) {
return {
pointer: new type(val.and(pointerBitMask)),
flag: !val.and(flagMask).isNull()
};
};
}
var Argument = FlaggedPointer(TargetMetadata, 0);
function RelativeDirectPointerIntPair(ptr) {
var val = Memory.readS32(ptr);
var offset = val & ~0x3;
var intVal = val & 0x3;
return {
pointer: ptr.add(val & ~0x3),
intVal: val & 0x3
};
}
var NominalTypeKind = {
"0": "Class",
"1": "Struct",
"2": "Enum",
"3": "Optional"
};
var MetadataKind = {
"0": "Class",
"1": "Struct",
"2": "Enum",
"3": "Optional",
"8": "Opaque",
"9": "Tuple",
"10": "Function",
"12": "Existential",
"13": "Metatype",
"14": "ObjCClassWrapper",
"15": "ExistentialMetatype",
"16": "ForeignClass",
"64": "HeapLocalVariable",
"65": "HeapGenericLocalVariable",
"128": "ErrorObject"
};
function TargetMetadata(pointer) {
this._ptr = pointer;
switch (this.kind) {
case "Class":
return new TargetClassMetadata(pointer);
case "Struct":
return new TargetValueMetadata(pointer);
case "Enum":
case "Optional":
return new TargetEnumMetadata(pointer);
case "Tuple":
return new TargetTupleTypeMetadata(pointer);
case "Function":
return new TargetFunctionTypeMetadata(pointer);
case "Existential":
return new TargetExistentialTypeMetadata(pointer);
case "Metatype":
return new TargetMetatypeMetadata(pointer);
case "ObjCClassWrapper":
return new TargetObjCClassWrapperMetadata(pointer);
case "ExistentialMetatype":
return new TargetExistentialMetatypeMetadata(pointer);
case "ForeignClass":
return new TargetForeignTypeMetadata(pointer);
}
}
TargetMetadata.prototype = {
get valueWitnessTable() {
return new ValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
},
get kind() {
var val = Memory.readPointer(this._ptr);
if (val.compare(ptr(4096)) > 0) {
return "Class";
}
return MetadataKind[val.toInt32().toString()];
},
getNominalTypeDescriptor: function getNominalTypeDescriptor() {
return null;
},
toString: function toString() {
return "[TargetMetadata: " + this.kind + "@" + this._ptr + "]";
}
};
var ClassFlags = {
IsSwift1: 0x1,
UsesSwift1Refcounting: 0x2,
HasCustomObjCName: 0x4
};
function TargetClassMetadata(pointer) {
this._ptr = pointer;
if (this.kind !== "Class") throw new Error("type is not a class type");
}
TargetClassMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
destructor: {
get: function get() {
if (this.isPureObjC()) throw new Error("destructor not available for ObjC classes");
return Memory.readPointer(this._ptr.sub(2 * Process.pointerSize));
},
enumerable: true
},
valueWitnessTable: {
get: function get() {
if (this.isPureObjC()) throw new Error("valueWitnessTable not available for ObjC classes");
return new ValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
},
enumerable: true
},
isa: {
get: function get() {
var val = Memory.readPointer(this._ptr);
if (val.compare(ptr(4096)) <= 0) {
return null;
}
return val;
},
enumerable: true
},
superClass: {
get: function get() {
if (this.isPureObjC()) return null;
var val = Memory.readPointer(this._ptr.add(Process.pointerSize));
return val.isNull() ? null : new TargetClassMetadata(val);
},
enumerable: true
},
cacheData: {
get: function get() {
return [Memory.readPointer(this._ptr.add(2 * Process.pointerSize)), Memory.readPointer(this._ptr.add(3 * Process.pointerSize))];
},
enumerable: true
},
data: {
get: function get() {
return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
},
enumerable: true
},
flags: {
get: function get() {
if (this.isPureObjC()) throw new Error("flags not available for ObjC classes");
return flagsToObject(ClassFlags, Memory.readU32(this._ptr.add(5 * Process.pointerSize)));
},
enumerable: true
},
instanceAddressPoint: {
get: function get() {
if (this.isPureObjC()) throw new Error("instanceAddressPoint not available for ObjC classes");
return Memory.readU32(this._ptr.add(4 + 5 * Process.pointerSize));
},
enumerable: true
},
instanceSize: {
get: function get() {
if (this.isPureObjC()) throw new Error("instanceSize not available for ObjC classes");
return Memory.readU32(this._ptr.add(8 + 5 * Process.pointerSize));
},
enumerable: true
},
instanceAlignMask: {
get: function get() {
if (this.isPureObjC()) throw new Error("instanceAlignMask not available for ObjC classes");
return Memory.readU16(this._ptr.add(12 + 5 * Process.pointerSize));
},
enumerable: true
},
classSize: {
get: function get() {
if (this.isPureObjC()) throw new Error("classSize not available for ObjC classes");
return Memory.readU32(this._ptr.add(16 + 5 * Process.pointerSize));
},
enumerable: true
},
classAddressPoint: {
get: function get() {
if (this.isPureObjC()) throw new Error("classAddressPoint not available for ObjC classes");
return Memory.readU32(this._ptr.add(20 + 5 * Process.pointerSize));
},
enumerable: true
},
description: {
get: function get() {
if (this.isPureObjC()) throw new Error("description not available for ObjC classes");
return ConstTargetFarRelativeDirectPointer(this._ptr.add(24 + 5 * Process.pointerSize));
},
enumerable: true
},
iVarDestroyer: {
get: function get() {
if (this.isPureObjC()) throw new Error("iVarDestroyer not available for ObjC classes");
return new NativePointer(Memory.readPointer(this._ptr.add(24 + 6 * Process.pointerSize)), 'void', ['pointer']);
},
enumerable: true
},
isTypeMetadata: {
value: function value() {
return this.data.and(ptr(1)).equals(ptr(1));
},
enumerable: true
},
isPureObjC: {
value: function value() {
return !this.isTypeMetadata();
},
enumerable: true
},
isArtificialSubclass: {
value: function value() {
return this.description.compare(int64(0)) === 0;
},
enumerable: true
},
getDescription: {
value: function value() {
if (!this.isTypeMetadata()) throw new Error("assertion error");
if (this.isArtificialSubclass()) throw new Error("assertion error");
return this.description;
},
enumerable: true
},
getNominalTypeDescriptor: {
value: function value() {
if (this.isTypeMetadata() && !this.isArtificialSubclass()) return new TargetNominalTypeDescriptor(this.getDescription());else return null;
},
enumerable: true
},
getParentType: {
value: function value(nominalType) {
var genericParams = nominalType.genericParams;
if (!genericParams.flags.HasParent) return null;
return new TargetMetadata(this._ptr.add((genericParams.offset - 1) * Process.pointerSize));
},
enumerable: true
},
getGenericArgs: {
value: function value() {
return this.getNominalTypeDescriptor().getGenericArgs(this);
},
enumerable: true
}
});
function TargetValueMetadata(pointer) {
this._ptr = pointer;
switch (this.kind) {
case "Struct":
break;
default:
throw new Error("type is not a value type");
}
}
TargetValueMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
description: {
get: function get() {
var val = ConstTargetFarRelativeDirectPointer(this._ptr.add(Process.pointerSize));
if (val.isNull()) return null;
return val;
},
enumerable: true
},
getGenericArgs: {
value: function value() {
return this.getNominalTypeDescriptor().getGenericArgs(this);
},
enumerable: true
},
getNominalTypeDescriptor: {
value: function value() {
if (this.description.isNull()) return null;
return new TargetNominalTypeDescriptor(this.description);
},
enumerable: true
}
});
function TargetEnumMetadata(pointer) {
this._ptr = pointer;
switch (this.kind) {
case "Enum":
case "Optional":
break;
default:
throw new Error("type is not an enum type");
}
}
TargetEnumMetadata.prototype = (0, _create2.default)(TargetValueMetadata.prototype, {
valueWitnessTable: {
get: function get() {
return new EnumValueWitnessTable(Memory.readPointer(this._ptr.sub(Process.pointerSize)));
},
enumerable: true
},
payloadSize: {
get: function get() {
var nominalType = this.getNominalTypeDescriptor();
if (!nominalType.enum_.hasPayloadSizeOffset()) return null;
return Memory.readPointer(this._ptr.add(nominalType.enum_.getPayloadSizeOffset() * Process.pointerSize));
},
enumerable: true
}
});
function TargetGenericMetadata(ptr) {
this._ptr = ptr;
}
TargetGenericMetadata.prototype = {
get createFunction() {
return new NativeFunction(Memory.readPointer(this._ptr.add(0)), 'pointer', ['pointer', 'pointer']);
},
get metadataSize() {
return Memory.readU32(this._ptr.add(0 + Process.pointerSize));
},
get numKeyArguments() {
return Memory.readU16(this._ptr.add(4 + Process.pointerSize));
},
get addressPoint() {
return Memory.readU16(this._ptr.add(6 + Process.pointerSize));
},
get privateData() {
return Memory.readByteArray(this._ptr.add(8 + Process.pointerSize), 16 * Process.pointerSize);
},
getMetadataTemplate: function getMetadataTemplate() {
return this._ptr.add(8 + 17 * Process.pointerSize);
},
_getMetadata: function _getMetadata() {
return new TargetMetadata(this.getMetadataTemplate().add(this.addressPoint));
},
getTemplateDescription: function getTemplateDescription() {
var metadata = new TargetMetadata(this.getMetadataTemplate().add(this.addressPoint));
return metadata.getNominalTypeDescriptor();
}
};
function TargetTupleTypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind != "Tuple") throw new Error("type is not a tuple type");
}
TargetTupleTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
numElements: {
get: function get() {
return uint64(Memory.readPointer(this._ptr.add(Process.pointerSize)).toString());
},
enumerable: true
},
labels: {
get: function get() {
return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
},
enumerable: true
},
elements: {
get: function get() {
var elems = [];
var sizeOfTupleElement = 2 * Process.pointerSize;
for (var i = 0; i < this.numElements; i++) {
elems.push(new TupleElement(this._ptr.add(3 * Process.pointerSize + i * sizeOfTupleElement)));
}
return elems;
},
enumerable: true
}
});
function TupleElement(pointer) {
this._ptr = pointer;
}
TupleElement.prototype = {
get type() {
return new TargetMetadata(Memory.readPointer(this._ptr));
},
get offset() {
return Memory.readPointer(this._ptr.add(Process.pointerSize)).toInt32();
}
};
function TargetFunctionTypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind != "Function") throw new Error("type is not a function type");
}
TargetFunctionTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
flags: {
get: function get() {
var val = Memory.readPointer(this._ptr.add(Process.pointerSize));
return {
numArguments: val.and(TargetFunctionTypeFlags.NumArgumentsMask).toInt32(),
convention: val.and(TargetFunctionTypeFlags.ConventionMask).shr(TargetFunctionTypeFlags.ConventionShift).toInt32(),
doesThrow: !val.and(TargetFunctionTypeFlags.ThrowsMask).isNull()
};
},
enumerable: true
},
resultType: {
get: function get() {
return new TargetMetadata(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
},
enumerable: true
},
getArguments: {
value: function value() {
var count = this.flags.numArguments;
var args = [];
var ptr = this._ptr.add(3 * Process.pointerSize);
for (var i = 0; i < count; i++) {
var arg = new Argument(Memory.readPointer(ptr.add(i * Process.pointerSize)));
args.push({
inout: arg.flag,
type: arg.pointer
});
}
return args;
},
enumerable: true
}
});
var ForeignTypeMetadataFlags = {
HasInitializationFunction: 1
};
function TargetForeignTypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind != "ForeignClass") throw new Error("type is not a foreign class type");
}
TargetForeignTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
flags: {
get: function get() {
return flagsToObject(ForeignTypeMetadataFlags, Memory.readPointer(this._ptr.sub(2 * Process.pointerSize)));
},
enumerable: true
},
unique: {
get: function get() {
return Memory.readPointer(this._ptr.sub(3 * Process.pointerSize));
},
enumerable: true
},
name: {
get: function get() {
return Memory.readUtf8String(Memory.readPointer(this._ptr.sub(4 * Process.pointerSize)));
},
enumerable: true
},
initializationFunction: {
get: function get() {
return new NativeFunction(Memory.readPointer(this._ptr.sub(5 * Process.pointerSize)), 'void', ['pointer']);
},
enumerable: true
}
});
function TargetObjCClassWrapperMetadata(pointer) {
this._ptr = pointer;
if (this.kind !== "ObjCClassWrapper") throw new Error("type is not a ObjC class wrapper type");
}
TargetObjCClassWrapperMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
class_: {
get: function get() {
return Memory.readPointer(this._ptr.add(Process.pointerSize));
},
enumerable: true
}
});
function ExistentialTypeFlags(val) {
this._val = val;
}
ExistentialTypeFlags.prototype = {
NumWitnessTablesMask: 0x00FFFFFF,
ClassConstraintMask: 0x80000000,
HasSuperclassMask: 0x40000000,
SpecialProtocolMask: 0x3F000000,
SpecialProtocolShift: 24,
getNumWitnessTables: function getNumWitnessTables() {
return this._val & this.NumWitnessTablesMask;
},
getClassConstraint: function getClassConstraint() {
return !!(this._val & this.ClassConstraintMask) ? "Any" : "Class";
},
hasSuperclassConstraint: function hasSuperclassConstraint() {
return !!(this._val & this.HasSuperclassMask);
},
getSpecialProtocol: function getSpecialProtocol() {
var SpecialProtocol = ["None", "Error"];
return SpecialProtocol[(this._val & this.SpecialProtocolMask) >> this.SpecialProtocolShift];
}
};
function TargetExistentialTypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind != "Existential") throw new Error("type is not a existential type");
}
TargetExistentialTypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
flags: {
get: function get() {
return new ExistentialTypeFlags(Memory.readPointer(this._ptr.add(Process.pointerSize)));
},
enumerable: true
},
protocols: {
get: function get() {
return new TargetProtocolDescriptorList(this._ptr.add(2 * Process.pointerSize));
},
enumerable: true
},
getRepresentation: {
value: function value() {
switch (this.flags.getSpecialProtocol()) {
case "Error":
return "Error";
case "None":
break;
}
if (this.isClassBounded()) return "Class";
return "Opaque";
},
enumerable: true
},
isObjC: {
value: function value() {
return this.isClassBounded() && this.flags.getNumWitnessTables() == 0;
},
enumerable: true
},
isClassBounded: {
value: function value() {
return this.flags.getClassConstraint() == "Class";
},
enumerable: true
},
getSuperclassConstraint: {
value: function value() {
if (this.isObjC() || !this.flags.hasSuperclassConstraint()) return null;
var ptr = this._ptr.add(Process.pointerSize * (3 + this.protocols.length));
return new TargetMetadata(Memory.readPointer(ptr));
},
enumerable: true
} });
function TargetExistentialMetatypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind !== "ExistentialMetatype") throw new Error("type is not a metatype");
}
TargetExistentialMetatypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
instanceType: {
get: function get() {
return new TargetMetadata(Memory.readPointer(this._ptr.add(Process.pointerSize)));
},
enumerable: true
},
flags: {
get: function get() {
return new ExistentialTypeFlags(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
},
enumerable: true
},
isObjC: {
value: function value() {
return this.isClassBounded() && this.flags.getNumWitnessTables() == 0;
},
enumerable: true
},
isClassBounded: {
value: function value() {
return this.flags.getClassConstraint() == "Class";
},
enumerable: true
}
});
function TargetMetatypeMetadata(pointer) {
this._ptr = pointer;
if (this.kind !== "Metatype") throw new Error("type is not a metatype");
}
TargetMetatypeMetadata.prototype = (0, _create2.default)(TargetMetadata.prototype, {
instanceType: {
get: function get() {
return new TargetMetadata(Memory.readPointer(this._ptr.add(Process.pointerSize)));
},
enumerable: true
}
});
function TargetProtocolDescriptorList(pointer) {
if (pointer.isNull()) return [];
var numProtocols = Memory.readPointer(pointer).toInt32();
var res = [];
for (var i = 0; i < numProtocols; i++) {
res.push(new TargetProtocolDescriptor(Memory.readPointer(pointer.add((i + 1) * Process.pointerSize))));
}
res.arrayLocation = pointer.add(Process.pointerSize);
return res;
}
function TargetProtocolDescriptor(pointer) {
this._ptr = pointer;
}
TargetProtocolDescriptor.prototype = {
get _ObjC_Isa() {
return Memory.readPointer(this._ptr.add(0));
},
get name() {
return Memory.readUtf8String(Memory.readPointer(this._ptr.add(Process.pointerSize)));
},
get inheritedProtocols() {
return new TargetProtocolDescriptorList(Memory.readPointer(this._ptr.add(2 * Process.pointerSize)));
},
get _ObjC_InstanceMethods() {
return Memory.readPointer(this._ptr.add(3 * Process.pointerSize));
},
get _ObjC_ClassMethods() {
return Memory.readPointer(this._ptr.add(4 * Process.pointerSize));
},
get _ObjC_OptionalInstanceMethods() {
return Memory.readPointer(this._ptr.add(5 * Process.pointerSize));
},
get _ObjC_OptionalClassMethods() {
return Memory.readPointer(this._ptr.add(6 * Process.pointerSize));
},
get _ObjC_InstanceProperties() {
return Memory.readPointer(this._ptr.add(7 * Process.pointerSize));
},
get descriptorSize() {
return Memory.readU32(this._ptr.add(8 * Process.pointerSize));
},
get flags() {
return flagsToObject(ProtocolDescriptorFlags, Memory.readU32(this._ptr.add(8 * Process.pointerSize + 4)));
},
get minimumWitnessTableSizeInWords() {
if (!this.flags.IsResilient) throw new Error("minimum witness table size not known!");
return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
},
get defaultWitnessTableSizeInWords() {
if (!this.flags.IsResilient) throw new Error("default witness table size not known!");
return Memory.readU16(this._ptr.add(8 * Process.pointerSize + 8));
},
get reserved() {
return Memory.readU32(this._ptr.add(8 * Process.pointerSize + 12));
},
getDefaultWitnesses: function getDefaultWitnesses() {
if (!this.flags.IsResilient) throw new Error("default witness table not known!");
return this._ptr.add(8 * Process.pointerSize + 16);
}
};
var ProtocolDescriptorFlags = {
IsSwift: 1,
ClassConstraint: 2,
DispatchStrategyMask: 0x3c,
DispatchStrategyShift: 2,
SpecialProtocolMask: 0x3C0,
SpecialProtocolShift: 6,
IsResilient: 0x400,
_ObjCReserved: 0xFFFF0000
};
var TargetFunctionTypeFlags = {
NumArgumentsMask: 0x00FFFFFF,
ConventionMask: 0x0F000000,
ConventionShift: 24,
ThrowsMask: 0x10000000
};
var FunctionMetadataConvention = {
Swift: 0,
Block: 1,
Thin: 2,
CFunctionPointer: 3
};
var FunctionConventionStrings = ["swift", "block", "thin", "c"];
function RelativeIndirectablePointer(addr) {
var relativeOffsetPlusIndirect = Memory.readS32(addr);
var offset = relativeOffsetPlusIndirect & ~1;
var val = addr.add(offset);
if ((relativeOffsetPlusIndirect & 1) === 0) {
return val;
} else {
return Memory.readPointer(val);
}
}
function ConstTargetFarRelativeDirectPointer(ptr) {
var offset = Memory.readPointer(ptr);
return ptr.add(offset);
}
function TargetRelativeDirectPointerRuntime(ptr, nullable) {
var offset = Memory.readS32(ptr);
if (nullable && offset === 0) return null;
return ptr.add(offset);
}
var GenericParameterDescriptorFlags = {
HasParent: 1,
HasGenericParent: 2
};
function TargetNominalTypeDescriptor(ptr) {
this._ptr = ptr;
}
TargetNominalTypeDescriptor.prototype = {
get mangledName() {
var addr = TargetRelativeDirectPointerRuntime(this._ptr, true);
return mangling.MANGLING_PREFIX + "0" + Memory.readUtf8String(addr);
},
get clas() {
if (this.getKind() !== "Class" && this.getKind() !== "Struct") throw new Error('this nominal type descriptor has no class or struct metadata');
var ptr = this._ptr.add(4);
return {
_ptr: ptr,
get numFields() {
return Memory.readU32(ptr.add(0));
},
get fieldOffsetVectorOffset() {
return Memory.readU32(ptr.add(4));
},
get fieldNames() {
return TargetRelativeDirectPointerRuntime(ptr.add(8), true);
},
get getFieldTypes() {
return TargetRelativeDirectPointerRuntime(ptr.add(12), true);
},
hasFieldOffsetVector: function hasFieldOffsetVector() {
return this.fieldOffsetVectorOffset !== 0;
}
};
},
get struct() {
if (this.getKind() !== "Struct") throw new Error('this nominal type descriptor has no enum metadata');
return this.clas;
},
get enum_() {
var ptr = this._ptr.add(4);
if (this.getKind() !== "Enum" && this.getKind() !== "Optional") throw new Error('this nominal type descriptor has no enum metadata');
return {
get numPayloadCasesAndPayloadSizeOffset() {
return Memory.readU32(ptr.add(0));
},
get numEmptyCases() {
return Memory.readU32(ptr.add(4));
},
get caseNames() {
return TargetRelativeDirectPointerRuntime(ptr.add(8), true);
},
get getCaseTypes() {
return TargetRelativeDirectPointerRuntime(ptr.add(12), true);
},
getNumPayloadCases: function getNumPayloadCases() {
return this.numPayloadCasesAndPayloadSizeOffset & 0x00FFFFFF;
},
getNumCases: function getNumCases() {
return this.getNumPayloadCases() + this.numEmptyCases;
},
getPayloadSizeOffset: function getPayloadSizeOffset() {
return (this.numPayloadCasesAndPayloadSizeOffset & 0xFF000000) >> 24;
},
hasPayloadSizeOffset: function hasPayloadSizeOffset() {
return this.getPayloadSizeOffset() !== 0;
}
};
},
get genericMetadataPatternAndKind() {
return RelativeDirectPointerIntPair(this._ptr.add(20));
},
get accessFunction() {
return TargetRelativeDirectPointerRuntime(this._ptr.add(24), true);
},
getGenericMetadataPattern: function getGenericMetadataPattern() {
return new TargetGenericMetadata(this.genericMetadataPatternAndKind.pointer);
},
getKind: function getKind() {
return NominalTypeKind[this.genericMetadataPatternAndKind.intVal];
},
offsetToNameOffset: function offsetToNameOffset() {
return 0;
},
get genericParams() {
var ptr = this._ptr.add(28);
return {
get offset() {
if (!this.isGeneric()) throw new Error("not generic!");
return Memory.readU32(ptr.add(0));
},
get numGenericRequirements() {
return Memory.readU32(ptr.add(4));
},
get numPrimaryParams() {
return Memory.readU32(ptr.add(8));
},
get flags() {
return flagsToObject(GenericParameterDescriptorFlags, Memory.readU32(ptr.add(12)));
},
hasGenericRequirements: function hasGenericRequirements() {
return this.numGenericRequirements > 0;
},
isGeneric: function isGeneric() {
return this.hasGenericRequirements() || this.flags.HasGenericParent;
}
};
},
toString: function toString() {
return "[TargetNominalType@" + this._ptr + ": " + this.mangledName + "]";
},
getGenericArgs: function getGenericArgs(canon) {
var params = this.genericParams;
var args = [];
if (params.hasGenericRequirements()) {
var offset = params.offset << (0, _log2.default)(Process.pointerSize);
for (var i = 0; i < params.numPrimaryParams; i++) {
var _ptr = Memory.readPointer(canon._ptr.add(offset));
if (_ptr.isNull()) args.push(null);else args.push(new TargetMetadata(_ptr));
offset += Process.pointerSize;
}
}
return args;
}
};
function TargetTypeMetadataRecord(record) {
this._record = record;
}
TargetTypeMetadataRecord.prototype = {
get _directType() {
return TargetRelativeDirectPointerRuntime(this._record, true);
},
get _typeDescriptor() {
return TargetRelativeDirectPointerRuntime(this._record, true);
},
get _flags() {
return Memory.readUInt(this._record.add(4));
},
getTypeKind: function getTypeKind() {
var TypeKindMask = 0x0000000F;
var TypeKindShift = 0;
return (this._flags & TypeKindMask) >>> TypeKindShift;     },
getDirectType: function getDirectType() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.NonuniqueDirectType:
case TypeMetadataRecordKind.UniqueDirectClass:
break;
case TypeMetadataRecordKind.UniqueIndirectClass:
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
throw new Error("not direct type metadata");
default:
throw new Error("invalid type kind");
}
return this._directType;
},
getNominalTypeDescriptor: function getNominalTypeDescriptor() {
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.Universal:
return null;
case TypeMetadataRecordKind.UniqueNominalTypeDescriptor:
break;
case TypeMetadataRecordKind.UniqueDirectClass:
case TypeMetadataRecordKind.UniqueIndirectClass:
case TypeMetadataRecordKind.UniqueDirectType:
case TypeMetadataRecordKind.NonuniqueDirectType:
throw new Error("not generic metadata pattern");
default:
throw new Error("invalid type kind");
}
return new TargetNominalTypeDescriptor(this._typeDescriptor);
},
getCanonicalTypeMetadata: function getCanonicalTypeMetadata(api) {
var res = null;
switch (this.getTypeKind()) {
case TypeMetadataRecordKind.UniqueDirectType:
res = this.getDirectType();
break;
case TypeMetadataRecordKind.NonuniqueDirectType:
res = api.swift_getForeignTypeMetadata(this.getDirectType());
break;
case TypeMetadataRecordKind.UniqueDirectClass:
var directType = this.getDirectType();
if (directType) {
res = api.swift_getObjCClassMetadata(directType);
}
break;
default:
break;
}
return res === null ? null : new TargetMetadata(res);
}
};
function OpaqueExistentialContainer(pointer) {
this._ptr = pointer;
}
OpaqueExistentialContainer.prototype = {
get fixedSizeBuffer0() {
return Memory.readPointer(this._ptr.add(0));
},
set fixedSizeBuffer0(value) {
Memory.writePointer(this._ptr.add(0), value);
},
get heapObject() {
return new HeapObject(this.fixedSizeBuffer0);
},
get fixedSizeBuffer1() {
return Memory.readPointer(this._ptr.add(Process.pointerSize));
},
get fixedSizeBuffer2() {
return Memory.readPointer(this._ptr.add(2 * Process.pointerSize));
},
get type() {
return new TargetMetadata(Memory.readPointer(this._ptr.add(3 * Process.pointerSize)));
},
set type(value) {
Memory.writePointer(this._ptr.add(3 * Process.pointerSize), value._ptr);
},
getWitnessTable: function getWitnessTable(index) {
return Memory.readPointer(this._ptr.add((4 + index) * Process.pointerSize));
},
setWitnessTable: function setWitnessTable(index, val) {
return Memory.writePointer(this._ptr.add((4 + index) * Process.pointerSize), val);
}
};
function ClassExistentialContainer(pointer) {
this._ptr = pointer;
}
ClassExistentialContainer.prototype = {
get heapObject() {
return new HeapObject(Memory.readPointer(this._ptr.add(0)));
},
getWitnessTable: function getWitnessTable(index) {
return Memory.readPointer(this._ptr.add((1 + index) * Process.pointerSize));
}
};
function HeapObject(pointer) {
this._ptr = pointer;
}
HeapObject.prototype = {
get heapMetadata() {
return new TargetMetadata(Memory.readPointer(this._ptr.add(0)));
}
};
var ProtocolClassConstraint = {
Class: 0,
Any: 1
};
module.exports = {
TargetMetadata: TargetMetadata,
TargetClassMetadata: TargetClassMetadata,
TargetProtocolConformanceRecord: TargetProtocolConformanceRecord,
TargetTypeMetadataRecord: TargetTypeMetadataRecord,
TargetNominalTypeDescriptor: TargetNominalTypeDescriptor,
TargetFunctionTypeFlags: TargetFunctionTypeFlags,
NominalTypeKind: NominalTypeKind,
TypeMetadataRecordKind: TypeMetadataRecordKind,
FieldTypeFlags: FieldTypeFlags,
FunctionMetadataConvention: FunctionMetadataConvention,
FunctionConventionStrings: FunctionConventionStrings,
MetadataKind: MetadataKind,
OpaqueExistentialContainer: OpaqueExistentialContainer,
ClassExistentialContainer: ClassExistentialContainer,
ProtocolClassConstraint: ProtocolClassConstraint,
TargetProtocolDescriptor: TargetProtocolDescriptor
};
},{"./mangling":5,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/math/log2":11,"babel-runtime/core-js/object/create":12,"babel-runtime/core-js/object/entries":15}],7:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":26}],8:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":27}],9:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":28}],10:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":29}],11:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/math/log2"), __esModule: true };
},{"core-js/library/fn/math/log2":30}],12:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":31}],13:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-properties"), __esModule: true };
},{"core-js/library/fn/object/define-properties":32}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":33}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/entries"), __esModule: true };
},{"core-js/library/fn/object/entries":34}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptors"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptors":35}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/keys"), __esModule: true };
},{"core-js/library/fn/object/keys":36}],18:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/prevent-extensions"), __esModule: true };
},{"core-js/library/fn/object/prevent-extensions":37}],19:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/define-property"), __esModule: true };
},{"core-js/library/fn/reflect/define-property":38}],20:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/delete-property"), __esModule: true };
},{"core-js/library/fn/reflect/delete-property":39}],21:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/reflect/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/reflect/set-prototype-of":40}],22:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/set"), __esModule: true };
},{"core-js/library/fn/set":41}],23:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":42}],24:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":43}],25:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var _iterator = require("../core-js/symbol/iterator");
var _iterator2 = _interopRequireDefault(_iterator);
var _symbol = require("../core-js/symbol");
var _symbol2 = _interopRequireDefault(_symbol);
var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":23,"../core-js/symbol/iterator":24}],26:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":58,"../../modules/es6.array.from":124,"../../modules/es6.string.iterator":138}],27:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":123,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":150}],28:[function(require,module,exports){
var core = require('../../modules/_core');
var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
module.exports = function stringify(it) {   return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":58}],29:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
require('../modules/es7.map.of');
require('../modules/es7.map.from');
module.exports = require('../modules/_core').Map;
},{"../modules/_core":58,"../modules/es6.map":126,"../modules/es6.object.to-string":133,"../modules/es6.string.iterator":138,"../modules/es7.map.from":140,"../modules/es7.map.of":141,"../modules/es7.map.to-json":142,"../modules/web.dom.iterable":150}],30:[function(require,module,exports){
require('../../modules/es6.math.log2');
module.exports = require('../../modules/_core').Math.log2;
},{"../../modules/_core":58,"../../modules/es6.math.log2":127}],31:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
return $Object.create(P, D);
};
},{"../../modules/_core":58,"../../modules/es6.object.create":128}],32:[function(require,module,exports){
require('../../modules/es6.object.define-properties');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperties(T, D) {
return $Object.defineProperties(T, D);
};
},{"../../modules/_core":58,"../../modules/es6.object.define-properties":129}],33:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":58,"../../modules/es6.object.define-property":130}],34:[function(require,module,exports){
require('../../modules/es7.object.entries');
module.exports = require('../../modules/_core').Object.entries;
},{"../../modules/_core":58,"../../modules/es7.object.entries":143}],35:[function(require,module,exports){
require('../../modules/es7.object.get-own-property-descriptors');
module.exports = require('../../modules/_core').Object.getOwnPropertyDescriptors;
},{"../../modules/_core":58,"../../modules/es7.object.get-own-property-descriptors":144}],36:[function(require,module,exports){
require('../../modules/es6.object.keys');
module.exports = require('../../modules/_core').Object.keys;
},{"../../modules/_core":58,"../../modules/es6.object.keys":131}],37:[function(require,module,exports){
require('../../modules/es6.object.prevent-extensions');
module.exports = require('../../modules/_core').Object.preventExtensions;
},{"../../modules/_core":58,"../../modules/es6.object.prevent-extensions":132}],38:[function(require,module,exports){
require('../../modules/es6.reflect.define-property');
module.exports = require('../../modules/_core').Reflect.defineProperty;
},{"../../modules/_core":58,"../../modules/es6.reflect.define-property":134}],39:[function(require,module,exports){
require('../../modules/es6.reflect.delete-property');
module.exports = require('../../modules/_core').Reflect.deleteProperty;
},{"../../modules/_core":58,"../../modules/es6.reflect.delete-property":135}],40:[function(require,module,exports){
require('../../modules/es6.reflect.set-prototype-of');
module.exports = require('../../modules/_core').Reflect.setPrototypeOf;
},{"../../modules/_core":58,"../../modules/es6.reflect.set-prototype-of":136}],41:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.set');
require('../modules/es7.set.to-json');
require('../modules/es7.set.of');
require('../modules/es7.set.from');
module.exports = require('../modules/_core').Set;
},{"../modules/_core":58,"../modules/es6.object.to-string":133,"../modules/es6.set":137,"../modules/es6.string.iterator":138,"../modules/es7.set.from":145,"../modules/es7.set.of":146,"../modules/es7.set.to-json":147,"../modules/web.dom.iterable":150}],42:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":58,"../../modules/es6.object.to-string":133,"../../modules/es6.symbol":139,"../../modules/es7.symbol.async-iterator":148,"../../modules/es7.symbol.observable":149}],43:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks-ext').f('iterator');
},{"../../modules/_wks-ext":120,"../../modules/es6.string.iterator":138,"../../modules/web.dom.iterable":150}],44:[function(require,module,exports){
module.exports = function (it) {
if (typeof it != 'function') throw TypeError(it + ' is not a function!');
return it;
};
},{}],45:[function(require,module,exports){
module.exports = function () {  };
},{}],46:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
throw TypeError(name + ': incorrect invocation!');
} return it;
};
},{}],47:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
if (!isObject(it)) throw TypeError(it + ' is not an object!');
return it;
};
},{"./_is-object":77}],48:[function(require,module,exports){
var forOf = require('./_for-of');
module.exports = function (iter, ITERATOR) {
var result = [];
forOf(iter, false, result.push, result, ITERATOR);
return result;
};
},{"./_for-of":68}],49:[function(require,module,exports){
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
return function ($this, el, fromIndex) {
var O = toIObject($this);
var length = toLength(O.length);
var index = toAbsoluteIndex(fromIndex, length);
var value;
if (IS_INCLUDES && el != el) while (length > index) {
value = O[index++];
if (value != value) return true;
} else for (;length > index; index++) if (IS_INCLUDES || index in O) {
if (O[index] === el) return IS_INCLUDES || index || 0;
} return !IS_INCLUDES && -1;
};
};
},{"./_to-absolute-index":111,"./_to-iobject":113,"./_to-length":114}],50:[function(require,module,exports){
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
var IS_MAP = TYPE == 1;
var IS_FILTER = TYPE == 2;
var IS_SOME = TYPE == 3;
var IS_EVERY = TYPE == 4;
var IS_FIND_INDEX = TYPE == 6;
var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
var create = $create || asc;
return function ($this, callbackfn, that) {
var O = toObject($this);
var self = IObject(O);
var f = ctx(callbackfn, that, 3);
var length = toLength(self.length);
var index = 0;
var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
var val, res;
for (;length > index; index++) if (NO_HOLES || index in self) {
val = self[index];
res = f(val, index, O);
if (TYPE) {
if (IS_MAP) result[index] = res;           else if (res) switch (TYPE) {
case 3: return true;                       case 5: return val;                        case 6: return index;                      case 2: result.push(val);                } else if (IS_EVERY) return false;       }
}
return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
};
};
},{"./_array-species-create":52,"./_ctx":60,"./_iobject":74,"./_to-length":114,"./_to-object":115}],51:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');
module.exports = function (original) {
var C;
if (isArray(original)) {
C = original.constructor;
if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
if (isObject(C)) {
C = C[SPECIES];
if (C === null) C = undefined;
}
} return C === undefined ? Array : C;
};
},{"./_is-array":76,"./_is-object":77,"./_wks":121}],52:[function(require,module,exports){
var speciesConstructor = require('./_array-species-constructor');
module.exports = function (original, length) {
return new (speciesConstructor(original))(length);
};
},{"./_array-species-constructor":51}],53:[function(require,module,exports){
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
var ARG = cof(function () { return arguments; }()) == 'Arguments';
var tryGet = function (it, key) {
try {
return it[key];
} catch (e) {  }
};
module.exports = function (it) {
var O, T, B;
return it === undefined ? 'Undefined' : it === null ? 'Null'
: typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
: ARG ? cof(O)
: (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":54,"./_wks":121}],54:[function(require,module,exports){
var toString = {}.toString;
module.exports = function (it) {
return toString.call(it).slice(8, -1);
};
},{}],55:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';
var getEntry = function (that, key) {
var index = fastKey(key);
var entry;
if (index !== 'F') return that._i[index];
for (entry = that._f; entry; entry = entry.n) {
if (entry.k == key) return entry;
}
};
module.exports = {
getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
var C = wrapper(function (that, iterable) {
anInstance(that, C, NAME, '_i');
that._t = NAME;               that._i = create(null);       that._f = undefined;          that._l = undefined;          that[SIZE] = 0;               if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
});
redefineAll(C.prototype, {
clear: function clear() {
for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
entry.r = true;
if (entry.p) entry.p = entry.p.n = undefined;
delete data[entry.i];
}
that._f = that._l = undefined;
that[SIZE] = 0;
},
'delete': function (key) {
var that = validate(this, NAME);
var entry = getEntry(that, key);
if (entry) {
var next = entry.n;
var prev = entry.p;
delete that._i[entry.i];
entry.r = true;
if (prev) prev.n = next;
if (next) next.p = prev;
if (that._f == entry) that._f = next;
if (that._l == entry) that._l = prev;
that[SIZE]--;
} return !!entry;
},
forEach: function forEach(callbackfn ) {
validate(this, NAME);
var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
var entry;
while (entry = entry ? entry.n : this._f) {
f(entry.v, entry.k, this);
while (entry && entry.r) entry = entry.p;
}
},
has: function has(key) {
return !!getEntry(validate(this, NAME), key);
}
});
if (DESCRIPTORS) dP(C.prototype, 'size', {
get: function () {
return validate(this, NAME)[SIZE];
}
});
return C;
},
def: function (that, key, value) {
var entry = getEntry(that, key);
var prev, index;
if (entry) {
entry.v = value;
} else {
that._l = entry = {
i: index = fastKey(key, true),         k: key,                                v: value,                              p: prev = that._l,                     n: undefined,                          r: false                             };
if (!that._f) that._f = entry;
if (prev) prev.n = entry;
that[SIZE]++;
if (index !== 'F') that._i[index] = entry;
} return that;
},
getEntry: getEntry,
setStrong: function (C, NAME, IS_MAP) {
$iterDefine(C, NAME, function (iterated, kind) {
this._t = validate(iterated, NAME);       this._k = kind;                           this._l = undefined;                    }, function () {
var that = this;
var kind = that._k;
var entry = that._l;
while (entry && entry.r) entry = entry.p;
if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
that._t = undefined;
return step(1);
}
if (kind == 'keys') return step(0, entry.k);
if (kind == 'values') return step(0, entry.v);
return step(0, [entry.k, entry.v]);
}, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
setSpecies(NAME);
}
};
},{"./_an-instance":46,"./_ctx":60,"./_descriptors":62,"./_for-of":68,"./_iter-define":80,"./_iter-step":82,"./_meta":85,"./_object-create":86,"./_object-dp":87,"./_redefine-all":101,"./_set-species":106,"./_validate-collection":118}],56:[function(require,module,exports){
var classof = require('./_classof');
var from = require('./_array-from-iterable');
module.exports = function (NAME) {
return function toJSON() {
if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
return from(this);
};
};
},{"./_array-from-iterable":48,"./_classof":53}],57:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var meta = require('./_meta');
var fails = require('./_fails');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var setToStringTag = require('./_set-to-string-tag');
var dP = require('./_object-dp').f;
var each = require('./_array-methods')(0);
var DESCRIPTORS = require('./_descriptors');
module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
var Base = global[NAME];
var C = Base;
var ADDER = IS_MAP ? 'set' : 'add';
var proto = C && C.prototype;
var O = {};
if (!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
new C().entries().next();
}))) {
C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
redefineAll(C.prototype, methods);
meta.NEED = true;
} else {
C = wrapper(function (target, iterable) {
anInstance(target, C, NAME, '_c');
target._c = new Base();
if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
});
each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','), function (KEY) {
var IS_ADDER = KEY == 'add' || KEY == 'set';
if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
anInstance(this, C, KEY);
if (!IS_ADDER && IS_WEAK && !isObject(a)) return KEY == 'get' ? undefined : false;
var result = this._c[KEY](a === 0 ? 0 : a, b);
return IS_ADDER ? this : result;
});
});
IS_WEAK || dP(C.prototype, 'size', {
get: function () {
return this._c.size;
}
});
}
setToStringTag(C, NAME);
O[NAME] = C;
$export($export.G + $export.W + $export.F, O);
if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
return C;
};
},{"./_an-instance":46,"./_array-methods":50,"./_descriptors":62,"./_export":66,"./_fails":67,"./_for-of":68,"./_global":69,"./_hide":71,"./_is-object":77,"./_meta":85,"./_object-dp":87,"./_redefine-all":101,"./_set-to-string-tag":107}],58:[function(require,module,exports){
var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core; 
},{}],59:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = function (object, index, value) {
if (index in object) $defineProperty.f(object, index, createDesc(0, value));
else object[index] = value;
};
},{"./_object-dp":87,"./_property-desc":100}],60:[function(require,module,exports){
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
aFunction(fn);
if (that === undefined) return fn;
switch (length) {
case 1: return function (a) {
return fn.call(that, a);
};
case 2: return function (a, b) {
return fn.call(that, a, b);
};
case 3: return function (a, b, c) {
return fn.call(that, a, b, c);
};
}
return function () {
return fn.apply(that, arguments);
};
};
},{"./_a-function":44}],61:[function(require,module,exports){
module.exports = function (it) {
if (it == undefined) throw TypeError("Can't call method on  " + it);
return it;
};
},{}],62:[function(require,module,exports){
module.exports = !require('./_fails')(function () {
return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});
},{"./_fails":67}],63:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
return is ? document.createElement(it) : {};
};
},{"./_global":69,"./_is-object":77}],64:[function(require,module,exports){
module.exports = (
'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],65:[function(require,module,exports){
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
var result = getKeys(it);
var getSymbols = gOPS.f;
if (getSymbols) {
var symbols = getSymbols(it);
var isEnum = pIE.f;
var i = 0;
var key;
while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
} return result;
};
},{"./_object-gops":92,"./_object-keys":95,"./_object-pie":96}],66:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var PROTOTYPE = 'prototype';
var $export = function (type, name, source) {
var IS_FORCED = type & $export.F;
var IS_GLOBAL = type & $export.G;
var IS_STATIC = type & $export.S;
var IS_PROTO = type & $export.P;
var IS_BIND = type & $export.B;
var IS_WRAP = type & $export.W;
var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
var expProto = exports[PROTOTYPE];
var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
var key, own, out;
if (IS_GLOBAL) source = name;
for (key in source) {
own = !IS_FORCED && target && target[key] !== undefined;
if (own && key in exports) continue;
out = own ? target[key] : source[key];
exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
: IS_BIND && own ? ctx(out, global)
: IS_WRAP && target[key] == out ? (function (C) {
var F = function (a, b, c) {
if (this instanceof C) {
switch (arguments.length) {
case 0: return new C();
case 1: return new C(a);
case 2: return new C(a, b);
} return new C(a, b, c);
} return C.apply(this, arguments);
};
F[PROTOTYPE] = C[PROTOTYPE];
return F;
})(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
if (IS_PROTO) {
(exports.virtual || (exports.virtual = {}))[key] = out;
if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
}
}
};
$export.F = 1;   $export.G = 2;   $export.S = 4;   $export.P = 8;   $export.B = 16;  $export.W = 32;  $export.U = 64;  $export.R = 128; module.exports = $export;
},{"./_core":58,"./_ctx":60,"./_global":69,"./_hide":71}],67:[function(require,module,exports){
module.exports = function (exec) {
try {
return !!exec();
} catch (e) {
return true;
}
};
},{}],68:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
var f = ctx(fn, that, entries ? 2 : 1);
var index = 0;
var length, step, iterator, result;
if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
if (result === BREAK || result === RETURN) return result;
} else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
result = call(iterator, f, step.value, entries);
if (result === BREAK || result === RETURN) return result;
}
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;
},{"./_an-object":47,"./_ctx":60,"./_is-array-iter":75,"./_iter-call":78,"./_to-length":114,"./core.get-iterator-method":122}],69:[function(require,module,exports){
var global = module.exports = typeof window != 'undefined' && window.Math == Math
? window : typeof self != 'undefined' && self.Math == Math ? self
: Function('return this')();
if (typeof __g == 'number') __g = global; 
},{}],70:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
return hasOwnProperty.call(it, key);
};
},{}],71:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
object[key] = value;
return object;
};
},{"./_descriptors":62,"./_object-dp":87,"./_property-desc":100}],72:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;
},{"./_global":69}],73:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});
},{"./_descriptors":62,"./_dom-create":63,"./_fails":67}],74:[function(require,module,exports){
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":54}],75:[function(require,module,exports){
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;
module.exports = function (it) {
return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":83,"./_wks":121}],76:[function(require,module,exports){
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
return cof(arg) == 'Array';
};
},{"./_cof":54}],77:[function(require,module,exports){
module.exports = function (it) {
return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],78:[function(require,module,exports){
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
try {
return entries ? fn(anObject(value)[0], value[1]) : fn(value);
} catch (e) {
var ret = iterator['return'];
if (ret !== undefined) anObject(ret.call(iterator));
throw e;
}
};
},{"./_an-object":47}],79:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });
module.exports = function (Constructor, NAME, next) {
Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":71,"./_object-create":86,"./_property-desc":100,"./_set-to-string-tag":107,"./_wks":121}],80:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var has = require('./_has');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';
var returnThis = function () { return this; };
module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
$iterCreate(Constructor, NAME, next);
var getMethod = function (kind) {
if (!BUGGY && kind in proto) return proto[kind];
switch (kind) {
case KEYS: return function keys() { return new Constructor(this, kind); };
case VALUES: return function values() { return new Constructor(this, kind); };
} return function entries() { return new Constructor(this, kind); };
};
var TAG = NAME + ' Iterator';
var DEF_VALUES = DEFAULT == VALUES;
var VALUES_BUG = false;
var proto = Base.prototype;
var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
var $default = $native || getMethod(DEFAULT);
var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
var methods, key, IteratorPrototype;
if ($anyNative) {
IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
setToStringTag(IteratorPrototype, TAG, true);
if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
}
}
if (DEF_VALUES && $native && $native.name !== VALUES) {
VALUES_BUG = true;
$default = function values() { return $native.call(this); };
}
if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
hide(proto, ITERATOR, $default);
}
Iterators[NAME] = $default;
Iterators[TAG] = returnThis;
if (DEFAULT) {
methods = {
values: DEF_VALUES ? $default : getMethod(VALUES),
keys: IS_SET ? $default : getMethod(KEYS),
entries: $entries
};
if (FORCED) for (key in methods) {
if (!(key in proto)) redefine(proto, key, methods[key]);
} else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
}
return methods;
};
},{"./_export":66,"./_has":70,"./_hide":71,"./_iter-create":79,"./_iterators":83,"./_library":84,"./_object-gpo":93,"./_redefine":102,"./_set-to-string-tag":107,"./_wks":121}],81:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;
try {
var riter = [7][ITERATOR]();
riter['return'] = function () { SAFE_CLOSING = true; };
Array.from(riter, function () { throw 2; });
} catch (e) {  }
module.exports = function (exec, skipClosing) {
if (!skipClosing && !SAFE_CLOSING) return false;
var safe = false;
try {
var arr = [7];
var iter = arr[ITERATOR]();
iter.next = function () { return { done: safe = true }; };
arr[ITERATOR] = function () { return iter; };
exec(arr);
} catch (e) {  }
return safe;
};
},{"./_wks":121}],82:[function(require,module,exports){
module.exports = function (done, value) {
return { value: value, done: !!done };
};
},{}],83:[function(require,module,exports){
module.exports = {};
},{}],84:[function(require,module,exports){
module.exports = true;
},{}],85:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
return true;
};
var FREEZE = !require('./_fails')(function () {
return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
setDesc(it, META, { value: {
i: 'O' + ++id,     w: {}            } });
};
var fastKey = function (it, create) {
if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
if (!has(it, META)) {
if (!isExtensible(it)) return 'F';
if (!create) return 'E';
setMeta(it);
} return it[META].i;
};
var getWeak = function (it, create) {
if (!has(it, META)) {
if (!isExtensible(it)) return true;
if (!create) return false;
setMeta(it);
} return it[META].w;
};
var onFreeze = function (it) {
if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
return it;
};
var meta = module.exports = {
KEY: META,
NEED: false,
fastKey: fastKey,
getWeak: getWeak,
onFreeze: onFreeze
};
},{"./_fails":67,"./_has":70,"./_is-object":77,"./_object-dp":87,"./_uid":117}],86:[function(require,module,exports){
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () {  };
var PROTOTYPE = 'prototype';
var createDict = function () {
var iframe = require('./_dom-create')('iframe');
var i = enumBugKeys.length;
var lt = '<';
var gt = '>';
var iframeDocument;
iframe.style.display = 'none';
require('./_html').appendChild(iframe);
iframe.src = 'javascript:';       iframeDocument = iframe.contentWindow.document;
iframeDocument.open();
iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
iframeDocument.close();
createDict = iframeDocument.F;
while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
return createDict();
};
module.exports = Object.create || function create(O, Properties) {
var result;
if (O !== null) {
Empty[PROTOTYPE] = anObject(O);
result = new Empty();
Empty[PROTOTYPE] = null;
result[IE_PROTO] = O;
} else result = createDict();
return Properties === undefined ? result : dPs(result, Properties);
};
},{"./_an-object":47,"./_dom-create":63,"./_enum-bug-keys":64,"./_html":72,"./_object-dps":88,"./_shared-key":108}],87:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;
exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
anObject(O);
P = toPrimitive(P, true);
anObject(Attributes);
if (IE8_DOM_DEFINE) try {
return dP(O, P, Attributes);
} catch (e) {  }
if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
if ('value' in Attributes) O[P] = Attributes.value;
return O;
};
},{"./_an-object":47,"./_descriptors":62,"./_ie8-dom-define":73,"./_to-primitive":116}],88:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');
module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
anObject(O);
var keys = getKeys(Properties);
var length = keys.length;
var i = 0;
var P;
while (length > i) dP.f(O, P = keys[i++], Properties[P]);
return O;
};
},{"./_an-object":47,"./_descriptors":62,"./_object-dp":87,"./_object-keys":95}],89:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;
exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
O = toIObject(O);
P = toPrimitive(P, true);
if (IE8_DOM_DEFINE) try {
return gOPD(O, P);
} catch (e) {  }
if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":62,"./_has":70,"./_ie8-dom-define":73,"./_object-pie":96,"./_property-desc":100,"./_to-iobject":113,"./_to-primitive":116}],90:[function(require,module,exports){
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;
var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
? Object.getOwnPropertyNames(window) : [];
var getWindowNames = function (it) {
try {
return gOPN(it);
} catch (e) {
return windowNames.slice();
}
};
module.exports.f = function getOwnPropertyNames(it) {
return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};
},{"./_object-gopn":91,"./_to-iobject":113}],91:[function(require,module,exports){
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":64,"./_object-keys-internal":94}],92:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],93:[function(require,module,exports){
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;
module.exports = Object.getPrototypeOf || function (O) {
O = toObject(O);
if (has(O, IE_PROTO)) return O[IE_PROTO];
if (typeof O.constructor == 'function' && O instanceof O.constructor) {
return O.constructor.prototype;
} return O instanceof Object ? ObjectProto : null;
};
},{"./_has":70,"./_shared-key":108,"./_to-object":115}],94:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');
module.exports = function (object, names) {
var O = toIObject(object);
var i = 0;
var result = [];
var key;
for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
while (names.length > i) if (has(O, key = names[i++])) {
~arrayIndexOf(result, key) || result.push(key);
}
return result;
};
},{"./_array-includes":49,"./_has":70,"./_shared-key":108,"./_to-iobject":113}],95:[function(require,module,exports){
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');
module.exports = Object.keys || function keys(O) {
return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":64,"./_object-keys-internal":94}],96:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],97:[function(require,module,exports){
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
var fn = (core.Object || {})[KEY] || Object[KEY];
var exp = {};
exp[KEY] = exec(fn);
$export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};
},{"./_core":58,"./_export":66,"./_fails":67}],98:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
return function (it) {
var O = toIObject(it);
var keys = getKeys(O);
var length = keys.length;
var i = 0;
var result = [];
var key;
while (length > i) if (isEnum.call(O, key = keys[i++])) {
result.push(isEntries ? [key, O[key]] : O[key]);
} return result;
};
};
},{"./_object-keys":95,"./_object-pie":96,"./_to-iobject":113}],99:[function(require,module,exports){
var gOPN = require('./_object-gopn');
var gOPS = require('./_object-gops');
var anObject = require('./_an-object');
var Reflect = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
var keys = gOPN.f(anObject(it));
var getSymbols = gOPS.f;
return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./_an-object":47,"./_global":69,"./_object-gopn":91,"./_object-gops":92}],100:[function(require,module,exports){
module.exports = function (bitmap, value) {
return {
enumerable: !(bitmap & 1),
configurable: !(bitmap & 2),
writable: !(bitmap & 4),
value: value
};
};
},{}],101:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function (target, src, safe) {
for (var key in src) {
if (safe && target[key]) target[key] = src[key];
else hide(target, key, src[key]);
} return target;
};
},{"./_hide":71}],102:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":71}],103:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var aFunction = require('./_a-function');
var ctx = require('./_ctx');
var forOf = require('./_for-of');
module.exports = function (COLLECTION) {
$export($export.S, COLLECTION, { from: function from(source ) {
var mapFn = arguments[1];
var mapping, A, n, cb;
aFunction(this);
mapping = mapFn !== undefined;
if (mapping) aFunction(mapFn);
if (source == undefined) return new this();
A = [];
if (mapping) {
n = 0;
cb = ctx(mapFn, arguments[2], 2);
forOf(source, false, function (nextItem) {
A.push(cb(nextItem, n++));
});
} else {
forOf(source, false, A.push, A);
}
return new this(A);
} });
};
},{"./_a-function":44,"./_ctx":60,"./_export":66,"./_for-of":68}],104:[function(require,module,exports){
'use strict';
var $export = require('./_export');
module.exports = function (COLLECTION) {
$export($export.S, COLLECTION, { of: function of() {
var length = arguments.length;
var A = Array(length);
while (length--) A[length] = arguments[length];
return new this(A);
} });
};
},{"./_export":66}],105:[function(require,module,exports){
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
anObject(O);
if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
set: Object.setPrototypeOf || ('__proto__' in {} ?     function (test, buggy, set) {
try {
set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
set(test, []);
buggy = !(test instanceof Array);
} catch (e) { buggy = true; }
return function setPrototypeOf(O, proto) {
check(O, proto);
if (buggy) O.__proto__ = proto;
else set(O, proto);
return O;
};
}({}, false) : undefined),
check: check
};
},{"./_an-object":47,"./_ctx":60,"./_is-object":77,"./_object-gopd":89}],106:[function(require,module,exports){
'use strict';
var global = require('./_global');
var core = require('./_core');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');
module.exports = function (KEY) {
var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
configurable: true,
get: function () { return this; }
});
};
},{"./_core":58,"./_descriptors":62,"./_global":69,"./_object-dp":87,"./_wks":121}],107:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');
module.exports = function (it, tag, stat) {
if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};
},{"./_has":70,"./_object-dp":87,"./_wks":121}],108:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":109,"./_uid":117}],109:[function(require,module,exports){
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
return store[key] || (store[key] = {});
};
},{"./_global":69}],110:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
module.exports = function (TO_STRING) {
return function (that, pos) {
var s = String(defined(that));
var i = toInteger(pos);
var l = s.length;
var a, b;
if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
a = s.charCodeAt(i);
return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
? TO_STRING ? s.charAt(i) : a
: TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
};
};
},{"./_defined":61,"./_to-integer":112}],111:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
index = toInteger(index);
return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":112}],112:[function(require,module,exports){
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],113:[function(require,module,exports){
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
return IObject(defined(it));
};
},{"./_defined":61,"./_iobject":74}],114:[function(require,module,exports){
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; };
},{"./_to-integer":112}],115:[function(require,module,exports){
var defined = require('./_defined');
module.exports = function (it) {
return Object(defined(it));
};
},{"./_defined":61}],116:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, S) {
if (!isObject(it)) return it;
var fn, val;
if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":77}],117:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],118:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
return it;
};
},{"./_is-object":77}],119:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};
},{"./_core":58,"./_global":69,"./_library":84,"./_object-dp":87,"./_wks-ext":120}],120:[function(require,module,exports){
exports.f = require('./_wks');
},{"./_wks":121}],121:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';
var $exports = module.exports = function (name) {
return store[name] || (store[name] =
USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
$exports.store = store;
},{"./_global":69,"./_shared":109,"./_uid":117}],122:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
if (it != undefined) return it[ITERATOR]
|| it['@@iterator']
|| Iterators[classof(it)];
};
},{"./_classof":53,"./_core":58,"./_iterators":83,"./_wks":121}],123:[function(require,module,exports){
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function (it) {
var iterFn = get(it);
if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
return anObject(iterFn.call(it));
};
},{"./_an-object":47,"./_core":58,"./core.get-iterator-method":122}],124:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
from: function from(arrayLike ) {
var O = toObject(arrayLike);
var C = typeof this == 'function' ? this : Array;
var aLen = arguments.length;
var mapfn = aLen > 1 ? arguments[1] : undefined;
var mapping = mapfn !== undefined;
var index = 0;
var iterFn = getIterFn(O);
var length, result, step, iterator;
if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
}
} else {
length = toLength(O.length);
for (result = new C(length); length > index; index++) {
createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
}
}
result.length = index;
return result;
}
});
},{"./_create-property":59,"./_ctx":60,"./_export":66,"./_is-array-iter":75,"./_iter-call":78,"./_iter-detect":81,"./_to-length":114,"./_to-object":115,"./core.get-iterator-method":122}],125:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
this._t = toIObject(iterated);   this._i = 0;                     this._k = kind;                }, function () {
var O = this._t;
var kind = this._k;
var index = this._i++;
if (!O || index >= O.length) {
this._t = undefined;
return step(1);
}
if (kind == 'keys') return step(0, index);
if (kind == 'values') return step(0, O[index]);
return step(0, [index, O[index]]);
}, 'values');
Iterators.Arguments = Iterators.Array;
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":45,"./_iter-define":80,"./_iter-step":82,"./_iterators":83,"./_to-iobject":113}],126:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';
module.exports = require('./_collection')(MAP, function (get) {
return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
get: function get(key) {
var entry = strong.getEntry(validate(this, MAP), key);
return entry && entry.v;
},
set: function set(key, value) {
return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
}
}, strong, true);
},{"./_collection":57,"./_collection-strong":55,"./_validate-collection":118}],127:[function(require,module,exports){
var $export = require('./_export');
$export($export.S, 'Math', {
log2: function log2(x) {
return Math.log(x) / Math.LN2;
}
});
},{"./_export":66}],128:[function(require,module,exports){
var $export = require('./_export');
$export($export.S, 'Object', { create: require('./_object-create') });
},{"./_export":66,"./_object-create":86}],129:[function(require,module,exports){
var $export = require('./_export');
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperties: require('./_object-dps') });
},{"./_descriptors":62,"./_export":66,"./_object-dps":88}],130:[function(require,module,exports){
var $export = require('./_export');
$export($export.S + $export.F * !require('./_descriptors'), 'Object', { defineProperty: require('./_object-dp').f });
},{"./_descriptors":62,"./_export":66,"./_object-dp":87}],131:[function(require,module,exports){
var toObject = require('./_to-object');
var $keys = require('./_object-keys');
require('./_object-sap')('keys', function () {
return function keys(it) {
return $keys(toObject(it));
};
});
},{"./_object-keys":95,"./_object-sap":97,"./_to-object":115}],132:[function(require,module,exports){
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;
require('./_object-sap')('preventExtensions', function ($preventExtensions) {
return function preventExtensions(it) {
return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
};
});
},{"./_is-object":77,"./_meta":85,"./_object-sap":97}],133:[function(require,module,exports){
},{}],134:[function(require,module,exports){
var dP = require('./_object-dp');
var $export = require('./_export');
var anObject = require('./_an-object');
var toPrimitive = require('./_to-primitive');
$export($export.S + $export.F * require('./_fails')(function () {
Reflect.defineProperty(dP.f({}, 1, { value: 1 }), 1, { value: 2 });
}), 'Reflect', {
defineProperty: function defineProperty(target, propertyKey, attributes) {
anObject(target);
propertyKey = toPrimitive(propertyKey, true);
anObject(attributes);
try {
dP.f(target, propertyKey, attributes);
return true;
} catch (e) {
return false;
}
}
});
},{"./_an-object":47,"./_export":66,"./_fails":67,"./_object-dp":87,"./_to-primitive":116}],135:[function(require,module,exports){
var $export = require('./_export');
var gOPD = require('./_object-gopd').f;
var anObject = require('./_an-object');
$export($export.S, 'Reflect', {
deleteProperty: function deleteProperty(target, propertyKey) {
var desc = gOPD(anObject(target), propertyKey);
return desc && !desc.configurable ? false : delete target[propertyKey];
}
});
},{"./_an-object":47,"./_export":66,"./_object-gopd":89}],136:[function(require,module,exports){
var $export = require('./_export');
var setProto = require('./_set-proto');
if (setProto) $export($export.S, 'Reflect', {
setPrototypeOf: function setPrototypeOf(target, proto) {
setProto.check(target, proto);
try {
setProto.set(target, proto);
return true;
} catch (e) {
return false;
}
}
});
},{"./_export":66,"./_set-proto":105}],137:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';
module.exports = require('./_collection')(SET, function (get) {
return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
add: function add(value) {
return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
}
}, strong);
},{"./_collection":57,"./_collection-strong":55,"./_validate-collection":118}],138:[function(require,module,exports){
'use strict';
var $at = require('./_string-at')(true);
require('./_iter-define')(String, 'String', function (iterated) {
this._t = String(iterated);   this._i = 0;                }, function () {
var O = this._t;
var index = this._i;
var point;
if (index >= O.length) return { value: undefined, done: true };
point = $at(O, index);
this._i += point.length;
return { value: point, done: false };
});
},{"./_iter-define":80,"./_string-at":110}],139:[function(require,module,exports){
'use strict';
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
var setSymbolDesc = DESCRIPTORS && $fails(function () {
return _create(dP({}, 'a', {
get: function () { return dP(this, 'a', { value: 7 }).a; }
})).a != 7;
}) ? function (it, key, D) {
var protoDesc = gOPD(ObjectProto, key);
if (protoDesc) delete ObjectProto[key];
dP(it, key, D);
if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;
var wrap = function (tag) {
var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
sym._k = tag;
return sym;
};
var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
return typeof it == 'symbol';
} : function (it) {
return it instanceof $Symbol;
};
var $defineProperty = function defineProperty(it, key, D) {
if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
anObject(it);
key = toPrimitive(key, true);
anObject(D);
if (has(AllSymbols, key)) {
if (!D.enumerable) {
if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
it[HIDDEN][key] = true;
} else {
if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
D = _create(D, { enumerable: createDesc(0, false) });
} return setSymbolDesc(it, key, D);
} return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
anObject(it);
var keys = enumKeys(P = toIObject(P));
var i = 0;
var l = keys.length;
var key;
while (l > i) $defineProperty(it, key = keys[i++], P[key]);
return it;
};
var $create = function create(it, P) {
return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
var E = isEnum.call(this, key = toPrimitive(key, true));
if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
it = toIObject(it);
key = toPrimitive(key, true);
if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
var D = gOPD(it, key);
if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
var names = gOPN(toIObject(it));
var result = [];
var i = 0;
var key;
while (names.length > i) {
if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
} return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
var IS_OP = it === ObjectProto;
var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
var result = [];
var i = 0;
var key;
while (names.length > i) {
if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
} return result;
};
if (!USE_NATIVE) {
$Symbol = function Symbol() {
if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
var $set = function (value) {
if (this === ObjectProto) $set.call(OPSymbols, value);
if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
setSymbolDesc(this, tag, createDesc(1, value));
};
if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
return wrap(tag);
};
redefine($Symbol[PROTOTYPE], 'toString', function toString() {
return this._k;
});
$GOPD.f = $getOwnPropertyDescriptor;
$DP.f = $defineProperty;
require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
require('./_object-pie').f = $propertyIsEnumerable;
require('./_object-gops').f = $getOwnPropertySymbols;
if (DESCRIPTORS && !require('./_library')) {
redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
}
wksExt.f = function (name) {
return wrap(wks(name));
};
}
$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });
for (var es6Symbols = (
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);
for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);
$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
'for': function (key) {
return has(SymbolRegistry, key += '')
? SymbolRegistry[key]
: SymbolRegistry[key] = $Symbol(key);
},
keyFor: function keyFor(sym) {
if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
},
useSetter: function () { setter = true; },
useSimple: function () { setter = false; }
});
$export($export.S + $export.F * !USE_NATIVE, 'Object', {
create: $create,
defineProperty: $defineProperty,
defineProperties: $defineProperties,
getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
getOwnPropertyNames: $getOwnPropertyNames,
getOwnPropertySymbols: $getOwnPropertySymbols
});
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
var S = $Symbol();
return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
stringify: function stringify(it) {
if (it === undefined || isSymbol(it)) return;     var args = [it];
var i = 1;
var replacer, $replacer;
while (arguments.length > i) args.push(arguments[i++]);
replacer = args[1];
if (typeof replacer == 'function') $replacer = replacer;
if ($replacer || !isArray(replacer)) replacer = function (key, value) {
if ($replacer) value = $replacer.call(this, key, value);
if (!isSymbol(value)) return value;
};
args[1] = replacer;
return _stringify.apply($JSON, args);
}
});
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
setToStringTag($Symbol, 'Symbol');
setToStringTag(Math, 'Math', true);
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":47,"./_descriptors":62,"./_enum-keys":65,"./_export":66,"./_fails":67,"./_global":69,"./_has":70,"./_hide":71,"./_is-array":76,"./_library":84,"./_meta":85,"./_object-create":86,"./_object-dp":87,"./_object-gopd":89,"./_object-gopn":91,"./_object-gopn-ext":90,"./_object-gops":92,"./_object-keys":95,"./_object-pie":96,"./_property-desc":100,"./_redefine":102,"./_set-to-string-tag":107,"./_shared":109,"./_to-iobject":113,"./_to-primitive":116,"./_uid":117,"./_wks":121,"./_wks-define":119,"./_wks-ext":120}],140:[function(require,module,exports){
require('./_set-collection-from')('Map');
},{"./_set-collection-from":103}],141:[function(require,module,exports){
require('./_set-collection-of')('Map');
},{"./_set-collection-of":104}],142:[function(require,module,exports){
var $export = require('./_export');
$export($export.P + $export.R, 'Map', { toJSON: require('./_collection-to-json')('Map') });
},{"./_collection-to-json":56,"./_export":66}],143:[function(require,module,exports){
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);
$export($export.S, 'Object', {
entries: function entries(it) {
return $entries(it);
}
});
},{"./_export":66,"./_object-to-array":98}],144:[function(require,module,exports){
var $export = require('./_export');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');
$export($export.S, 'Object', {
getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
var O = toIObject(object);
var getDesc = gOPD.f;
var keys = ownKeys(O);
var result = {};
var i = 0;
var key, desc;
while (keys.length > i) {
desc = getDesc(O, key = keys[i++]);
if (desc !== undefined) createProperty(result, key, desc);
}
return result;
}
});
},{"./_create-property":59,"./_export":66,"./_object-gopd":89,"./_own-keys":99,"./_to-iobject":113}],145:[function(require,module,exports){
require('./_set-collection-from')('Set');
},{"./_set-collection-from":103}],146:[function(require,module,exports){
require('./_set-collection-of')('Set');
},{"./_set-collection-of":104}],147:[function(require,module,exports){
var $export = require('./_export');
$export($export.P + $export.R, 'Set', { toJSON: require('./_collection-to-json')('Set') });
},{"./_collection-to-json":56,"./_export":66}],148:[function(require,module,exports){
require('./_wks-define')('asyncIterator');
},{"./_wks-define":119}],149:[function(require,module,exports){
require('./_wks-define')('observable');
},{"./_wks-define":119}],150:[function(require,module,exports){
require('./es6.array.iterator');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var TO_STRING_TAG = require('./_wks')('toStringTag');
var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
'TextTrackList,TouchList').split(',');
for (var i = 0; i < DOMIterables.length; i++) {
var NAME = DOMIterables[i];
var Collection = global[NAME];
var proto = Collection && Collection.prototype;
if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
Iterators[NAME] = Iterators.Array;
}
},{"./_global":69,"./_hide":71,"./_iterators":83,"./_wks":121,"./es6.array.iterator":125}],151:[function(require,module,exports){
'use strict';
var _defineProperty = require('babel-runtime/core-js/reflect/define-property');
var _defineProperty2 = _interopRequireDefault(_defineProperty);
var _preventExtensions = require('babel-runtime/core-js/object/prevent-extensions');
var _preventExtensions2 = _interopRequireDefault(_preventExtensions);
var _deleteProperty = require('babel-runtime/core-js/reflect/delete-property');
var _deleteProperty2 = _interopRequireDefault(_deleteProperty);
var _keys = require('babel-runtime/core-js/object/keys');
var _keys2 = _interopRequireDefault(_keys);
var _defineProperty3 = require('babel-runtime/core-js/object/define-property');
var _defineProperty4 = _interopRequireDefault(_defineProperty3);
var _getIterator2 = require('babel-runtime/core-js/get-iterator');
var _getIterator3 = _interopRequireDefault(_getIterator2);
var _defineProperties = require('babel-runtime/core-js/object/define-properties');
var _defineProperties2 = _interopRequireDefault(_defineProperties);
var _map = require('babel-runtime/core-js/map');
var _map2 = _interopRequireDefault(_map);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var metadata = require('./metadata');
var _require = require('./calling-convention'),
CC = _require.convention,
makeCallTrampoline = _require.makeCallTrampoline,
checkTrampolineError = _require.checkTrampolineError,
convertToCParams = _require.convertToCParams;
var selfPointers = new _map2.default();
var toCStringPtr = Module.findExportByName("libswiftFoundation.dylib", "_T0s14StringProtocolP10FoundationsAARzSS5IndexVADRtzlE01cA0Says4Int8VGSgSSACE8EncodingV5using_tF");
if (toCStringPtr) {
Interceptor.attach(toCStringPtr, {
onEnter: function onEnter() {
if (selfPointers.has(this.threadId)) {
this.context[CC.selfRegister] = selfPointers.get(this.threadId);
selfPointers.delete(this.threadId);
}
}
});
}
var dumpPtr = Module.findExportByName("libswiftCore.dylib", "_T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF");
var indirectResults = void 0;
if (dumpPtr && CC.indirectResultRegister !== undefined) {
indirectResults = new _map2.default();
Interceptor.attach(dumpPtr, {
onEnter: function onEnter() {
if (indirectResults.has(this.threadId)) {
this.context[CC.indirectResultRegister] = indirectResults.get(this.threadId)[1];
indirectResults.delete(this.threadId);
}
}
});
}
function swiftToString(obj) {
var type = obj.$type;
var pointer = obj.$pointer;
/*
* built by disassembling the code for this snippet:
*
var str = String()
dump(x, to: &str)
let arr : [CChar] = str.cString(using: String.Encoding.utf8)!
let ptr = UnsafePointer<CChar>(arr)
strlen(ptr)
*/
function __swift_destroy_boxed_opaque_existential_0(pointer) {
var opaque = new metadata.OpaqueExistentialContainer(pointer);
var type = opaque.type;
var vwt = opaque.type.valueWitnessTable;
if (vwt.flags.IsNonInline) {
var _swift_release_ = new NativeFunction(Memory.readPointer(Swift._api._swift_release), 'void', ['pointer']);
_swift_release_(opaque.fixedSizeBuffer0);
} else {
vwt.destroy(pointer, type._ptr);
}
}
var SwiftString = Swift._typesByName.get("Swift.String");
if (!SwiftString.canonicalType) SwiftString = SwiftString.withGenericParams();
var dynamicType = void 0;
var copy = Memory.alloc(4 * Process.pointerSize);
var copyFn = void 0;
var vwt = type.canonicalType.valueWitnessTable;
if (type.kind === "Existential" && type.canonicalType.getRepresentation() === "Opaque") {
dynamicType = Swift._api.swift_getDynamicType(pointer, type.canonicalType._ptr, 1);
copyFn = vwt.initializeBufferWithCopyOfBuffer;
} else {
dynamicType = type.canonicalType._ptr;
copyFn = vwt.initializeBufferWithCopy;
}
copyFn.call(vwt, copy, pointer, dynamicType);
Memory.writePointer(copy.add(3 * Process.pointerSize), dynamicType);
var stringResult = Memory.alloc(Process.pointerSize * 3);
Memory.writePointer(stringResult, Swift._api._T0s19_emptyStringStorages6UInt32Vv);
Memory.writePointer(stringResult.add(Process.pointerSize), ptr(0));
Memory.writePointer(stringResult.add(2 * Process.pointerSize), ptr(0));
var textOutputStreamWitnessTableForString = Swift._api._T0SSs16TextOutputStreamsWP;
var Any = Swift._api.swift_getExistentialTypeMetadata(1, ptr(0), 0, ptr(0));
var dump = Swift._api._T0s4dumpxx_q_z2toSSSg4nameSi6indentSi8maxDepthSi0E5Itemsts16TextOutputStreamR_r0_lF;
var LONG_MAX = ptr(0).not().shr(1);
var returnAlloc = Memory.alloc(4 * Process.pointerSize);
var params = [
copy,
stringResult,
ptr(0), ptr(0), ptr(0), 1,     ptr(0),
LONG_MAX,
LONG_MAX,
Any,
SwiftString.canonicalType._ptr,
textOutputStreamWitnessTableForString];
if (CC.indirectResultRegister === undefined) {
params.unshift(returnAlloc);
} else {
indirectResults.set(threadId, returnAlloc);
}
dump.apply(null, params);
__swift_destroy_boxed_opaque_existential_0(returnAlloc);
var encoding = Memory.readPointer(Swift._api._T0SS10FoundationE8EncodingV4utf8ACfau());
var witnessTableStringProtocol = Swift._api._T0SSs14StringProtocolsWP;
var listener = void 0;
var threadId = Process.getCurrentThreadId();
var toCString = new NativeFunction(toCStringPtr, 'pointer', ['pointer', 'pointer', 'pointer']);
selfPointers.set(threadId, stringResult);
var array = toCString(encoding, SwiftString.canonicalType._ptr, witnessTableStringProtocol);
var str = Memory.readUtf8String(array.add(8 + 3 * Process.pointerSize));
Swift._api.swift_unknownRelease(Memory.readPointer(stringResult.add(2 * Process.pointerSize)));
Swift._api.swift_bridgeObjectRelease(array);
return str;
}
function isClassType(t) {
return t.kind === "Class" || t.kind === "Existential" && t.canonicalType.getRepresentation() === "Class";
}
function makeFunctionWrapper(type, pointer) {
if (type.kind !== "Function") throw new TypeError("this value has a non-function type, so it cannot be called");
return function () {
var flags = type.functionFlags;
for (var _len = arguments.length, argList = Array(_len), _key = 0; _key < _len; _key++) {
argList[_key] = arguments[_key];
}
if (argList.length < flags.numArguments) {
throw new TypeError("missing arguments: " + flags.numArguments + " arguments required");
} else if (argList.length > flags.numArguments) {
throw new TypeError("too many arguments: " + flags.numArguments + " arguments required");
}
if (flags.doesThrow) {
throw new Error("calling a function that can throw is not yet supported");         }
switch (flags.convention) {
case metadata.FunctionMetadataConvention.Swift:
{
if (params.length !== method.args.length) throw new Error("wrong number of parameters");
var converted = [];
for (var i = 0; i < params.length; i++) {
var _type = method.args[i].type;
var vwt = _type.canonicalType.valueWitnessTable;
if (vwt.size === 0) continue;
if (method.args[i].inout || vwt.flags.IsNonBitwiseTakable || vwt.size > CC.maxInlineArgument) {
var val = Memory.alloc(Process.pointerSize);
val.writePointer(method.args[i].$pointer);
converted.push({ val: val, size: Process.pointerSize, stride: Process.pointerSize });
} else {
var _val = Memory.alloc(vwt.size);
if ("$pointer" in params[i] || !('fromJS' in _type) || !_type.fromJS(_val, params[i])) vwt.initializeWithCopy(_val, params[i].$pointer, _type.canonicalType._ptr);
converted.push({ val: _val, size: vwt.size, stide: vwt.stride });
}
}
var self = pointer;
var indirectReturn = false;
var cReturnType = 'void';
if (method.returnType) {
var _vwt = method.returnType.valueWitnessTable;
if (_vwt.size > CC.maxInlineReturn || _vwt.flags.IsNonPOD) {
indirectReturn = true;
var _val2 = Memory.alloc(_vwt.size);
converted.unshift({ val: _val2, size: Process.pointerSize, stride: Process.pointerSize });
} else {
var alignedSize = _vwt.size + _vwt.stride;
var _cReturnType = [];
var maxVoluntaryInt = Process.pointerSize;
var _arr = [8, 4, 2, 1];
for (var _i = 0; _i < _arr.length; _i++) {
var size = _arr[_i];
while (size <= maxVoluntaryInt && alignedSize > 0 && alignedSize % size === 0) {
_cReturnType.push('uint' + (size * 8).toString());
alignedSize -= size;
}
}
}
}
var indirectResultPointer = undefined;
if (indirectReturn && CC.indirectResultRegister) indirectResultPointer = converted.shift()[0];
cParams = convertToCParams(params);
var trampoline = makeCallTrampoline(method.address, method.doesThrow, self, indirectResultPointer);
var trampolineFn = new NativeFunction(trampoline.callAddr, cReturnType, cArgTypes);
trampolineFn.apply(undefined, cParams);
var err = void 0;
if (method.doesThrow) {
err = checkTrampolineError();
if (err !== undefined) {
throw new Error("handling errors not yet implemented");
return err;
}
}
var retVal = undefined;
if (method.returnType) {
var _vwt2 = method.returnType.valueWitnessTable;
var loc = void 0;
if (indirectReturn) {
loc = converted[0][0];
} else {
loc = Memory.alloc(_vwt2.size);
for (var _i2 = 0; _i2 < _vwt2.size; _i2 += Process.pointerSize) {
Memory.writePointer(loc.add(_i2), registerState[CC.returnRegisters[_i2]]);
}
}
if ('toJS' in method.returnType) retVal = field.type.toJS(loc);
if (retVal === undefined) retVal = makeWrapper(method.returnType, loc, true);else _vwt2.destroy(loc, method.returnType.canonicalType._ptr);
}
return retVal;
}
case metadata.FunctionMetadataConvention.Block:
{
var block = new ObjC.Block(pointer);
return block.implementation.apply(block, params);
}
case metadata.FunctionMetadataConvention.Thin:
throw new Error("calling thin functions not yet supported");
case metadata.FunctionMetadataConvention.CFunctionPointer:
{
var convertType = function convertType(swiftType, swiftOrJSVal) {
var fridaType = void 0,
jsVal = void 0;
jsVal = "toJS" in argType ? argType.toJS(swiftOrJSVal.$pointer) : swiftOrJSVal;
switch (argType.toString()) {
case "Builtin.Int8":
case "Swift.Int8":
fridaType = "int8";
break;
case "Builtin.UInt8":
case "Swift.UInt8":
fridaType = "uint8";
break;
case "Builtin.Int16":
case "Swift.Int16":
fridaType = "int16";
break;
case "Builtin.UInt16":
case "Swift.UInt16":
fridaType = "uint16";
break;
case "Builtin.Int32":
case "Swift.Int32":
fridaType = "int32";
break;
case "Builtin.UInt32":
case "Swift.UInt32":
fridaType = "uint32";
break;
case "Builtin.Int64":
case "Swift.Int64":
fridaType = "int64";
break;
case "Builtin.UInt64":
case "Swift.UInt64":
fridaType = "uint64";
break;
case "Swift.Double":
fridaType = "double";
break;
case "Swift.Float":
fridaType = "float";
break;
case "()":
fridaType = "void";
jsVal = undefined;
break;
default:
if (argType.nominalType && argType.nominalType.mangledName === "_T0SP") {
fridaType = "pointer";
if (swiftOrJsVal instanceof NativePointer) jsVal = swiftOrJsVal;else if (jsVal !== undefined) jsVal = Memory.readPointer(swiftOrJsVal.$pointer);
} else {
throw new Error("don't know how to convert a '" + argType.toString() + "' to a C value!");
}
}
return { fridaType: fridaType, jsVal: jsVal };
};
var _params = [];
var fridaTypes = [];
var argTypes = type.getArguments();
for (var _i3 = 0; _i3 < flags.numArguments; _i3++) {
var res = convertType(argTypes[_i3], argList[_i3]);
if (res.jsVal === undefined && res.fridaType !== "void") {
throw new Error("argument " + _i3 + " must not be undefined");
}
fridaTypes.push(res.fridaType);
_params.push(res.jsVal);
}
var returnType = convertType(type.returnType, undefined);
var func = new NativeFunction(Memory.readPointer(pointer), returnType, fridaTypes);
return func.apply(undefined, _params);
}
}
};
}
function escapeName(name, obj) {
if (name.startsWith("$")) name = "$" + name;
while (name in obj) {
if (!name.startsWith("$")) name = "$" + name;
name = "$" + name;
}
return obj;
}
function makeWrapper(type, pointer, owned) {
if (!pointer || pointer.isNull()) {
throw new Error("value can't be located at NULL");
}
var staticType = type;
if ("$kind" in type) {
return ObjC.Object(Memory.readPointer(pointer));
}
var wrapperObject = {};
if (type.kind === "Function") {
wrapperObject = makeFunctionWrapper(type, pointer);
} else if (isClassType(type)) {
var object = Memory.readPointer(pointer);
var canonical = ObjC.api.object_getClass(object);
type = Swift._typeFromCanonical(canonical);
}
wrapperObject.$staticType = staticType;
wrapperObject.$type = type;
wrapperObject.$pointer = pointer;
wrapperObject.toString = swiftToString.bind(undefined, wrapperObject);
if (isClassType(type)) {
(0, _defineProperties2.default)(wrapperObject, {
'$isa': {
enumerable: true,
get: function get() {
var object = Memory.readPointer(pointer);
return Memory.readPointer(object.add(0));
}
},
'$retainCounts': {
enumerable: true,
get: function get() {
var object = Memory.readPointer(pointer);
return Swift._api.CFGetRetainCount(object);
}
}
});
}
if ('enumCases' in type) {
var enumCases = type.enumCases();
if (enumCases.length === 1) {
wrapperObject.$enumCase = 0;
} else if (enumCases.length !== 0) {
var numPayloads = type.nominalType.enum_.getNumPayloadCases();
Object.defineProperty(wrapperObject, '$enumCase', {
enumerable: true,
get: function get() {
var tag = void 0;
if (numPayloads === 0) {
if (enumCases.length < 1 << 8) tag = Memory.readU8(pointer);else if (enumCases.length < 1 << 16) tag = Memory.readU16(pointer);else if (enumCases.length < 1 << 32) tag = Memory.readU32(pointer);else if (enumCases.length < 1 << 64) tag = Memory.readU64(pointer);else throw new Error("impossibly large number of enum cases");
} else if (numPayloads === 1) {
var opaqueVal = pointer;
var payloadType = enumCases[0].type.canonicalType._ptr;
tag = Swift._api.swift_getEnumCaseSinglePayload(opaqueVal, payloadType, enumCases.length - numPayloads);
} else {
var _opaqueVal = pointer;
tag = Swift._api.swift_getEnumCaseMultiPayload(_opaqueVal, type.nominalType._ptr);
}
return tag + numPayloads;
}
});
if (numPayloads > 0) {
Object.defineProperty(wrapperObject, '$enumPayloadCopy', {
enumerable: true,
value: function value() {
var curCase = enumCases[this.$enumCase];
if (curCase.type === null) return undefined;
var enumVwt = type.canonicalType.valueWitnessTable;
var payloadVwt = curCase.type.canonicalType.valueWitnessTable;
enumVwt.destructiveProjectEnumData(pointer, type.canonicalType._ptr);
var payload = Memory.alloc(payloadVwt.size.toInt32());
var address = curCase.indirect ? Swift._api.swift_projectBox(pointer) : pointer;
payloadVwt.initializeWithCopy(payload, pointer, curCase.type.canonicalType._ptr);
enumVwt.destructiveInjectEnumTag(pointer, curCase.tag, type.canonicalType._ptr);
return makeWrapper(curCase.type, payload, true);
}
});
}
}
}
if ("fields" in type) {
var _loop = function _loop() {
if (_isArray) {
if (_i4 >= _iterator.length) return 'break';
_ref = _iterator[_i4++];
} else {
_i4 = _iterator.next();
if (_i4.done) return 'break';
_ref = _i4.value;
}
var field = _ref;
var getAddr = function getAddr() {
var addr = void 0;
if (type.kind === "Struct") {
addr = pointer.add(field.offset);
} else {
var _object = Memory.readPointer(pointer);
addr = _object.add(field.offset);
}
return addr;
};
var fieldName = escapeName(field.name, wrapperObject);
(0, _defineProperty4.default)(wrapperObject, fieldName, {
enumerable: true,
get: function get() {
var addr = getAddr();
var pointer = addr;
if (field.weak) {
var strong = Swift._api.swift_weakLoadStrong(addr);
if (strong.isNull()) return null;
Swift._api.swift_release(strong);
pointer = strong;
}
if ("toJS" in field.type) {
var val = field.type.toJS(pointer);
if (val !== undefined) return val;
}
return new field.type(pointer);
},
set: function set(newVal) {
var addr = getAddr();
if (field.weak) {
Swift._api.swift_weakAssign(addr, newVal.$pointer);
} else {
var assigned = false;
if ("fromJS" in field.type && !("$pointer" in newVal)) assigned = field.type.fromJS(pointer, newVal);
if (!assigned) {
type.valueWitnessTable.assignWithCopy(addr, newVal.$pointer, newVal.$type.canonicalType._ptr);
}
}
}
});
};
for (var _iterator = type.fields(), _isArray = Array.isArray(_iterator), _i4 = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
var _ref;
var _ret = _loop();
if (_ret === 'break') break;
}
}
if (type.kind === "Existential" && type.canonicalType.getRepresentation() === "Opaque") {
Object.defineProperty(wrapperObject, '$value', {
enumerable: true,
get: function get() {
var cont = new metadata.OpaqueExistentialContainer(pointer);
var dynType = Swift._typeFromCanonical(cont.type._ptr);
if (isClassType(dynType) || !dynType.canonicalType.valueWitnessTable.isValueInline) {
return makeWrapper(dynType, pointer, false);
} else {
return makeWrapper(dynType, cont.heapObject, false);
}
},
set: function set(newVal) {
var witnesses = [];
var protocols = staticType.canonicalType.protocols.protocols;
for (var i = 0; i < protocols.length; i++) {
var proto = protocols[i];
var conformance = Swift._api.swift_conformsToProtocol(newVal.$type.canonicalType._ptr, proto._ptr);
if (conformance.isNull()) throw new Error('this value does not implement the required protocol \'' + proto.name + '\'');
witnesses.push(conformance);
}
var cont = new metadata.OpaqueExistentialContainer(pointer);
var oldVwt = cont.type.canonicalType.valueWitnessTable;
if (isClassType(cont.type)) Swift._api.swift_release(cont.heapObject);else if (oldVwt.isValueInline) oldVwt.destroy(pointer);else oldVwt.destroy(cont.heapObject);
var newVwt = newVal.$type.canonicalType.valueWitnessTable;
newVwt.initializeBufferWithCopy(pointer, newVal.$pointer, newVal.$type.canonicalType._ptr);
cont.type = newVal.$type;
for (var _i5 = 0; _i5 < witnesses.length; _i5++) {
cont.setWitnessTable(_i5, witnesses[_i5]);
}
}
});
}
if ("tupleElements" in type) {
var cnt = 0;
var _loop2 = function _loop2() {
if (_isArray2) {
if (_i6 >= _iterator2.length) return 'break';
_ref2 = _iterator2[_i6++];
} else {
_i6 = _iterator2.next();
if (_i6.done) return 'break';
_ref2 = _i6.value;
}
var elem = _ref2;
(0, _defineProperty4.default)(wrapperObject, cnt.toString(), {
enumerable: true,
get: function get() {
return elem.type(pointer.add(elem.offset));
},
set: function set(val) {
wrapperObject[curCnt].$assignWithCopy(val);
}
});
cnt++;
};
for (var _iterator2 = type.tupleElements(), _isArray2 = Array.isArray(_iterator2), _i6 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
var _ref2;
var _ret2 = _loop2();
if (_ret2 === 'break') break;
}
cnt = 0;
var _loop3 = function _loop3() {
if (_isArray3) {
if (_i7 >= _iterator3.length) return 'break';
_ref3 = _iterator3[_i7++];
} else {
_i7 = _iterator3.next();
if (_i7.done) return 'break';
_ref3 = _i7.value;
}
var elem = _ref3;
var curCnt = cnt;
if (elem.label !== null) {
(0, _defineProperty4.default)(wrapperObject, escapeName(elem.label, wrapperObject), {
enumerable: true,
get: function get() {
return wrapperObject[curCnt];
},
set: function set(val) {
wrapperObject[curCnt] = val;
}
});
}
cnt++;
};
for (var _iterator3 = type.tupleElements(), _isArray3 = Array.isArray(_iterator3), _i7 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
var _ref3;
var _ret3 = _loop3();
if (_ret3 === 'break') break;
}
}
/*if ('_methods' in type) {
for (let [name, method] of type._methods.entries()) {
Object.defineProperty(wrapperObject, name, {
enumerable: true,
value(...params) {
return makeFunctionWrapper(method.type, method.address)(...params);
},
});
}
}*/
var invalidateWrapper = function invalidateWrapper() {
(0, _keys2.default)(wrapperObject).forEach(function (key) {
return (0, _deleteProperty2.default)(wrapperObject, key);
});
pointer = undefined;
type = undefined;
};
if (owned) {
wrapperObject.$destroy = function () {
type.canonicalType.valueWitnessTable._destroy(pointer, type.canonicalType._ptr);
invalidateWrapper();
};
var destruct = function destruct() {
try {
if (pointer !== undefined) wrapperObject.$destroy();
} catch (e) {
console.log('unhandled error while cleaning up owned Swift value: ' + e);
}
};
var oldFin = Duktape.fin(pointer);
Duktape.fin(pointer, function (obj, heapDestruction) {
if (!heapDestruction) destruct();
oldFin(obj, heapDestruction);
});
}
wrapperObject.$assignWithCopy = function (val) {
if ("$kind" in val) {
throw new Error("ObjC types not yet supported");         } else if ("fromJS" in type && !("$pointer" in val)) {
type.fromJS(pointer, val);
return this;
} else {
staticType.canonicalType.valueWitnessTable.assignWithCopy(pointer, val.$pointer, staticType.canonicalType._ptr);
var newWrapper = makeWrapper(val.$type, pointer, owned);
invalidateWrapper();
return newWrapper;
}
};
wrapperObject.$allocCopy = function () {
var vwt = type.canonicalType.valueWitnessTable;
var mem = Memory.alloc(vwt.size.toInt32());
vwt.initializeWithCopy(mem, pointer, type.canonicalType._ptr);
return makeWrapper(type, mem, true);
};
(0, _preventExtensions2.default)(wrapperObject);
return wrapperObject;
}
function makeSwiftValue(type) {
if (!type.canonicalType) {
throw new Error("the type of a value must have a canonical type descriptor!");
}
var _SwiftValue = void 0;
_SwiftValue = function SwiftValue(pointer) {
return makeWrapper(_SwiftValue, pointer, false);
};
(0, _defineProperty2.default)(_SwiftValue, 'name', { value: type.toString() });
return _SwiftValue;
}
module.exports = {
makeSwiftValue: makeSwiftValue
};
},{"./calling-convention":1,"./metadata":6,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/define-properties":13,"babel-runtime/core-js/object/define-property":14,"babel-runtime/core-js/object/keys":17,"babel-runtime/core-js/object/prevent-extensions":18,"babel-runtime/core-js/reflect/define-property":19,"babel-runtime/core-js/reflect/delete-property":20}],152:[function(require,module,exports){
'use strict';
var _setPrototypeOf = require('babel-runtime/core-js/reflect/set-prototype-of');
var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);
var _getOwnPropertyDescriptors = require('babel-runtime/core-js/object/get-own-property-descriptors');
var _getOwnPropertyDescriptors2 = _interopRequireDefault(_getOwnPropertyDescriptors);
var _defineProperties = require('babel-runtime/core-js/object/define-properties');
var _defineProperties2 = _interopRequireDefault(_defineProperties);
var _getIterator2 = require('babel-runtime/core-js/get-iterator');
var _getIterator3 = _interopRequireDefault(_getIterator2);
var _map = require('babel-runtime/core-js/map');
var _map2 = _interopRequireDefault(_map);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var metadata = require('./metadata');
var swiftValue = require('./swift-value');
var mangling = require('./mangling');
function strlen(pointer) {
var i = void 0;
for (i = 0; Memory.readU8(pointer.add(i)) !== 0; i++) {}
return i;
}
var _leakedMemory = []; 
var typesByCanonical = new _map2.default();
var protocolTypes = new _map2.default();
function getOrMakeProtocolType(proto) {
var existing = protocolTypes.get(proto._ptr.toString());
if (existing) {
return existing;
}
var arr = Memory.alloc(Process.pointerSize);
Memory.writePointer(arr, proto._ptr);
var canonical = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any,
ptr(0), 1, arr);
canonical = new metadata.TargetMetadata(canonical);
if (canonical.protocols.arrayLocation.toString() === arr.toString()) {
_leakedMemory.push(arr);
}
var name = Swift.isSwiftName(proto.name) ? Swift.demangle(proto.name) : proto.name;
var type = new Type(null, canonical, name);
protocolTypes.set(proto._ptr.toString(), type);
return type;
}
function Type(nominalType, canonicalType, name, accessFunction) {
var _this = this;
if (canonicalType && typesByCanonical.has(canonicalType._ptr.toString())) {
var unique = typesByCanonical.get(canonicalType._ptr.toString());
if (name && !unique.fixedName) unique.fixedName = name;
return unique;
}
if (accessFunction) {
if (nominalType || canonicalType || !name) throw new Error("type access function must only be provided if the type is not known");
this.fixedName = name;
this.accessFunction = accessFunction;
}
this.nominalType = nominalType;
if (!nominalType && canonicalType) {
this.nominalType = canonicalType.getNominalTypeDescriptor();
if (canonicalType.kind === "Class") {
var clsType = canonicalType;
while (this.nominalType === null && clsType.isTypeMetadata() && clsType.isArtificialSubclass() && clsType.superClass !== null) {
clsType = clsType.superClass;
this.nominalType = clsType.getNominalTypeDescriptor();
}
}
}
if (canonicalType && (canonicalType.kind === "Class" && canonicalType.isTypeMetadata() && !canonicalType.flags.UsesSwift1Refcounting || canonicalType.kind === "ObjCClassWrapper")) {
this.toJS = function (pointer) {
return ObjC.Object(Memory.readPointer(pointer));
};
this.fromJS = function (address, value) {
Swift._api.objc_storeStrong(address, value);return true;
};
this.getSize = function getSize() {
return Process.pointerSize;
};
}
this.canonicalType = canonicalType;
this.kind = canonicalType ? canonicalType.kind : accessFunction ? "Unknown" : null;
if (this.nominalType && !canonicalType) accessFunction = this.nominalType.accessFunction;
if (accessFunction) {
this.withGenericParams = function withGenericParams() {
for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
params[_key] = arguments[_key];
}
if (this.nominalType && !this.nominalType.genericParams.flags.HasGenericParent && params.length != this.nominalType.genericParams.numGenericRequirements) {
throw new Error("wrong number of generic parameters");
}
var args = [];
var names = [];
for (var _iterator = params, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
var _ref;
if (_isArray) {
if (_i >= _iterator.length) break;
_ref = _iterator[_i++];
} else {
_i = _iterator.next();
if (_i.done) break;
_ref = _i.value;
}
var param = _ref;
if (param.isGeneric() || !param.canonicalType) throw new Error("generic type parameter needs all own type parameters filled!");
args.push('pointer');
names.push(param.toString());
}
var name = this.toString();
if (names.length !== 0) name += "<" + names.join(", ") + ">";
var accessFunc = new NativeFunction(accessFunction, 'pointer', args);
var canonical = accessFunc.apply(null, params.map(function (t) {
return t.canonicalType._ptr;
}));
return new Type(this.nominalType, new metadata.TargetMetadata(canonical), name);
};
}
if (this.nominalType && canonicalType && (this.kind === "Enum" || this.kind === "Optional")) {
this.enumCases = function enumCases() {
var info = this.nominalType.enum_;
var count = info.getNumCases();
var payloadCount = info.getNumPayloadCases();
var cases = [];
var names = info.caseNames;
var caseTypeAccessor = new NativeFunction(info.getCaseTypes, 'pointer', ['pointer']);
var caseTypes = caseTypeAccessor(canonicalType._ptr);
for (var i = 0; i < count; i++) {
var type = null;
var typeFlags = 0;
if (i < payloadCount) {
type = Memory.readPointer(caseTypes.add(i * Process.pointerSize));
typeFlags = type.and(metadata.FieldTypeFlags.typeMask);
type = new metadata.TargetMetadata(type.and(~metadata.FieldTypeFlags.typeMask));
}
cases.push({
tag: i - payloadCount,
name: names === null ? null : Memory.readUtf8String(names),
type: type === null ? null : new Type(null, type, 'case ' + (i - payloadCount) + ' of ' + this),
indirect: (typeFlags & metadata.FieldTypeFlags.Indirect) === metadata.FieldTypeFlags.Indirect,
weak: (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak
});
names = names === null ? null : names.add(strlen(names) + 1);
}
return cases;
};
}
if (["Class", "Struct"].indexOf(this.kind) !== -1 && canonicalType) {
this.fields = function fields() {
var results = [];
var hierarchy = [canonicalType];
while (hierarchy[hierarchy.length - 1].superClass) {
hierarchy.push(hierarchy[hierarchy.length - 1].superClass);
}
var offset = ptr(0);
for (var i = hierarchy.length; i--;) {
var canon = hierarchy[i];
var nomin = ["Class", "Struct"].indexOf(canon.kind) != -1 ? canon.getNominalTypeDescriptor() : null;
if (!nomin) continue;
var info = nomin.getKind() === "Class" ? nomin.clas : nomin.struct;
if (!info.hasFieldOffsetVector()) throw new Error("fields without offset vector not implemented");
var fieldTypeAccessor = new NativeFunction(info.getFieldTypes, 'pointer', ['pointer']);
var fieldTypes = fieldTypeAccessor(canon._ptr);
var fieldName = info.fieldNames;
var fieldOffsets = canon._ptr.add(info.fieldOffsetVectorOffset * Process.pointerSize);
for (var j = 0; j < info.numFields; j++) {
var type = Memory.readPointer(fieldTypes.add(j * Process.pointerSize));
var typeFlags = type.and(metadata.FieldTypeFlags.typeMask);
type = new metadata.TargetMetadata(type.and(ptr(metadata.FieldTypeFlags.typeMask).not()));
var curOffset = Memory.readPointer(fieldOffsets.add(j * Process.pointerSize));
var fieldNameStr = Memory.readUtf8String(fieldName);
var weak = (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak;
var xtype = new Type(null, type, '?Unknown type of ' + this + '.' + fieldNameStr);
results.push({
name: fieldNameStr,
offset: offset.add(curOffset),
type: new Type(null, type, '?Unknown type of ' + this + '.' + fieldNameStr),
weak: (typeFlags & metadata.FieldTypeFlags.Weak) === metadata.FieldTypeFlags.Weak
});
fieldName = fieldName.add(strlen(fieldName) + 1);
}
}
return results;
};
}
if (this.kind === "Existential" && canonicalType) {
this.protocols = function protocols() {
return canonicalType.protocols.map(getOrMakeProtocolType);
};
this.combineWith = function combineWith(other) {
if (other.kind !== "Existential") throw new Error("can only combine existential types with each other");
var protos = canonicalType.protocols.concat(other.canonicalType.protocols);
protos.sort(function (p1, p2) {
if (p1.name < p2.name) return -1;
if (p1.name > p2.name) return 1;
return p1._ptr.compare(p2._ptr);
});
for (var i = 1; i < protos.length; i++) {
if (protos[i - 1]._ptr.toString() === protos[i]._ptr.toString()) {
protos.splice(i, 1);
i--;
}
}
var arr = Memory.alloc(protos.length * Process.pointerSize);
_leakedMemory.push(arr);
var names = [];
for (var _i2 = 0; _i2 < protos.length; _i2++) {
Memory.writePointer(arr.add(_i2 * Process.pointerSize), protos[_i2]._ptr);
names.push(protos[_i2].name);
}
var bound = canonicalType.isClassBounded() || other.canonicalType.isClassBounded() ? "Class" : "Any";
bound = metadata.ProtocolClassConstraint[bound];
var superClass = canonicalType.getSuperclassConstraint();
superClass = superClass === null ? ptr(0) : superClass._ptr;
var canon = Swift._api.swift_getExistentialTypeMetadata(bound, superClass, protos.length, arr);
return new Type(null, new metadata.TargetMetadata(canon), names.join(" + "));
};
if (canonicalType.isClassBounded()) {
this.isClassBounded = true;
this.getSuperclassConstraint = function getSuperclassConstraint() {
var superClass = canonicalType.getSuperclassConstraint();
if (superClass) return new Type(null, superClass);
return null;
};
this.withoutClassBound = function withoutClassBound() {
var protocols = canonicalType.protocols;
var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any, ptr(0), protocols.length, protocols.arrayLocation);
return new Type(null, new metadata.TargetMetadata(canon));
};
} else {
this.isClassBounded = false;
this.withClassBound = function withClassBound() {
var protocols = canonicalType.protocols;
var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, ptr(0), protocols.length, protocols.arrayLocation);
return new Type(null, new metadata.TargetMetadata(canon));
};
}
if (canonicalType.isObjC()) {
this.isObjC = true;
} else {
this.isObjC = false;
if (canonicalType.getSuperclassConstraint()) {
this.withoutSuperclassConstraint = function withoutSuperclassConstraint() {
var protocols = canonicalType.protocols;
var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, ptr(0), protocols.length, protocols.arrayLocation);
return new Type(null, new metadata.TargetMetadata(canon));
};
} else {
this.withSuperclassConstraint = function withSuperclassConstraint(superType) {
var protocols = canonicalType.protocols;
var canon = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, superType.canonicalType._ptr, protocols.length, protocols.arrayLocation);
return new Type(null, new metadata.TargetMetadata(canon));
};
}
}
}
if (this.kind === "Tuple") {
this.tupleElements = function tupleElements() {
var labels = canonicalType.labels;
if (labels.isNull()) labels = null;else labels = Memory.readUtf8String(labels).split(" ");
var infos = [];
var elements = canonicalType.elements;
for (var i = 0; i < canonicalType.numElements; i++) {
infos.push({
label: labels && labels[i] ? labels[i] : null,
type: new Type(null, elements[i].type),
offset: elements[i].offset
});
}
return infos;
};
}
if (this.kind === "Function") {
this.returnType = function returnType() {
return new Type(null, canonicalType.resultType);
};
this.functionFlags = function functionFlags() {
return canonicalType.flags;
};
this.getArguments = function getArguments() {
return canonicalType.getArguments().map(function (arg) {
return {
inout: arg.inout,
type: new Type(null, arg.type)
};
});
};
}
if (this.kind == "Opaque") {
if (!name) throw new Error("a name is required when creating Opaque types");
this.fixedName = name;
this.getCType = function getCType() {
var knownTypes = {
"Builtin.Int8": "int8",
"Builtin.Int16": "int16",
"Builtin.Int32": "int32",
"Builtin.Int64": "int64",
"Builtin.UInt8": "uint8",
"Builtin.UInt16": "uint16",
"Builtin.UInt32": "uint32",
"Builtin.UInt64": "uint64",
"Builtin.RawPointer": "pointer"
};
return knownTypes[this.fixedName];
};
this.getSize = function getSize() {
var knownSizes = {
"Builtin.Int8": 1,
"Builtin.Int16": 2,
"Builtin.Int32": 4,
"Builtin.Int64": 8,
"Builtin.Int128": 16,
"Builtin.Int256": 32,
"Builtin.Int512": 64,
"Builtin.UInt8": 1,
"Builtin.UInt16": 2,
"Builtin.UInt32": 4,
"Builtin.UInt64": 8,
"Builtin.UInt128": 16,
"Builtin.UInt256": 32,
"Builtin.UInt512": 64,
"Builtin.RawPointer": Process.pointerSize
};
return knownSizes[this.fixedName];
};
this.toJS = function toJS(pointer) {
if (this.fixedName === "Builtin.RawPointer") {
return Memory.readPointer(pointer);
}
var size = this.getSize();
if (size === undefined || size > 8) return undefined;
if (this.fixedName.indexOf("Builtin.Int") === 0) {
return Memory['readS' + size * 8](pointer);
} else if (this.fixedName.indexOf("Builtin.UInt") === 0) {
return Memory['readU' + size * 8](pointer);
}
return undefined;
};
this.fromJS = function fromJS(address, value) {
if (this.fixedName === "Builtin.RawPointer") {
Memory.writePointer(address, value);
return true;
}
var size = this.getSize();
if (size === undefined || size > 8) return false;
if (this.fixedName.indexOf("Builtin.Int") === 0) {
Memory['writeS' + size * 8](address, value);
return true;
} else if (this.fixedName.indexOf("Builtin.UInt") === 0) {
Memory['writeU' + size * 8](address, value);
return true;
}
return false;
};
}
if (canonicalType && this.kind === "Class") {
this.superClass = function superClass() {
var canon = canonicalType.superClass;
if (canon === null) return null;
return new Type(null, canon, '?superClass of ' + this);
};
}
if (canonicalType && (this.kind !== "Class" || canonicalType.isTypeMetadata())) {
var size = Process.pointerSize;         if (canonicalType.valueWitnessTable.flags.IsNonInline) size = canonicalType.valueWitnessTable.size;
this.getSize = function () {
return size;
};
if ("getGenericArgs" in canonicalType) {
this.getGenericParams = function getGenericParams() {
return canonicalType.getGenericArgs().map(function (t) {
if (t === null) return null;else {
return new Type(null, t);
}
});
};
}
}
if (this.kind === "ObjCClassWrapper") {
this.getObjCObject = function getObjCObject() {
return ObjC.Object(canonicalType.class_);
};
}
if (["ExistentialMetatype", "Metatype"].indexOf(this.kind) !== -1) {
this.instanceType = function instanceType() {
return new Type(null, canonicalType.instanceType);
};
}
/*if (canonicalType && ["Class", "Struct", "Enum"].indexOf(this.kind) !== -1) {
this.defineMethod = function defineMethod(address, name, type) {
if (type.kind !== "Function")
throw new Error("invalid type to act as method signature");
this._methods.set(name, {'address': address, 'returnType': type.returnType(), 'args': type.getArguments(),
'doesThrow': type.flags.doesThrow});
};
this._methods = new Map();
}*/
if (canonicalType) {
switch (this.toString()) {
case "Swift.String":
this.fromJS = function (address, value) {
canonicalType.valueWitnessTable.destroy(address, canonicalType._ptr);
var cStr = Memory.allocUtf8String(value);
api.swift_stringFromUTF8InRawMemory(address, cStr, value.length);
return true;
};
case "Swift.Bool":
this.toJS = function (address) {
return Memory.readU8(address) !== 0;
};
this.fromJS = function (address, value) {
Memory.writeU8(address, value ? 1 : 0);return true;
};
this.getSize = function getSize() {
return 1;
};
break;
case "Swift.UInt":
this.toJS = function (pointer) {
return Memory.readULong(pointer);
};
this.fromJS = function (pointer, value) {
Memory.writeULong(pointer, value);return true;
};
this.getSize = function () {
return Process.pointerSize;
};
break;
case "Swift.Int":
this.toJS = function (pointer) {
return Memory.readLong(pointer);
};
this.fromJS = function (pointer, value) {
Memory.writeLong(pointer, value);return true;
};
this.getSize = function () {
return Process.pointerSize;
};
break;
case "Swift.Int8":
case "Swift.Int16":
case "Swift.Int32":
case "Swift.Int64":
case "Swift.Int128":
case "Swift.Int256":
case "Swift.Int512":
case "Swift.UInt8":
case "Swift.UInt16":
case "Swift.UInt32":
case "Swift.UInt64":
case "Swift.UInt128":
case "Swift.UInt256":
case "Swift.UInt512":
case "Swift.RawPointer":
this.toJS = function (pointer) {
return _this.fields()[0].type.toJS(pointer);
};
this.fromJS = function (pointer, value) {
return _this.fields()[0].type.fromJS(pointer, value);
};
this.getSize = function () {
return _this.fields()[0].type.getSize();
};
break;
}
Object.defineProperty(this, 'Type', {
enumerable: true,
get: function get() {
var meta = void 0;
if (this.kind === "Existential" || this.kind === "ExistentialMetatype") {
meta = Swift._api.swift_getExistentialMetatypeMetadata(canonicalType._ptr);
} else {
meta = Swift._api.swift_getMetatypeMetadata(canonicalType._ptr);
}
return new Type(null, new metadata.TargetMetadata(meta), this.toString() + ".Type");
}
});
}
if (!this.isGeneric()) {
if (!canonicalType) {
return this.withGenericParams();
} else {
var func = swiftValue.makeSwiftValue(this);
(0, _defineProperties2.default)(func, (0, _getOwnPropertyDescriptors2.default)(this));
(0, _setPrototypeOf2.default)(func, Type.prototype);
typesByCanonical.set(this.canonicalType._ptr.toString(), func);
return func;
}
}
}
Type.prototype = {
constructor: Type,
isGeneric: function isGeneric() {
if (this.accessFunction) return true;
if (!this.nominalType || this.canonicalType) return false;
return this.nominalType.genericParams.isGeneric();
},
toString: function toString() {
if ("_name" in this) return this._name;
if (this.canonicalType) {
var _Swift$_api$swift_get = Swift._api.swift_getTypeName(this.canonicalType._ptr, 1),
pointer = _Swift$_api$swift_get[0],
len = _Swift$_api$swift_get[1];
var str = Memory.readUtf8String(pointer, len.toInt32());
if (str.length !== 0 && str !== "<<< invalid type >>>") {
this._name = str;
return str;
}
switch (this.kind) {
case "Tuple":
this._name = "(" + this.tupleElements().map(function (e) {
return (e.label === null ? "" : e.label + ": ") + e.type.toString();
}).join(", ") + ")";
return this._name;
case "Function":
this._name = "@convention(" + metadata.FunctionConventionStrings[this.functionFlags().convention] + ") (" + this.getArguments().map(function (a) {
return (a.inout ? "inout " : "") + a.type.toString();
}).join(", ") + ") -> " + this.returnType().toString();
return this._name;
case "ObjCClassWrapper":
this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType.class_));
return this._name;
case "ExistentialMetatype":
case "Metatype":
this._name = this.instanceType().toString() + ".Type";
return this._name;
case "ForeignClass":
this._name = Swift.demangle(mangling.MANGLING_PREFIX + "0" + this.canonicalType.name);
return this._name;
case "Class":
if (this.canonicalType.isPureObjC()) {
this._name = Memory.readUtf8String(ObjC.api.class_getName(this.canonicalType._ptr));
return this._name;
}
break;
case "Existential":
{
var protocols = this.canonicalType.protocols.map(function (p) {
return Swift.isSwiftName(p.name) ? Swift.demangle(p.name) : p.name;
});
var _str = protocols.join(" & ");
if (this.canonicalType.getSuperclassConstraint()) _str += " : " + new Type(null, this.canonicalType.getSuperclassConstraint()).toString();
this._name = _str;
return _str;
}
}
}
if (this.nominalType) {
var name = Swift.demangle(this.nominalType.mangledName);
if (this.nominalType.genericParams.isGeneric()) {
var params = [];
if ("getGenericParams" in this) {
params = this.getGenericParams().map(function (arg) {
return arg.toString();
});
} else {
if (this.nominalType.genericParams.flags.HasGenericParent) {
params.push("[inherited generic parameters]");
}
var cnt = this.nominalType.genericParams.numPrimaryParams;
for (var i = 0; i < cnt; i++) {
params.push("_T" + i);
}
}
name += "<" + params.join(", ") + ">";
}
this._name = name;
return name;
}
if (this.fixedName) {
this._name = this.fixedName;
return this.fixedName;
}
throw new Error('cannot get string representation for type without nominal or canonical type information');
}
};
function findAllTypes(api) {
var sizeAlloc = Memory.alloc(8);
var __TEXT = Memory.allocUtf8String("__TEXT");
var sectionNames = [Memory.allocUtf8String("__swift2_types"), Memory.allocUtf8String("__swift2_proto")];
var recordSizes = [8, 16];
var typesByName = new _map2.default();
function getTypePrio(t) {
if (t.canonicalType) return 0;
if (t.nominalType) return 1;
if (t.accessFunction) return 2;
throw new Error("invalid state of type object");
}
var newTypes = [];
function addType(t) {
if (t === null) return;
var name = t.toString();
var other = typesByName.get(name);
if (!other || getTypePrio(t) < getTypePrio(other)) {
typesByName.set(name, t);
newTypes.push(t);
}
}
for (var _iterator2 = Process.enumerateModulesSync(), _isArray2 = Array.isArray(_iterator2), _i3 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
var _ref2;
if (_isArray2) {
if (_i3 >= _iterator2.length) break;
_ref2 = _iterator2[_i3++];
} else {
_i3 = _iterator2.next();
if (_i3.done) break;
_ref2 = _i3.value;
}
var mod = _ref2;
for (var section = 0; section < sectionNames.length; section++) {
var pointer = api.getsectiondata(mod.base, __TEXT, sectionNames[section], sizeAlloc);
if (pointer.isNull()) continue;
var sectionSize = Memory.readULong(sizeAlloc);
for (var i = 0; i < sectionSize; i += recordSizes[section]) {
var record = void 0;
var _proto = null;
if (section === 0) {
record = new metadata.TargetTypeMetadataRecord(pointer.add(i));
} else {
record = new metadata.TargetProtocolConformanceRecord(pointer.add(i));
_proto = getOrMakeProtocolType(record.protocol);
addType(_proto);
}
var nominalType = null;
if (record.getTypeKind() === metadata.TypeMetadataRecordKind.UniqueNominalTypeDescriptor) nominalType = record.getNominalTypeDescriptor();
var canonicalType = record.getCanonicalTypeMetadata(api);
if (nominalType || canonicalType) {
addType(new Type(nominalType, canonicalType));
} else {
console.log('metadata record without nominal or canonical type?! @' + pointer.add(i) + ' of section ' + section + ' in ' + mod.name + ' ' + record.getTypeKind() + ' ' + _proto);
}
}
}
var METADATA_PREFIX = "type metadata for ";
var METADATA_ACCESSOR_PREFIX = "type metadata accessor for ";
var NOMINAL_PREFIX = "nominal type descriptor for ";
for (var _iterator5 = Module.enumerateExportsSync(mod.name), _isArray5 = Array.isArray(_iterator5), _i6 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);;) {
var _ref5;
if (_isArray5) {
if (_i6 >= _iterator5.length) break;
_ref5 = _iterator5[_i6++];
} else {
_i6 = _iterator5.next();
if (_i6.done) break;
_ref5 = _i6.value;
}
var exp = _ref5;
if (Swift.isSwiftName(exp.name)) {
var demangled = Swift.demangle(exp.name);
if (demangled.startsWith(METADATA_PREFIX)) {
var name = demangled.substr(METADATA_PREFIX.length);
for (var _i7 = 0; _i7 < 2; _i7++) {
var _ptr = exp.address.add(Process.pointerSize * _i7);
if (Memory.readPointer(_ptr).toString(10) in metadata.MetadataKind) {
addType(new Type(null, new metadata.TargetMetadata(_ptr), name));
break;
}
}
} else if (demangled.startsWith(NOMINAL_PREFIX)) {
var _name = demangled.substr(NOMINAL_PREFIX.length);
addType(new Type(new metadata.TargetNominalTypeDescriptor(exp.address), null, _name));
} else if (demangled.startsWith(METADATA_ACCESSOR_PREFIX)) {
var _name2 = demangled.substr(METADATA_ACCESSOR_PREFIX.length);
addType(new Type(null, null, _name2, exp.address));
}
}
}
}
if (!typesByName.has("Any")) {
var Any = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Any, ptr(0), 0, ptr(0));
Any = new Type(null, new metadata.TargetMetadata(Any), "Any");
typesByName.set("Any", Any);
}
if (!typesByName.has("Swift.AnyObject")) {
var AnyObject = Swift._api.swift_getExistentialTypeMetadata(metadata.ProtocolClassConstraint.Class, ptr(0), 0, ptr(0));
AnyObject = new Type(null, new metadata.TargetMetadata(AnyObject), "Swift.AnyObject");
typesByName.set("Swift.AnyObject", AnyObject);
}
if (!typesByName.has("Swift.AnyObject.Type")) {
var _AnyObject = typesByName.get("Swift.AnyObject");
var AnyClass = _AnyObject.Type;
typesByName.set("Swift.AnyObject.Type", AnyClass);
typesByName.set("Swift.AnyClass", AnyClass);
}
typesByName.set("()", Swift.makeTupleType([], []));
typesByName.set("Void", typesByName.get("()"));
while (newTypes.length) {
var type = newTypes.pop();
if ('enumCases' in type) type.enumCases().forEach(function (i) {
return addType(i.type);
});
if ('fields' in type) type.fields().forEach(function (i) {
return addType(i.type);
});
if ('tupleElements' in type) type.tupleElements().forEach(function (i) {
return addType(i.type);
});
if ('getArguments' in type) type.getArguments().forEach(function (i) {
return addType(i.type);
});
if ('returnType' in type) addType(type.returnType());
if ('superClass' in type) addType(type.superClass());
if ('instanceType' in type) addType(type.instanceType());
if ('getGenericParams' in type) type.getGenericParams().forEach(addType);
if ('getSuperclassConstraint' in type) addType(type.getSuperclassConstraint());
if (type.kind === "Existential" && type.canonicalType) {
for (var _iterator3 = type.canonicalType.protocols, _isArray3 = Array.isArray(_iterator3), _i4 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
var _ref3;
if (_isArray3) {
if (_i4 >= _iterator3.length) break;
_ref3 = _iterator3[_i4++];
} else {
_i4 = _iterator3.next();
if (_i4.done) break;
_ref3 = _i4.value;
}
var proto = _ref3;
addType(getOrMakeProtocolType(proto));
for (var _iterator4 = proto.inheritedProtocols, _isArray4 = Array.isArray(_iterator4), _i5 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
var _ref4;
if (_isArray4) {
if (_i5 >= _iterator4.length) break;
_ref4 = _iterator4[_i5++];
} else {
_i5 = _iterator4.next();
if (_i5.done) break;
_ref4 = _i5.value;
}
var inherited = _ref4;
addType(getOrMakeProtocolType(inherited));
}
}
}
}
return typesByName;
}
module.exports = {
findAllTypes: findAllTypes,
Type: Type
};
},{"./mangling":5,"./metadata":6,"./swift-value":151,"babel-runtime/core-js/get-iterator":8,"babel-runtime/core-js/map":10,"babel-runtime/core-js/object/define-properties":13,"babel-runtime/core-js/object/get-own-property-descriptors":16,"babel-runtime/core-js/reflect/set-prototype-of":21}]},{},[2])
""")
def recv(message, data):
if message['type'] == 'error':
session.detach()
print(message['description'], file=sys.stderr)
print(message['stack'], file=sys.stderr)
sys.exit(1)
def top_sort(dag):
empty = set()
no_incoming = set(dag.keys())
rev_dag = {}
for source_node, target_nodes in dag.items():
for target_node in target_nodes:
no_incoming.discard(target_node)
rev_dag.setdefault(target_node, set()).add(source_node)
while no_incoming:
node = no_incoming.pop()
yield node
for target_node in list(dag.get(node, [])):
rev_dag[target_node].remove(node)
dag[node].remove(target_node)
if not dag[node]:
del dag[node]
if not rev_dag[target_node]:
del rev_dag[target_node]
no_incoming.add(target_node)
assert not rev_dag
def remove_generic(name):
if not name.endswith(">"):
return name
closed = 1
generic_params = []
for i in range(len(name) -2, -1, -1):
if name[i] == '>' and name[i-1] != '-':
closed += 1
elif name[i] == '<':
closed -= 1
if closed == 0:
return name[:i]
raise Exception("invalid type declaration: " + repr(name))
def print_header(message):
generator = CGenerator()
parser = CParser()
def del_spaces(name):
if name.startswith('(extension in '):
idx = name.index('):')
name = '_extension_in_' + name[14:idx] + "__" + name[idx+2:]
# file private types
if ' in _' in name:
idx = name.index(' in _')
end = name.index(')', idx)
start = name.rindex('(', None, idx)
namespace = name[:start]
if '>' in namespace:
namespace = mangle_name(namespace[:-1]) + '.'
name = namespace + name[start+1:idx] + name[end+1:]
return name
def mangle_name(human):
if human in ('void*', 'voidp', 'Metadata*'):
return human
if human == '()':
return 'void'
info = types[human]
if 'getGenericParams' in info and info['getGenericParams']:
name = remove_generic(human)
else:
name = human
if name.startswith("Static #"):
spl = name.split(' ', 4)
return "_static_no" + spl[1][1:] + "_in_" + spl[3] + "__func" + str(hash(spl[4]))[1:]
name = del_spaces(name)
outp = f'swift_{info["kind"]}__'
if info['kind'] == "Tuple":
elems = []
for e in info['tupleElements']:
name = mangle_name(e['type'])
if e['label']:
name += "__as_" + e['label']
elems.append(name)
outp += "with__" + "__and__".join(elems)
elif info['kind'] == "Existential":
protos = []
for p in info['protocols']:
protos.append(del_spaces(script.exports.demangle(p)).replace(".", "__"))
if info['isClassBounded']:
protos.append("Swift__AnyObject")
outp += "conforming_to__" + "__and__".join(protos)
if info.get('getSuperclassConstraint'):
outp += "__inheriting_from_" + mangle_name(info['getSuperclassConstraint'])
elif info['kind'] == 'Function':
return "func_" + str(hash(name))[1:]
else:
outp += name.replace(".", "_")
if 'getGenericParams' in info and info['getGenericParams']:
gen_params = [mangle_name(param) for param in info['getGenericParams']]
outp += "__of__" + "__and__".join(gen_params)
return outp
def make_decl(name, offset, type_name):
nonlocal decls, pad_count, parser, prev_end
if isinstance(offset, str):
assert offset[:2] == '0x'
offset = int(offset, 16)
if prev_end < offset:
pad_str = f"char _padding{pad_count}[{offset - prev_end}];"
decls.append(parser.parse(pad_str).ext[0])
pad_count += 1
type_decl = TypeDecl(name.replace(".", "__"), None, IdentifierType([mangle_name(type_name)]))
decls.append(Decl(None, None, None, None, type_decl, None, None))
req_graph.setdefault(type_name, set()).add(parent_name)
if offset != -1:
size = pointer_size if type_name.endswith('*') else int(types[type_name]['size'], 16)
prev_end = offset + size
print("#include <stdint.h>")
print("#pragma pack(1)")
print("typedef void *voidp;")
print("typedef struct Metadata_s Metadata;")
types = json.loads(message)
req_graph = {}
ptr_types = {'void*', 'voidp', 'Metadata*'}
ctypes = {}
for name, info in types.items():
pad_count = 0
decls = []
prev_end = 0
ctype = None
parent_name = name
if info['kind'] == "Tuple":
for i, elem in enumerate(info['tupleElements']):
make_decl(elem['label'] or f'_{i}', elem['offset'], elem['type'])
ctype = Struct(mangle_name(name) + "_s", decls)
elif info['kind'] == "ObjCClassWrapper":
print(f'typedef struct {mangle_name(name)}_s *{mangle_name(name)};')
elif info['kind'] in ("Struct", "Class"):
if info['kind'] == 'Class':
make_decl('_isa', '0x0', 'Metadata*')
#make_decl('_refCounts', hex(pointer_size), 'size_t')
for i, field in enumerate(info['fields']):
make_decl(field['name'], field['offset'], field['type'])
ctype = Struct(mangle_name(name) + "_s", decls)
if info['kind'] == 'Class':
ctype = PtrDecl(None, ctype)
elif info['kind'] == "Existential":
if info['isClassBounded'] or info.get('getSuperclassConstraint'):  # class existential container
make_decl(f'heap_object', -1, 'void*')
else:  # opaque existential container
union = "union { void *heapObject; void *fixedSizeBuffer[3]; };"
decls.append(parser.parse(union).ext[0])
make_decl("dynamicType", -1, "Metadata*")
for i in range(info['witnessTableCount']):
make_decl(f'_witnessTable{i + 1}', -1, 'void*')
ctype = Struct(mangle_name(name) + "_s", decls)
elif info['kind'] in ("Enum", "Optional"):
if info['enumCases'] and info['enumCases'][0]['name'] is None:
# C-like enum
# we don't have case names or values, so just generate a typedef to an int type
print(f"typedef uint{int(info['size'], 16) * 8}_t {mangle_name(name)};")
elif len(info['enumCases']) == 0:
ctype = Struct(mangle_name(name) + "_s", decls)
elif len(info['enumCases']) == 1 and info['enumCases'][0]['type']:
make_decl(info['enumCases'][0]['name'], 0, info['enumCases'][0]['type'])
ctype = Struct(mangle_name(name) + "_s", decls)
else:
print(f'typedef struct {mangle_name(name)}_s {{ char _data[{info["size"]}]; }} {mangle_name(name)};')
elif info['kind'] == 'Opaque':
if 'getCType' in info:
ctype_names = {
'pointer': 'void*',
'int8': 'int8_t',
'int16': 'int16_t',
'int32': 'int32_t',
'int64': 'int64_t',
'int64': 'int64_t',
}
print(f'typedef {ctype_names[info["getCType"]]} {mangle_name(name)};')
elif name == 'Builtin.NativeObject':
print(f'typedef void *{mangle_name(name)};')
else:
print(f'typedef char {mangle_name(name)}[{info["size"]}];')
elif info['kind'] == 'Function':
print(f"typedef void *func_{str(hash(name))[1:]};")  # TODO: proper names
else:
print(f'typedef char {mangle_name(name)}[{info["size"]}];')
if ctype:
type_decl = TypeDecl(mangle_name(name), None, ctype)
ctypes[name] = type_decl
type_decl_forward = Struct(mangle_name(name) + "_s", [])
if isinstance(type_decl, PtrDecl):
ptr_types.add(name)
type_decl_forward = PtrDecl(None, type_decl_forward)
print(generator.visit(Typedef(mangle_name(name), None, ['typedef'], type_decl_forward)) + ";")
for name in ptr_types:
req_graph.pop(name, None)
for name in top_sort(req_graph):
if name in ctypes:
print(f"\n            print(generator.visit(Typedef(mangle_name(name), None, ['typedef'], ctypes[name])) + ";")
script.on('message', recv)
script.load()
pointer_size = script.exports.pointerSize()
print_header(script.exports.run())
session.detach()
sys.exit(0)
