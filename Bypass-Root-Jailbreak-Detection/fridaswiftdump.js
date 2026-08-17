/*
FridaSwiftDump a Frida tool for retriving the Swift Object info from an running app. 
It's the Frida version of my Mac OS command-line tool [SwiftDump](https:
You can either use`SwiftDump` for a Mach-O file or `FridaSwiftDump` for a foreground running app.
Check [SwiftDump](https:
*/
(function() {
function r(e, n, t) {
function o(i, f) {
if (!n[i]) {
if (!e[i]) {
var c = "function" == typeof require && require;
if (!f && c) return c(i, !0);
if (u) return u(i, !0);
var a = new Error("Cannot find module '" + i + "'");
throw a.code = "MODULE_NOT_FOUND", a
}
var p = n[i] = {
exports: {}
};
e[i][0].call(p.exports, function(r) {
var n = e[i][1][r];
return o(n || r)
}, p, p.exports, r, e, n, t)
}
return n[i].exports
}
for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
return o
}
return r
})()({
1: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.ESection = exports.ESegment = void 0;
var ESegment;
(function(ESegment) {
ESegment["TEXT"] = "__TEXT";
ESegment["DATA"] = "__DATA";
ESegment["DATA_CONST"] = "__DATA_CONST";
})(ESegment = exports.ESegment || (exports.ESegment = {}));
var ESection;
(function(ESection) {
ESection["swift5types"] = "__swift5_types";
ESection["swift5proto"] = "__swift5_proto";
ESection["swift5protos"] = "__swift5_protos";
ESection["swift5filemd"] = "__swift5_fieldmd";
ESection["objc_classlist"] = "__objc_classlist";
})(ESection = exports.ESection || (exports.ESection = {}));
}, {
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
2: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));
var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
(0, _defineProperty["default"])(o, k2, {
enumerable: true,
get: function get() {
return m[k];
}
});
} : function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function(o, v) {
(0, _defineProperty["default"])(o, "default", {
enumerable: true,
value: v
});
} : function(o, v) {
o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function(mod) {
if (mod && mod.__esModule) return mod;
var result = {};
if (mod != null)
for (var k in mod) {
if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
}
__setModuleDefault(result, mod);
return result;
};
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.getSectionData = exports.swift_demangle = exports.initHook = exports.isSwiftAvailable = void 0;
var logger_1 = require("./logger");
var Util = __importStar(require("./Util"));
var size_t = Process.pointerSize === 8 ? 'uint64' : Process.pointerSize === 4 ? 'uint32' : "unsupported platform";
var _swift_demangle;
var _free;
var _getsectiondata; 
function isSwiftAvailable() {
var tmp = Module.findBaseAddress("libswiftCore.dylib");
return tmp != null;
}
exports.isSwiftAvailable = isSwiftAvailable;
function initHook() {
logger_1.log('[Runtime] initHook...'); 
if (isSwiftAvailable()) {
var addr_swift_demangle = Module.getExportByName("libswiftCore.dylib", "swift_demangle");
_swift_demangle = new NativeFunction(addr_swift_demangle, "pointer", ["pointer", size_t, "pointer", "pointer", 'int32']);
logger_1.log("[Runtime] hook swift_demangle ".concat(addr_swift_demangle, " -> ").concat(_swift_demangle));
} else {
logger_1.log("[Runtime] fail to find swift_demangle, swift is not avaliable");
} 
var addr_free = Module.getExportByName("libsystem_malloc.dylib", "free");
_free = new NativeFunction(addr_free, "void", ["pointer"]);
logger_1.log("[Runtime] hook free ".concat(addr_free, " -> ").concat(_free)); 
var addr_getsectiondata = Module.getExportByName("libmacho.dylib", "getsectiondata");
_getsectiondata = new NativeFunction(addr_getsectiondata, "pointer", ["pointer", "pointer", "pointer", "pointer"]);
logger_1.log("addr_getsectiondata ".concat(addr_getsectiondata, " -> ").concat(_getsectiondata));
}
exports.initHook = initHook;
function swift_demangle(name) {
if (!_swift_demangle) {
return name;
}
var fixname = name;
if (name.startsWith("$s") || name.startsWith("_T")) {
fixname = name;
} else if (name.startsWith("So")) {
fixname = "$s" + name;
} else if (Util.isPrintableString(name)) {
fixname = "$s" + name;
} else {
return name;
}
var cStr = Memory.allocUtf8String(fixname);
var demangled = _swift_demangle(cStr, fixname.length, ptr(0), ptr(0), 0);
var res = null;
if (demangled) {
res = demangled.readUtf8String();
_free(demangled);
}
if (res && res != fixname) {
return res;
}
return name;         }
exports.swift_demangle = swift_demangle;
function getSectionData(module, sect, seg) {
var segName = Memory.allocUtf8String(seg);
var sectName = Memory.allocUtf8String(sect);
var sizeAlloc = Memory.alloc(8);
var ptrSection = _getsectiondata(module.base, segName, sectName, sizeAlloc);
var sectionSize = sizeAlloc.readULong(); 
return [ptrSection, sectionSize];
}
exports.getSectionData = getSectionData; 
}, {
"./Util": 6,
"./logger": 8,
"@babel/runtime-corejs2/core-js/object/create": 13,
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
3: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.getKindDesc = exports.SDContextDescriptorFlags = exports.SDContextDescriptorKind = void 0;
var SDContextDescriptorKind;
(function(SDContextDescriptorKind) {
SDContextDescriptorKind[SDContextDescriptorKind["Module"] = 0] = "Module"; 
SDContextDescriptorKind[SDContextDescriptorKind["Extension"] = 1] = "Extension";             
SDContextDescriptorKind[SDContextDescriptorKind["Anonymous"] = 2] = "Anonymous"; 
SDContextDescriptorKind[SDContextDescriptorKind["SwiftProtocol"] = 3] = "SwiftProtocol"; 
SDContextDescriptorKind[SDContextDescriptorKind["OpaqueType"] = 4] = "OpaqueType";                         
SDContextDescriptorKind[SDContextDescriptorKind["Class"] = 16] = "Class"; 
SDContextDescriptorKind[SDContextDescriptorKind["Struct"] = 17] = "Struct"; 
SDContextDescriptorKind[SDContextDescriptorKind["Enum"] = 18] = "Enum"; 
SDContextDescriptorKind[SDContextDescriptorKind["Type_Last"] = 31] = "Type_Last";
SDContextDescriptorKind[SDContextDescriptorKind["Unknow"] = 255] = "Unknow";         })(SDContextDescriptorKind = exports.SDContextDescriptorKind || (exports.SDContextDescriptorKind = {}));
var SDContextDescriptorFlags =  function() {
function SDContextDescriptorFlags(val) {
(0, _classCallCheck2["default"])(this, SDContextDescriptorFlags);
this.value = val;
} 
(0, _createClass2["default"])(SDContextDescriptorFlags, [{
key: "getKind",
value: function getKind() {
var tmp = this.value & 0x1F;
switch (tmp) {
case SDContextDescriptorKind.Module:
return SDContextDescriptorKind.Module;
case SDContextDescriptorKind.Extension:
return SDContextDescriptorKind.Extension;
case SDContextDescriptorKind.Anonymous:
return SDContextDescriptorKind.Anonymous;
case SDContextDescriptorKind.SwiftProtocol:
return SDContextDescriptorKind.SwiftProtocol;
case SDContextDescriptorKind.OpaqueType:
return SDContextDescriptorKind.OpaqueType;
case SDContextDescriptorKind.Class:
return SDContextDescriptorKind.Class;
case SDContextDescriptorKind.Struct:
return SDContextDescriptorKind.Struct;
case SDContextDescriptorKind.Enum:
return SDContextDescriptorKind.Enum;
}
return SDContextDescriptorKind.Unknow;
} 
}, {
key: "isGeneric",
value: function isGeneric() {
return (this.value & 0x80) != 0;
} 
}, {
key: "isUnique",
value: function isUnique() {
return (this.value & 0x40) != 0;
}                 
}, {
key: "getVersion",
value: function getVersion() {
return this.value >> 8 & 0xFF;
}                 
}, {
key: "getKindSpecificFlags",
value: function getKindSpecificFlags() {
return this.value >> 16 & 0xFFFF;
}
}]);
return SDContextDescriptorFlags;
}();
exports.SDContextDescriptorFlags = SDContextDescriptorFlags;
function getKindDesc(kind) {
switch (kind) {
case SDContextDescriptorKind.Module:
return "module";
case SDContextDescriptorKind.Extension:
return "extension";
case SDContextDescriptorKind.Anonymous:
return "anonymous";
case SDContextDescriptorKind.SwiftProtocol:
return "protocol";
case SDContextDescriptorKind.OpaqueType:
return "opaqueType";
case SDContextDescriptorKind.Class:
return "class";
case SDContextDescriptorKind.Struct:
return "struct";
case SDContextDescriptorKind.Enum:
return "enum";
}
return "unknow";
}
exports.getKindDesc = getKindDesc;
}, {
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/classCallCheck": 19,
"@babel/runtime-corejs2/helpers/createClass": 20,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
4: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.SDNominalObj = exports.SDNominalObjField = void 0;
var SDContextDescriptorFlags_1 = require("./SDContextDescriptorFlags");
var SDNominalObjField = function SDNominalObjField() {
(0, _classCallCheck2["default"])(this, SDNominalObjField);
this.name = "";
this.type = "";
this.typePtr = new NativePointer(0);
};
exports.SDNominalObjField = SDNominalObjField;
var SDNominalObj =  function() {
function SDNominalObj() {
(0, _classCallCheck2["default"])(this, SDNominalObj);
this.contextDescriptorFlag = null;
this.typeName = "";
this.fields = [];
this.nominalOffset = 0;
this.mangledTypeName = "";
this.superClassName = "";
this.protocols = [];
}
(0, _createClass2["default"])(SDNominalObj, [{
key: "getKindDesc",
value: function getKindDesc() {
var kind = SDContextDescriptorFlags_1.SDContextDescriptorKind.Unknow;
if (this.contextDescriptorFlag) {
kind = this.contextDescriptorFlag.getKind();
}
return SDContextDescriptorFlags_1.getKindDesc(kind);
}
}, {
key: "dumpDefine",
value: function dumpDefine() {
var intent = "    ";
var str = "";
var kind = SDContextDescriptorFlags_1.SDContextDescriptorKind.Unknow;
if (this.contextDescriptorFlag) {
kind = this.contextDescriptorFlag.getKind();
}
var kindDesc = this.getKindDesc();
str += "".concat(kindDesc, " ") + this.typeName;
if (this.superClassName.length > 0) {
str += " : " + this.superClassName;
}
if (this.protocols.length > 0) {
var superStr = this.protocols.join(",");
var tmp = this.superClassName.length <= 0 ? " : " : "";
str += tmp + superStr;
}
str += " {\n"; 
for (var i = 0; i < this.fields.length; i++) {
var field = this.fields[i];
var fs = intent;
if (kind == SDContextDescriptorFlags_1.SDContextDescriptorKind.Enum) {
fs += "case ".concat(field.name, "\n");
} else {
fs += "let ".concat(field.name, ": ").concat(field.type, ";\n");
}
str += fs;
}
str += "}\n";
return str;
}
}]);
return SDNominalObj;
}();
exports.SDNominalObj = SDNominalObj;
}, {
"./SDContextDescriptorFlags": 3,
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/classCallCheck": 19,
"@babel/runtime-corejs2/helpers/createClass": 20,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
5: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));
var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
(0, _defineProperty["default"])(o, k2, {
enumerable: true,
get: function get() {
return m[k];
}
});
} : function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function(o, v) {
(0, _defineProperty["default"])(o, "default", {
enumerable: true,
value: v
});
} : function(o, v) {
o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function(mod) {
if (mod && mod.__esModule) return mod;
var result = {};
if (mod != null)
for (var k in mod) {
if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
}
__setModuleDefault(result, mod);
return result;
};
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.SDParser = void 0;
var logger_1 = require("./logger");
var Runtime = __importStar(require("./Runtime"));
var SDContextDescriptorFlags_1 = require("./SDContextDescriptorFlags");
var SDNominalObj_1 = require("./SDNominalObj");
var Consts_1 = require("./Consts");
var Util = __importStar(require("./Util"));
var SDParser =  function() {
function SDParser(module) {
(0, _classCallCheck2["default"])(this, SDParser);
this.cacheNominalAddressMap = {}; 
this.mangledNameMap = {}; 
this.nominalObjs = [];
this.targetModule = module;
this.mangledNameMap = {
"0x02f36d": "Int32",
"0x02cd6d": "Int16",
"0x027b6e": "UInt16",
"0x022b6c": "UInt32",
"0x02b98502": "Int64",
"0x02418a02": "UInt64",
"0x02958802": "CGFloat"
};
}
(0, _createClass2["default"])(SDParser, [{
key: "parseSwiftType",
value: function parseSwiftType() {
var _Runtime$getSectionDa = Runtime.getSectionData(this.targetModule, Consts_1.ESection.swift5types, Consts_1.ESegment.TEXT),
_Runtime$getSectionDa2 = (0, _slicedToArray2["default"])(_Runtime$getSectionDa, 2),
ptrSection = _Runtime$getSectionDa2[0],
sectionSize = _Runtime$getSectionDa2[1];
logger_1.log("ptrSection ".concat(ptrSection, ", sectionSize ").concat(sectionSize));
var UniqueNominalTypeDescriptor = 4; 
for (var index = 0; index < sectionSize; index = index + 4) {
var ptr = ptrSection.add(index);
var nominalArchOffset = ptr.readS32();
var nominalPtr = ptr.add(nominalArchOffset); 
var flags = nominalPtr.readU32();
var sdfObj = new SDContextDescriptorFlags_1.SDContextDescriptorFlags(flags);
var type = sdfObj.getKind(); 
var parentVal = nominalPtr.add(4).readS32();
var namePtr = readMove(nominalPtr.add(8));
var nameStr = namePtr.readUtf8String(); 
var obj = new SDNominalObj_1.SDNominalObj();
obj.typeName = nameStr !== null && nameStr !== void 0 ? nameStr : "";
obj.contextDescriptorFlag = sdfObj;
obj.nominalOffset = nominalArchOffset;
this.nominalObjs.push(obj);
if (nameStr) {
var addressStr = '0x' + nominalPtr.toString(16);
this.cacheNominalAddressMap[addressStr] = nameStr;
}                         
var fdp1 = nominalPtr.add(4 * 4);
var fdp1Buf = fdp1.readByteArray(64);
var fdp1_val = fdp1.readS32();
var fieldDescriptorPtr = fdp1.add(fdp1_val);
var mangledTypeName = Util.readUCharHexString(fieldDescriptorPtr); 
if (mangledTypeName && mangledTypeName.length > 0) {
obj.mangledTypeName = mangledTypeName;
this.mangledNameMap[obj.mangledTypeName] = obj.typeName;
}
/*
if (nameStr) {
if (nameStr.startsWith('Test')) {
log(`${index}. ${ptr}, nominalArchOffset ${nominalArchOffset}, ${nominalPtr}, flags ${flags}, ${getKindDesc(type)}, name ${nameStr}, field ${fieldDescriptorPtr}, mangledTypeName ${ mangledTypeName } }`);
} else {
continue;
}
}*/
var fields = dumpFieldDescriptor(fieldDescriptorPtr, mangledTypeName.length == 0);
obj.fields = fields;
}
}
}, {
key: "dumpAll",
value: function dumpAll() {
var statistics = {};
for (var i = 0; i < this.nominalObjs.length; i++) {
var obj = this.nominalObjs[i];
obj.typeName = Runtime.swift_demangle(obj.typeName);
var kindDesc = obj.getKindDesc();
var kindNum = statistics[kindDesc];
if (kindNum) {
statistics[kindDesc] = kindNum + 1;
} else {
statistics[kindDesc] = 1;
}
/*
if (obj.typeName != 'Test') {
continue;
}
*/
for (var k = 0; k < obj.fields.length; k++) {
var field = obj.fields[k];
var ft = field.type;
if (ft.startsWith('0x')) {
var fixName = this.mangledNameMap[ft];
if (fixName && fixName.length > 0) {
field.type = fixName;
} else {
field.type = this.fixMangledName(ft, field.typePtr);
}
} else {
var checkName = "$s" + ft;
var tmp = Runtime.swift_demangle(checkName);
if (tmp != checkName) {
field.type = tmp;
}
}
}
logger_1.log("".concat(obj.dumpDefine()));
}
logger_1.log("\n[statistics]:");
for (var key in statistics) {
logger_1.log("".concat(key, "  ").concat(statistics[key]));
}
}
}, {
key: "fixMangledName",
value: function fixMangledName(typeName, startPtr) {
if (!typeName.startsWith('0x')) {
return typeName;
}
var typeNameArray = Util.hexStrToUIntArray(typeName); 
var mangledName = "";
var i = 0;
while (i < typeNameArray.length) {
var val = typeNameArray[i];
var valStr = String.fromCharCode(val);
if (val == 0x01) {
var fromIdx = i + 1;
var toIdx = i + 5;
if (toIdx > typeNameArray.length) {
mangledName = mangledName + valStr;
i = i + 1;
continue;
}
var offsetArray = typeNameArray.slice(fromIdx, toIdx);
var tmpPtr = startPtr.add(fromIdx);
var result = this.resoleSymbolicRefDirectly(offsetArray, tmpPtr);
if (i == 0 && toIdx >= typeNameArray.length) {
mangledName = mangledName + result;                             } else {
var fixName = this.makeDemangledTypeName(result, "");
mangledName = mangledName + fixName;
}
i = i + 5;
} else if (val == 0x02) {
var _fromIdx = i + 1; 
var _toIdx = i + 4 > typeNameArray.length ? i + (typeNameArray.length - i) : i + 4; 
var _offsetArray = typeNameArray.slice(_fromIdx, _toIdx);
var _tmpPtr = startPtr.add(_fromIdx);
var _result = this.resoleSymbolicRefIndirectly(_offsetArray, _tmpPtr);
if (i == 0 && _toIdx >= typeNameArray.length) {
mangledName = mangledName + _result;
} else {
var _fixName = this.makeDemangledTypeName(_result, mangledName);
mangledName = mangledName + _fixName;
}
i = _toIdx + 1;
} else {
mangledName = mangledName + valStr;
i = i + 1;
}
}
var retName = Runtime.swift_demangle(mangledName); 
return retName;
}
}, {
key: "makeDemangledTypeName",
value: function makeDemangledTypeName(type, header) {
var isArray = header.indexOf("Say") >= 0 || header.indexOf("SDy") >= 0;
var suffix = isArray ? "G" : "";
var fixName = "So".concat(type.length).concat(type, "C") + suffix;
return fixName;
}
}, {
key: "resoleSymbolicRefDirectly",
value: function resoleSymbolicRefDirectly(offsetArray, ptr) {
var hexStr = Util.uintArrayToHexStr(offsetArray.reverse());
var address = (0, _parseInt2["default"])(hexStr);
var nominalArchPtr = overflowAdd(ptr, address);
var addressStr = '0x' + nominalArchPtr.toString(16); 
var nominalName = this.cacheNominalAddressMap[addressStr];
if (nominalName && nominalName.length > 0) {
return nominalName;
} else {
return Util.uintArrayToHexStr(offsetArray);
}
}
}, {
key: "resoleSymbolicRefIndirectly",
value: function resoleSymbolicRefIndirectly(offsetArray, ptr) {
var hexStr = Util.uintArrayToHexStr(offsetArray.reverse());
var address = (0, _parseInt2["default"])(hexStr);
var addrPtr = overflowAdd(ptr, address);
var addrVal = addrPtr.readU64();
var addrValStr = '0x' + addrVal.toString(16); 
var nominalName = this.cacheNominalAddressMap[addrValStr];
if (nominalName && nominalName.length > 0) {
return nominalName;
} else {
return Util.uintArrayToHexStr(offsetArray);
}
}
}]);
return SDParser;
}(); 
exports.SDParser = SDParser;
function overflowAdd(ptr, add) {
var mask = 0xFFFFFFFF;
var low32Ptr = ptr.and(mask);
var highPtr = ptr.sub(low32Ptr);
var tmp = low32Ptr.add(add).and(mask);
return tmp.add(highPtr);
}
function emptyfunc() {
/*
if (type.startsWith("Struct")){
} else if (type.startsWith("Enum")){
log(`${index} -> ${ptr} , offset ${offset}, ${nominalPtr}, flags ${type}, name ${nameStr}`);
let numPayloadCases = nominalPtr.add(4 * 5).readU32();                 let numEmptyCases = nominalPtr.add(4 * 6).readU32();
log(`    numPayload ${numPayloadCases}, numEmptyCases ${numEmptyCases}`)
dumpStuct(nominalPtr, fieldDescriptorPtr);                 
} else if (type.startsWith("Class")){
if (nameStr !== "MappingPropertyHandler") {
}
log(`${index} -> ${ptr} , offset ${offset}, ${nominalPtr}, flags ${type}, name ${nameStr}`);
let superclassType = nominalPtr.add(4 * 5).readS32();
let metadataNegativeSizeInWords = nominalPtr.add(4 * 6).readU32();
let metadataPositiveSizeInWords = nominalPtr.add(4 * 7).readU32();
let numImmediateMembers = nominalPtr.add(4 * 8).readU32();
let numFields = nominalPtr.add(4 * 9).readU32();
log(`    superclassType ${superclassType}`);
log(`    metadataNegativeSizeInWords ${metadataNegativeSizeInWords}`);
log(`    metadataPositiveSizeInWords ${metadataPositiveSizeInWords}`);
log(`    numImmediateMembers ${numImmediateMembers}`);
log(`    numFields ${numFields}`);
dumpFieldDescriptor(fieldDescriptorPtr);
} else {
continue;
}
*/
}
function dumpFieldDescriptor(fieldDescriptorPtr, ignoreMangledTypeName) {
var startOffset = 4; 
var numFields = fieldDescriptorPtr.add(startOffset + 4 + 2 + 2).readU32();
if (0 === numFields) {
return [];
}
if (numFields > 1000) {
logger_1.log("[dumpFieldDescriptor] ".concat(numFields, " too many fields, may be unhandled format"));
return [];
}
var ret = []; 
var fieldStart = fieldDescriptorPtr.add(startOffset + 4 + 2 + 2 + 4);
for (var i = 0; i < numFields; i++) {
var _fieldName, _typeName;
var filedAddr = fieldStart.add(i * (4 * 3));
var typePtr = readMove(filedAddr.add(4));
var typeName = "";
try {
var _typePtr$readCString;
typeName = (_typePtr$readCString = typePtr.readCString()) !== null && _typePtr$readCString !== void 0 ? _typePtr$readCString : "";
} catch (error) {}                                 
if (!Util.isPrintableString(typeName)) {
typeName = Util.readUCharHexString(typePtr);
}
var fieldPtr = readMove(filedAddr.add(8));
var fieldName = "";
try {
var _fieldPtr$readCString;
fieldName = (_fieldPtr$readCString = fieldPtr.readCString()) !== null && _fieldPtr$readCString !== void 0 ? _fieldPtr$readCString : "";
} catch (error) {}                 
var obj = new SDNominalObj_1.SDNominalObjField();
obj.name = (_fieldName = fieldName) !== null && _fieldName !== void 0 ? _fieldName : "";
obj.type = (_typeName = typeName) !== null && _typeName !== void 0 ? _typeName : "";
obj.typePtr = typePtr;
ret.push(obj);
}
return ret;
}
function readMove(ptr) {
return ptr.add(ptr.readS32());
}
}, {
"./Consts": 1,
"./Runtime": 2,
"./SDContextDescriptorFlags": 3,
"./SDNominalObj": 4,
"./Util": 6,
"./logger": 8,
"@babel/runtime-corejs2/core-js/object/create": 13,
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/core-js/parse-int": 15,
"@babel/runtime-corejs2/helpers/classCallCheck": 19,
"@babel/runtime-corejs2/helpers/createClass": 20,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21,
"@babel/runtime-corejs2/helpers/slicedToArray": 24
}],
6: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.uintArrayToHexStr = exports.hexStrToUIntArray = exports.readUCharHexString = exports.swapInt32 = exports.swapInt16 = exports.hexString = exports.isPrintableString = exports.isPrintableChar = void 0;
function isPrintableChar(val) {
var isNumber = val >= 0x30 && val <= 0x39;
var isUpper = val >= 0x41 && val <= 0x5a;
var isLower = val >= 0x61 && val <= 0x7a;
var isSpecial = val == 0x5f || val == 0x24 || val == 0x20;
return isNumber || isUpper || isLower || isSpecial;
}
exports.isPrintableChar = isPrintableChar;
function isPrintableString(str) {
for (var i = 0; i < str.length; i++) {
var val = str.charCodeAt(i);
if (!isPrintableChar(val)) {
return false;
}
}
return true;
}
exports.isPrintableString = isPrintableString;
function hexString(str) {
var ret = "0x";
for (var i = 0; i < str.length; i++) {
var val = str.charCodeAt(i);
var valstr = val.toString(16);
if (valstr.length == 1) {
valstr = '0' + valstr;
}
ret = ret + valstr;
}
return ret;
}
exports.hexString = hexString;
function readUCharHexString(ptr) {
var maxlen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 128;
var idx = 0;
var hexStr = "";
while (true) {
var val = ptr.add(idx).readU8();
if (val == 0) {
break;
}
var valstr = val.toString(16);
if (valstr.length == 1) {
valstr = '0' + valstr;
}
hexStr += valstr;
idx++;
if (idx >= maxlen) {
break;
}
}
if (hexStr.length > 0) {
hexStr = "0x" + hexStr;
}
return hexStr;
}
exports.readUCharHexString = readUCharHexString;
function swapInt16(val) {
return (val & 0xff) << 8 | val >> 8 & 0xff;
}
exports.swapInt16 = swapInt16;
function swapInt32(val) {
return (val & 0xff) << 24 | (val & 0xff00) << 8 | (val & 0xff0000) >> 8 | val >> 24 & 0xff;
}
exports.swapInt32 = swapInt32;
function hexStrToUIntArray(inputStr) {
var str = inputStr;
if (str.startsWith('0x')) {
str = str.substr(2);
}
var hex = str.toString();
var result = [];
for (var n = 0; n < hex.length; n += 2) {
result.push((0, _parseInt2["default"])(hex.substr(n, 2), 16));
}
return result;
}
exports.hexStrToUIntArray = hexStrToUIntArray;
function uintArrayToHexStr(array) {
var str = "";
for (var n = 0; n < array.length; n += 1) {
var val = array[n];
var valstr = array[n].toString(16);
if (valstr.length == 1) {
valstr = '0' + valstr;
}
str += valstr;
}
if (str.length > 0) {
str = "0x" + str;
}
return str;
}
exports.uintArrayToHexStr = uintArrayToHexStr;
}, {
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/core-js/parse-int": 15,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
7: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
var _create = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/create"));
var __createBinding = void 0 && (void 0).__createBinding || (_create["default"] ? function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
(0, _defineProperty["default"])(o, k2, {
enumerable: true,
get: function get() {
return m[k];
}
});
} : function(o, m, k, k2) {
if (k2 === undefined) k2 = k;
o[k2] = m[k];
});
var __setModuleDefault = void 0 && (void 0).__setModuleDefault || (_create["default"] ? function(o, v) {
(0, _defineProperty["default"])(o, "default", {
enumerable: true,
value: v
});
} : function(o, v) {
o["default"] = v;
});
var __importStar = void 0 && (void 0).__importStar || function(mod) {
if (mod && mod.__esModule) return mod;
var result = {};
if (mod != null)
for (var k in mod) {
if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
}
__setModuleDefault(result, mod);
return result;
};
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
var logger_1 = require("./logger");
var Runtime = __importStar(require("./Runtime"));
var SDParser_1 = require("./SDParser");
/*
const header = Memory.alloc(16);
header
.writeU32(0xdeadbeef).add(4)
.writeU32(0xd00ff00d).add(4)
.writeU64(uint64("0x1122334455667788"));
log(hexdump(header.readByteArray(16) as ArrayBuffer, { ansi: true }));
Process.getModuleByName("libSystem.B.dylib")
.enumerateExports()
.slice(0, 16)
.forEach((exp, index) => {
log(`export ${index}: ${exp.name}`);
});
Interceptor.attach(Module.getExportByName(null, "open"), {
onEnter(args) {
const path = args[0].readUtf8String();
log(`open() path="${path}"`);
}
});
*/
logger_1.log("--- loaded ---");
Runtime.initHook();
/*
const mainExe = Module.findBaseAddress('TestSwiftRuntime');
log('mainExe ' + mainExe)
Interceptor.attach(mainExe!.add(0x00030FFC), {
onEnter(args) {
const ptr = args[0];             const typeAddrPtr = ptr.add(-24);             const typeAddr = typeAddrPtr.readPointer();
log(
`[Hook Func] arg ptr=${ptr}, typeAddrPtr=${typeAddrPtr}, typeAddr=${typeAddr}`
);
console.log("arg ptr->", hexdump(ptr, { offset: 0, length: 64 }));
log("")
console.log("typeAddrPtr->", hexdump(typeAddrPtr, { offset: 0, length: 64 }));
console.log("typeAddr->", hexdump(typeAddr, { offset: 0, length: 64 }));
},
});
*/
function getMainModule() {
var exePath = ObjC.classes.NSBundle.mainBundle().executablePath();
var modules = Process.enumerateModules();
for (var i = 0; i < modules.length; i++) {
var oneModule = modules[i];
if (oneModule.path == exePath) {
return oneModule;
}
}
return null;
}
var mainModule = getMainModule();
if (mainModule) {
logger_1.log('main module path ' + mainModule.path);
logger_1.log('main module base ' + mainModule.base);
if (Runtime.isSwiftAvailable()) {
var parser = new SDParser_1.SDParser(mainModule);
parser.parseSwiftType();
parser.dumpAll();
} else {
logger_1.log('swift is NOT available');
}
} else {
logger_1.log('fail to find main module');
}
}, {
"./Runtime": 2,
"./SDParser": 5,
"./logger": 8,
"@babel/runtime-corejs2/core-js/object/create": 13,
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
8: [function(require, module, exports) {
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");
var _defineProperty = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));
(0, _defineProperty["default"])(exports, "__esModule", {
value: true
});
exports.log = void 0;
function log(message) {
console.log(message);
}
exports.log = log;
}, {
"@babel/runtime-corejs2/core-js/object/define-property": 14,
"@babel/runtime-corejs2/helpers/interopRequireDefault": 21
}],
9: [function(require, module, exports) {
module.exports = require("core-js/library/fn/array/from");
}, {
"core-js/library/fn/array/from": 26
}],
10: [function(require, module, exports) {
module.exports = require("core-js/library/fn/array/is-array");
}, {
"core-js/library/fn/array/is-array": 27
}],
11: [function(require, module, exports) {
module.exports = require("core-js/library/fn/get-iterator");
}, {
"core-js/library/fn/get-iterator": 28
}],
12: [function(require, module, exports) {
module.exports = require("core-js/library/fn/is-iterable");
}, {
"core-js/library/fn/is-iterable": 29
}],
13: [function(require, module, exports) {
module.exports = require("core-js/library/fn/object/create");
}, {
"core-js/library/fn/object/create": 30
}],
14: [function(require, module, exports) {
module.exports = require("core-js/library/fn/object/define-property");
}, {
"core-js/library/fn/object/define-property": 31
}],
15: [function(require, module, exports) {
module.exports = require("core-js/library/fn/parse-int");
}, {
"core-js/library/fn/parse-int": 32
}],
16: [function(require, module, exports) {
module.exports = require("core-js/library/fn/symbol");
}, {
"core-js/library/fn/symbol": 33
}],
17: [function(require, module, exports) {
function _arrayLikeToArray(arr, len) {
if (len == null || len > arr.length) len = arr.length;
for (var i = 0, arr2 = new Array(len); i < len; i++) {
arr2[i] = arr[i];
}
return arr2;
}
module.exports = _arrayLikeToArray;
}, {}],
18: [function(require, module, exports) {
var _Array$isArray = require("../core-js/array/is-array");
function _arrayWithHoles(arr) {
if (_Array$isArray(arr)) return arr;
}
module.exports = _arrayWithHoles;
}, {
"../core-js/array/is-array": 10
}],
19: [function(require, module, exports) {
function _classCallCheck(instance, Constructor) {
if (!(instance instanceof Constructor)) {
throw new TypeError("Cannot call a class as a function");
}
}
module.exports = _classCallCheck;
}, {}],
20: [function(require, module, exports) {
var _Object$defineProperty = require("../core-js/object/define-property");
function _defineProperties(target, props) {
for (var i = 0; i < props.length; i++) {
var descriptor = props[i];
descriptor.enumerable = descriptor.enumerable || false;
descriptor.configurable = true;
if ("value" in descriptor) descriptor.writable = true;
_Object$defineProperty(target, descriptor.key, descriptor);
}
}
function _createClass(Constructor, protoProps, staticProps) {
if (protoProps) _defineProperties(Constructor.prototype, protoProps);
if (staticProps) _defineProperties(Constructor, staticProps);
return Constructor;
}
module.exports = _createClass;
}, {
"../core-js/object/define-property": 14
}],
21: [function(require, module, exports) {
function _interopRequireDefault(obj) {
return obj && obj.__esModule ? obj : {
"default": obj
};
}
module.exports = _interopRequireDefault;
}, {}],
22: [function(require, module, exports) {
var _getIterator = require("../core-js/get-iterator");
var _isIterable = require("../core-js/is-iterable");
var _Symbol = require("../core-js/symbol");
function _iterableToArrayLimit(arr, i) {
if (typeof _Symbol === "undefined" || !_isIterable(Object(arr))) return;
var _arr = [];
var _n = true;
var _d = false;
var _e = undefined;
try {
for (var _i = _getIterator(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
_arr.push(_s.value);
if (i && _arr.length === i) break;
}
} catch (err) {
_d = true;
_e = err;
} finally {
try {
if (!_n && _i["return"] != null) _i["return"]();
} finally {
if (_d) throw _e;
}
}
return _arr;
}
module.exports = _iterableToArrayLimit;
}, {
"../core-js/get-iterator": 11,
"../core-js/is-iterable": 12,
"../core-js/symbol": 16
}],
23: [function(require, module, exports) {
function _nonIterableRest() {
throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest;
}, {}],
24: [function(require, module, exports) {
var arrayWithHoles = require("./arrayWithHoles");
var iterableToArrayLimit = require("./iterableToArrayLimit");
var unsupportedIterableToArray = require("./unsupportedIterableToArray");
var nonIterableRest = require("./nonIterableRest");
function _slicedToArray(arr, i) {
return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}
module.exports = _slicedToArray;
}, {
"./arrayWithHoles": 18,
"./iterableToArrayLimit": 22,
"./nonIterableRest": 23,
"./unsupportedIterableToArray": 25
}],
25: [function(require, module, exports) {
var _Array$from = require("../core-js/array/from");
var arrayLikeToArray = require("./arrayLikeToArray");
function _unsupportedIterableToArray(o, minLen) {
if (!o) return;
if (typeof o === "string") return arrayLikeToArray(o, minLen);
var n = Object.prototype.toString.call(o).slice(8, -1);
if (n === "Object" && o.constructor) n = o.constructor.name;
if (n === "Map" || n === "Set") return _Array$from(o);
if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}
module.exports = _unsupportedIterableToArray;
}, {
"../core-js/array/from": 9,
"./arrayLikeToArray": 17
}],
26: [function(require, module, exports) {
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
}, {
"../../modules/_core": 40,
"../../modules/es6.array.from": 100,
"../../modules/es6.string.iterator": 107
}],
27: [function(require, module, exports) {
require('../../modules/es6.array.is-array');
module.exports = require('../../modules/_core').Array.isArray;
}, {
"../../modules/_core": 40,
"../../modules/es6.array.is-array": 101
}],
28: [function(require, module, exports) {
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
}, {
"../modules/core.get-iterator": 98,
"../modules/es6.string.iterator": 107,
"../modules/web.dom.iterable": 111
}],
29: [function(require, module, exports) {
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
}, {
"../modules/core.is-iterable": 99,
"../modules/es6.string.iterator": 107,
"../modules/web.dom.iterable": 111
}],
30: [function(require, module, exports) {
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D) {
return $Object.create(P, D);
};
}, {
"../../modules/_core": 40,
"../../modules/es6.object.create": 103
}],
31: [function(require, module, exports) {
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc) {
return $Object.defineProperty(it, key, desc);
};
}, {
"../../modules/_core": 40,
"../../modules/es6.object.define-property": 104
}],
32: [function(require, module, exports) {
require('../modules/es6.parse-int');
module.exports = require('../modules/_core').parseInt;
}, {
"../modules/_core": 40,
"../modules/es6.parse-int": 106
}],
33: [function(require, module, exports) {
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
require('../../modules/es7.symbol.async-iterator');
require('../../modules/es7.symbol.observable');
module.exports = require('../../modules/_core').Symbol;
}, {
"../../modules/_core": 40,
"../../modules/es6.object.to-string": 105,
"../../modules/es6.symbol": 108,
"../../modules/es7.symbol.async-iterator": 109,
"../../modules/es7.symbol.observable": 110
}],
34: [function(require, module, exports) {
module.exports = function(it) {
if (typeof it != 'function') throw TypeError(it + ' is not a function!');
return it;
};
}, {}],
35: [function(require, module, exports) {
module.exports = function() {  };
}, {}],
36: [function(require, module, exports) {
var isObject = require('./_is-object');
module.exports = function(it) {
if (!isObject(it)) throw TypeError(it + ' is not an object!');
return it;
};
}, {
"./_is-object": 58
}],
37: [function(require, module, exports) {
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function(IS_INCLUDES) {
return function($this, el, fromIndex) {
var O = toIObject($this);
var length = toLength(O.length);
var index = toAbsoluteIndex(fromIndex, length);
var value;
if (IS_INCLUDES && el != el)
while (length > index) {
value = O[index++];
if (value != value) return true;
} else
for (; length > index; index++)
if (IS_INCLUDES || index in O) {
if (O[index] === el) return IS_INCLUDES || index || 0;
}
return !IS_INCLUDES && -1;
};
};
}, {
"./_to-absolute-index": 87,
"./_to-iobject": 89,
"./_to-length": 90
}],
38: [function(require, module, exports) {
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
var ARG = cof(function() {
return arguments;
}()) == 'Arguments';
var tryGet = function(it, key) {
try {
return it[key];
} catch (e) {  }
};
module.exports = function(it) {
var O, T, B;
return it === undefined ? 'Undefined' : it === null ? 'Null'
:
typeof(T = tryGet(O = Object(it), TAG)) == 'string' ? T
:
ARG ? cof(O)
:
(B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
}, {
"./_cof": 39,
"./_wks": 96
}],
39: [function(require, module, exports) {
var toString = {}.toString;
module.exports = function(it) {
return toString.call(it).slice(8, -1);
};
}, {}],
40: [function(require, module, exports) {
var core = module.exports = {
version: '2.6.11'
};
if (typeof __e == 'number') __e = core; 
}, {}],
41: [function(require, module, exports) {
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = function(object, index, value) {
if (index in object) $defineProperty.f(object, index, createDesc(0, value));
else object[index] = value;
};
}, {
"./_object-dp": 68,
"./_property-desc": 79
}],
42: [function(require, module, exports) {
var aFunction = require('./_a-function');
module.exports = function(fn, that, length) {
aFunction(fn);
if (that === undefined) return fn;
switch (length) {
case 1:
return function(a) {
return fn.call(that, a);
};
case 2:
return function(a, b) {
return fn.call(that, a, b);
};
case 3:
return function(a, b, c) {
return fn.call(that, a, b, c);
};
}
return function(  ) {
return fn.apply(that, arguments);
};
};
}, {
"./_a-function": 34
}],
43: [function(require, module, exports) {
module.exports = function(it) {
if (it == undefined) throw TypeError("Can't call method on  " + it);
return it;
};
}, {}],
44: [function(require, module, exports) {
module.exports = !require('./_fails')(function() {
return Object.defineProperty({}, 'a', {
get: function() {
return 7;
}
}).a != 7;
});
}, {
"./_fails": 49
}],
45: [function(require, module, exports) {
var isObject = require('./_is-object');
var document = require('./_global').document;
var is = isObject(document) && isObject(document.createElement);
module.exports = function(it) {
return is ? document.createElement(it) : {};
};
}, {
"./_global": 50,
"./_is-object": 58
}],
46: [function(require, module, exports) {
module.exports = (
'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
}, {}],
47: [function(require, module, exports) {
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function(it) {
var result = getKeys(it);
var getSymbols = gOPS.f;
if (getSymbols) {
var symbols = getSymbols(it);
var isEnum = pIE.f;
var i = 0;
var key;
while (symbols.length > i)
if (isEnum.call(it, key = symbols[i++])) result.push(key);
}
return result;
};
}, {
"./_object-gops": 73,
"./_object-keys": 76,
"./_object-pie": 77
}],
48: [function(require, module, exports) {
var global = require('./_global');
var core = require('./_core');
var ctx = require('./_ctx');
var hide = require('./_hide');
var has = require('./_has');
var PROTOTYPE = 'prototype';
var $export = function(type, name, source) {
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
if (own && has(exports, key)) continue;
out = own ? target[key] : source[key];
exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
:
IS_BIND && own ? ctx(out, global)
:
IS_WRAP && target[key] == out ? (function(C) {
var F = function(a, b, c) {
if (this instanceof C) {
switch (arguments.length) {
case 0:
return new C();
case 1:
return new C(a);
case 2:
return new C(a, b);
}
return new C(a, b, c);
}
return C.apply(this, arguments);
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
$export.F = 1;         $export.G = 2;         $export.S = 4;         $export.P = 8;         $export.B = 16;         $export.W = 32;         $export.U = 64;         $export.R = 128;         module.exports = $export;
}, {
"./_core": 40,
"./_ctx": 42,
"./_global": 50,
"./_has": 51,
"./_hide": 52
}],
49: [function(require, module, exports) {
module.exports = function(exec) {
try {
return !!exec();
} catch (e) {
return true;
}
};
}, {}],
50: [function(require, module, exports) {
var global = module.exports = typeof window != 'undefined' && window.Math == Math ?
window : typeof self != 'undefined' && self.Math == Math ? self
:
Function('return this')();
if (typeof __g == 'number') __g = global; 
}, {}],
51: [function(require, module, exports) {
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key) {
return hasOwnProperty.call(it, key);
};
}, {}],
52: [function(require, module, exports) {
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value) {
return dP.f(object, key, createDesc(1, value));
} : function(object, key, value) {
object[key] = value;
return object;
};
}, {
"./_descriptors": 44,
"./_object-dp": 68,
"./_property-desc": 79
}],
53: [function(require, module, exports) {
var document = require('./_global').document;
module.exports = document && document.documentElement;
}, {
"./_global": 50
}],
54: [function(require, module, exports) {
module.exports = !require('./_descriptors') && !require('./_fails')(function() {
return Object.defineProperty(require('./_dom-create')('div'), 'a', {
get: function() {
return 7;
}
}).a != 7;
});
}, {
"./_descriptors": 44,
"./_dom-create": 45,
"./_fails": 49
}],
55: [function(require, module, exports) {
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it) {
return cof(it) == 'String' ? it.split('') : Object(it);
};
}, {
"./_cof": 39
}],
56: [function(require, module, exports) {
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;
module.exports = function(it) {
return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
}, {
"./_iterators": 64,
"./_wks": 96
}],
57: [function(require, module, exports) {
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
return cof(arg) == 'Array';
};
}, {
"./_cof": 39
}],
58: [function(require, module, exports) {
module.exports = function(it) {
return typeof it === 'object' ? it !== null : typeof it === 'function';
};
}, {}],
59: [function(require, module, exports) {
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries) {
try {
return entries ? fn(anObject(value)[0], value[1]) : fn(value);
} catch (e) {
var ret = iterator['return'];
if (ret !== undefined) anObject(ret.call(iterator));
throw e;
}
};
}, {
"./_an-object": 36
}],
60: [function(require, module, exports) {
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function() {
return this;
});
module.exports = function(Constructor, NAME, next) {
Constructor.prototype = create(IteratorPrototype, {
next: descriptor(1, next)
});
setToStringTag(Constructor, NAME + ' Iterator');
};
}, {
"./_hide": 52,
"./_object-create": 67,
"./_property-desc": 79,
"./_set-to-string-tag": 81,
"./_wks": 96
}],
61: [function(require, module, exports) {
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys());         var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';
var returnThis = function() {
return this;
};
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
$iterCreate(Constructor, NAME, next);
var getMethod = function(kind) {
if (!BUGGY && kind in proto) return proto[kind];
switch (kind) {
case KEYS:
return function keys() {
return new Constructor(this, kind);
};
case VALUES:
return function values() {
return new Constructor(this, kind);
};
}
return function entries() {
return new Constructor(this, kind);
};
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
if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
}
}
if (DEF_VALUES && $native && $native.name !== VALUES) {
VALUES_BUG = true;
$default = function values() {
return $native.call(this);
};
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
if (FORCED)
for (key in methods) {
if (!(key in proto)) redefine(proto, key, methods[key]);
} else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
}
return methods;
};
}, {
"./_export": 48,
"./_hide": 52,
"./_iter-create": 60,
"./_iterators": 64,
"./_library": 65,
"./_object-gpo": 74,
"./_redefine": 80,
"./_set-to-string-tag": 81,
"./_wks": 96
}],
62: [function(require, module, exports) {
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;
try {
var riter = [7][ITERATOR]();
riter['return'] = function() {
SAFE_CLOSING = true;
};
Array.from(riter, function() {
throw 2;
});
} catch (e) {  }
module.exports = function(exec, skipClosing) {
if (!skipClosing && !SAFE_CLOSING) return false;
var safe = false;
try {
var arr = [7];
var iter = arr[ITERATOR]();
iter.next = function() {
return {
done: safe = true
};
};
arr[ITERATOR] = function() {
return iter;
};
exec(arr);
} catch (e) {  }
return safe;
};
}, {
"./_wks": 96
}],
63: [function(require, module, exports) {
module.exports = function(done, value) {
return {
value: value,
done: !!done
};
};
}, {}],
64: [function(require, module, exports) {
module.exports = {};
}, {}],
65: [function(require, module, exports) {
module.exports = true;
}, {}],
66: [function(require, module, exports) {
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function() {
return true;
};
var FREEZE = !require('./_fails')(function() {
return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it) {
setDesc(it, META, {
value: {
i: 'O' + ++id,                     w: {}                 }
});
};
var fastKey = function(it, create) {
if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
if (!has(it, META)) {
if (!isExtensible(it)) return 'F';
if (!create) return 'E';
setMeta(it);
}
return it[META].i;
};
var getWeak = function(it, create) {
if (!has(it, META)) {
if (!isExtensible(it)) return true;
if (!create) return false;
setMeta(it);
}
return it[META].w;
};
var onFreeze = function(it) {
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
}, {
"./_fails": 49,
"./_has": 51,
"./_is-object": 58,
"./_object-dp": 68,
"./_uid": 93
}],
67: [function(require, module, exports) {
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function() {  };
var PROTOTYPE = 'prototype';
var createDict = function() {
var iframe = require('./_dom-create')('iframe');
var i = enumBugKeys.length;
var lt = '<';
var gt = '>';
var iframeDocument;
iframe.style.display = 'none';
require('./_html').appendChild(iframe);
iframe.src = 'javascript:';                                     iframeDocument = iframe.contentWindow.document;
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
}, {
"./_an-object": 36,
"./_dom-create": 45,
"./_enum-bug-keys": 46,
"./_html": 53,
"./_object-dps": 69,
"./_shared-key": 82
}],
68: [function(require, module, exports) {
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
}, {
"./_an-object": 36,
"./_descriptors": 44,
"./_ie8-dom-define": 54,
"./_to-primitive": 92
}],
69: [function(require, module, exports) {
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
}, {
"./_an-object": 36,
"./_descriptors": 44,
"./_object-dp": 68,
"./_object-keys": 76
}],
70: [function(require, module, exports) {
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
}, {
"./_descriptors": 44,
"./_has": 51,
"./_ie8-dom-define": 54,
"./_object-pie": 77,
"./_property-desc": 79,
"./_to-iobject": 89,
"./_to-primitive": 92
}],
71: [function(require, module, exports) {
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;
var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames ?
Object.getOwnPropertyNames(window) : [];
var getWindowNames = function(it) {
try {
return gOPN(it);
} catch (e) {
return windowNames.slice();
}
};
module.exports.f = function getOwnPropertyNames(it) {
return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};
}, {
"./_object-gopn": 72,
"./_to-iobject": 89
}],
72: [function(require, module, exports) {
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
return $keys(O, hiddenKeys);
};
}, {
"./_enum-bug-keys": 46,
"./_object-keys-internal": 75
}],
73: [function(require, module, exports) {
exports.f = Object.getOwnPropertySymbols;
}, {}],
74: [function(require, module, exports) {
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;
module.exports = Object.getPrototypeOf || function(O) {
O = toObject(O);
if (has(O, IE_PROTO)) return O[IE_PROTO];
if (typeof O.constructor == 'function' && O instanceof O.constructor) {
return O.constructor.prototype;
}
return O instanceof Object ? ObjectProto : null;
};
}, {
"./_has": 51,
"./_shared-key": 82,
"./_to-object": 91
}],
75: [function(require, module, exports) {
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');
module.exports = function(object, names) {
var O = toIObject(object);
var i = 0;
var result = [];
var key;
for (key in O)
if (key != IE_PROTO) has(O, key) && result.push(key);
while (names.length > i)
if (has(O, key = names[i++])) {
~arrayIndexOf(result, key) || result.push(key);
}
return result;
};
}, {
"./_array-includes": 37,
"./_has": 51,
"./_shared-key": 82,
"./_to-iobject": 89
}],
76: [function(require, module, exports) {
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');
module.exports = Object.keys || function keys(O) {
return $keys(O, enumBugKeys);
};
}, {
"./_enum-bug-keys": 46,
"./_object-keys-internal": 75
}],
77: [function(require, module, exports) {
exports.f = {}.propertyIsEnumerable;
}, {}],
78: [function(require, module, exports) {
var $parseInt = require('./_global').parseInt;
var $trim = require('./_string-trim').trim;
var ws = require('./_string-ws');
var hex = /^[-+]?0[xX]/;
module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix) {
var string = $trim(String(str), 3);
return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
}, {
"./_global": 50,
"./_string-trim": 85,
"./_string-ws": 86
}],
79: [function(require, module, exports) {
module.exports = function(bitmap, value) {
return {
enumerable: !(bitmap & 1),
configurable: !(bitmap & 2),
writable: !(bitmap & 4),
value: value
};
};
}, {}],
80: [function(require, module, exports) {
module.exports = require('./_hide');
}, {
"./_hide": 52
}],
81: [function(require, module, exports) {
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');
module.exports = function(it, tag, stat) {
if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, {
configurable: true,
value: tag
});
};
}, {
"./_has": 51,
"./_object-dp": 68,
"./_wks": 96
}],
82: [function(require, module, exports) {
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function(key) {
return shared[key] || (shared[key] = uid(key));
};
}, {
"./_shared": 83,
"./_uid": 93
}],
83: [function(require, module, exports) {
var core = require('./_core');
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
(module.exports = function(key, value) {
return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
version: core.version,
mode: require('./_library') ? 'pure' : 'global',
});
}, {
"./_core": 40,
"./_global": 50,
"./_library": 65
}],
84: [function(require, module, exports) {
var toInteger = require('./_to-integer');
var defined = require('./_defined');
module.exports = function(TO_STRING) {
return function(that, pos) {
var s = String(defined(that));
var i = toInteger(pos);
var l = s.length;
var a, b;
if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
a = s.charCodeAt(i);
return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ?
TO_STRING ? s.charAt(i) : a :
TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
};
};
}, {
"./_defined": 43,
"./_to-integer": 88
}],
85: [function(require, module, exports) {
var $export = require('./_export');
var defined = require('./_defined');
var fails = require('./_fails');
var spaces = require('./_string-ws');
var space = '[' + spaces + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');
var exporter = function(KEY, exec, ALIAS) {
var exp = {};
var FORCE = fails(function() {
return !!spaces[KEY]() || non[KEY]() != non;
});
var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
if (ALIAS) exp[ALIAS] = fn;
$export($export.P + $export.F * FORCE, 'String', exp);
};
var trim = exporter.trim = function(string, TYPE) {
string = String(defined(string));
if (TYPE & 1) string = string.replace(ltrim, '');
if (TYPE & 2) string = string.replace(rtrim, '');
return string;
};
module.exports = exporter;
}, {
"./_defined": 43,
"./_export": 48,
"./_fails": 49,
"./_string-ws": 86
}],
86: [function(require, module, exports) {
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
'\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
}, {}],
87: [function(require, module, exports) {
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function(index, length) {
index = toInteger(index);
return index < 0 ? max(index + length, 0) : min(index, length);
};
}, {
"./_to-integer": 88
}],
88: [function(require, module, exports) {
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function(it) {
return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
}, {}],
89: [function(require, module, exports) {
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function(it) {
return IObject(defined(it));
};
}, {
"./_defined": 43,
"./_iobject": 55
}],
90: [function(require, module, exports) {
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function(it) {
return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;         };
}, {
"./_to-integer": 88
}],
91: [function(require, module, exports) {
var defined = require('./_defined');
module.exports = function(it) {
return Object(defined(it));
};
}, {
"./_defined": 43
}],
92: [function(require, module, exports) {
var isObject = require('./_is-object');
module.exports = function(it, S) {
if (!isObject(it)) return it;
var fn, val;
if (S && typeof(fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
if (typeof(fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
if (!S && typeof(fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
throw TypeError("Can't convert object to primitive value");
};
}, {
"./_is-object": 58
}],
93: [function(require, module, exports) {
var id = 0;
var px = Math.random();
module.exports = function(key) {
return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
}, {}],
94: [function(require, module, exports) {
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function(name) {
var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, {
value: wksExt.f(name)
});
};
}, {
"./_core": 40,
"./_global": 50,
"./_library": 65,
"./_object-dp": 68,
"./_wks-ext": 95
}],
95: [function(require, module, exports) {
exports.f = require('./_wks');
}, {
"./_wks": 96
}],
96: [function(require, module, exports) {
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';
var $exports = module.exports = function(name) {
return store[name] || (store[name] =
USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
$exports.store = store;
}, {
"./_global": 50,
"./_shared": 83,
"./_uid": 93
}],
97: [function(require, module, exports) {
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it) {
if (it != undefined) return it[ITERATOR] ||
it['@@iterator'] ||
Iterators[classof(it)];
};
}, {
"./_classof": 38,
"./_core": 40,
"./_iterators": 64,
"./_wks": 96
}],
98: [function(require, module, exports) {
var anObject = require('./_an-object');
var get = require('./core.get-iterator-method');
module.exports = require('./_core').getIterator = function(it) {
var iterFn = get(it);
if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
return anObject(iterFn.call(it));
};
}, {
"./_an-object": 36,
"./_core": 40,
"./core.get-iterator-method": 97
}],
99: [function(require, module, exports) {
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').isIterable = function(it) {
var O = Object(it);
return O[ITERATOR] !== undefined ||
'@@iterator' in O
||
Iterators.hasOwnProperty(classof(O));
};
}, {
"./_classof": 38,
"./_core": 40,
"./_iterators": 64,
"./_wks": 96
}],
100: [function(require, module, exports) {
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./_iter-detect')(function(iter) {
Array.from(iter);
}), 'Array', {
from: function from(arrayLike  ) {
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
}, {
"./_create-property": 41,
"./_ctx": 42,
"./_export": 48,
"./_is-array-iter": 56,
"./_iter-call": 59,
"./_iter-detect": 62,
"./_to-length": 90,
"./_to-object": 91,
"./core.get-iterator-method": 97
}],
101: [function(require, module, exports) {
var $export = require('./_export');
$export($export.S, 'Array', {
isArray: require('./_is-array')
});
}, {
"./_export": 48,
"./_is-array": 57
}],
102: [function(require, module, exports) {
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind) {
this._t = toIObject(iterated);             this._i = 0;             this._k = kind;                     }, function() {
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
}, {
"./_add-to-unscopables": 35,
"./_iter-define": 61,
"./_iter-step": 63,
"./_iterators": 64,
"./_to-iobject": 89
}],
103: [function(require, module, exports) {
var $export = require('./_export');
$export($export.S, 'Object', {
create: require('./_object-create')
});
}, {
"./_export": 48,
"./_object-create": 67
}],
104: [function(require, module, exports) {
var $export = require('./_export');
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {
defineProperty: require('./_object-dp').f
});
}, {
"./_descriptors": 44,
"./_export": 48,
"./_object-dp": 68
}],
105: [function(require, module, exports) {
}, {}],
106: [function(require, module, exports) {
var $export = require('./_export');
var $parseInt = require('./_parse-int');
$export($export.G + $export.F * (parseInt != $parseInt), {
parseInt: $parseInt
});
}, {
"./_export": 48,
"./_parse-int": 78
}],
107: [function(require, module, exports) {
'use strict';
var $at = require('./_string-at')(true);
require('./_iter-define')(String, 'String', function(iterated) {
this._t = String(iterated);             this._i = 0;                     }, function() {
var O = this._t;
var index = this._i;
var point;
if (index >= O.length) return {
value: undefined,
done: true
};
point = $at(O, index);
this._i += point.length;
return {
value: point,
done: false
};
});
}, {
"./_iter-define": 61,
"./_string-at": 84
}],
108: [function(require, module, exports) {
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
var isObject = require('./_is-object');
var toObject = require('./_to-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $GOPS = require('./_object-gops');
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
var USE_NATIVE = typeof $Symbol == 'function' && !!$GOPS.f;
var QObject = global.QObject;
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;
var setSymbolDesc = DESCRIPTORS && $fails(function() {
return _create(dP({}, 'a', {
get: function() {
return dP(this, 'a', {
value: 7
}).a;
}
})).a != 7;
}) ? function(it, key, D) {
var protoDesc = gOPD(ObjectProto, key);
if (protoDesc) delete ObjectProto[key];
dP(it, key, D);
if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;
var wrap = function(tag) {
var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
sym._k = tag;
return sym;
};
var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it) {
return typeof it == 'symbol';
} : function(it) {
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
D = _create(D, {
enumerable: createDesc(0, false)
});
}
return setSymbolDesc(it, key, D);
}
return dP(it, key, D);
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
}
return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
var IS_OP = it === ObjectProto;
var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
var result = [];
var i = 0;
var key;
while (names.length > i) {
if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
}
return result;
};
if (!USE_NATIVE) {
$Symbol = function Symbol() {
if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
var $set = function(value) {
if (this === ObjectProto) $set.call(OPSymbols, value);
if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
setSymbolDesc(this, tag, createDesc(1, value));
};
if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, {
configurable: true,
set: $set
});
return wrap(tag);
};
redefine($Symbol[PROTOTYPE], 'toString', function toString() {
return this._k;
});
$GOPD.f = $getOwnPropertyDescriptor;
$DP.f = $defineProperty;
require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
require('./_object-pie').f = $propertyIsEnumerable;
$GOPS.f = $getOwnPropertySymbols;
if (DESCRIPTORS && !require('./_library')) {
redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
}
wksExt.f = function(name) {
return wrap(wks(name));
};
}
$export($export.G + $export.W + $export.F * !USE_NATIVE, {
Symbol: $Symbol
});
for (var es6Symbols = (
'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;) wks(es6Symbols[j++]);
for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);
$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
'for': function(key) {
return has(SymbolRegistry, key += '') ?
SymbolRegistry[key] :
SymbolRegistry[key] = $Symbol(key);
},
keyFor: function keyFor(sym) {
if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
for (var key in SymbolRegistry)
if (SymbolRegistry[key] === sym) return key;
},
useSetter: function() {
setter = true;
},
useSimple: function() {
setter = false;
}
});
$export($export.S + $export.F * !USE_NATIVE, 'Object', {
create: $create,
defineProperty: $defineProperty,
defineProperties: $defineProperties,
getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
getOwnPropertyNames: $getOwnPropertyNames,
getOwnPropertySymbols: $getOwnPropertySymbols
});
var FAILS_ON_PRIMITIVES = $fails(function() {
$GOPS.f(1);
});
$export($export.S + $export.F * FAILS_ON_PRIMITIVES, 'Object', {
getOwnPropertySymbols: function getOwnPropertySymbols(it) {
return $GOPS.f(toObject(it));
}
});
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function() {
var S = $Symbol();
return _stringify([S]) != '[null]' || _stringify({
a: S
}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
stringify: function stringify(it) {
var args = [it];
var i = 1;
var replacer, $replacer;
while (arguments.length > i) args.push(arguments[i++]);
$replacer = replacer = args[1];
if (!isObject(replacer) && it === undefined || isSymbol(it)) return;                 if (!isArray(replacer)) replacer = function(key, value) {
if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
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
}, {
"./_an-object": 36,
"./_descriptors": 44,
"./_enum-keys": 47,
"./_export": 48,
"./_fails": 49,
"./_global": 50,
"./_has": 51,
"./_hide": 52,
"./_is-array": 57,
"./_is-object": 58,
"./_library": 65,
"./_meta": 66,
"./_object-create": 67,
"./_object-dp": 68,
"./_object-gopd": 70,
"./_object-gopn": 72,
"./_object-gopn-ext": 71,
"./_object-gops": 73,
"./_object-keys": 76,
"./_object-pie": 77,
"./_property-desc": 79,
"./_redefine": 80,
"./_set-to-string-tag": 81,
"./_shared": 83,
"./_to-iobject": 89,
"./_to-object": 91,
"./_to-primitive": 92,
"./_uid": 93,
"./_wks": 96,
"./_wks-define": 94,
"./_wks-ext": 95
}],
109: [function(require, module, exports) {
require('./_wks-define')('asyncIterator');
}, {
"./_wks-define": 94
}],
110: [function(require, module, exports) {
require('./_wks-define')('observable');
}, {
"./_wks-define": 94
}],
111: [function(require, module, exports) {
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
}, {
"./_global": 50,
"./_hide": 52,
"./_iterators": 64,
"./_wks": 96,
"./es6.array.iterator": 102
}]
}, {}, [7])
