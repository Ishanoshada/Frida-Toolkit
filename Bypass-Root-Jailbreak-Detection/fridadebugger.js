(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BP_TYPE = exports.BPStatus = void 0;
const logger_1 = require("../logger");
class BPStatus {
static toString() {
let disp = '';
disp += `CurrentThreadId : ${BPStatus.currentThreadId}`;
disp += `CurrentPC : ${BPStatus.currentPC}`;
disp += `Breakpoints size : ${BPStatus.breakpoints.size}`;
disp += `\t${BPStatus.breakpoints.entries()}`;
disp += `threadContextMap size : ${BPStatus.threadContextMap.size}`;
disp += `\t${BPStatus.threadContextMap.entries()}`;
return disp;
}
}
exports.BPStatus = BPStatus;
BPStatus.isPaused = new Map();
BPStatus.currentThreadId = 0;
BPStatus.currentPC = new Map();
BPStatus.breakpoints = new Set();
BPStatus.bpType = new Map();
BPStatus.actionStep = new Map();
BPStatus.threadContextMap = new Map();
BPStatus.addBp = (bp, type) => {
BPStatus.breakpoints.add(bp);
BPStatus.bpType.set(bp, type);
};
BPStatus.removeBp = (bp) => {
BPStatus.breakpoints.delete(bp);
BPStatus.bpType.delete(bp);
};
BPStatus.getBpType = (bp) => {
const ret = BPStatus.bpType.get(bp);
if (ret == null)
throw new Error("bp type is null");
return ret;
};
BPStatus.setPaused = (thread_id, paused) => {
BPStatus.isPaused.set(thread_id, paused);
BPStatus.currentThreadId = thread_id;
};
BPStatus.hasPausedThread = () => {
for (const [_key, value] of BPStatus.isPaused) {
if (value)
return true;
}
return false;
};
BPStatus.addStepAction = (action, thread_id = BPStatus.currentThreadId) => {
let actions = BPStatus.actionStep.get(thread_id);
if (actions == undefined) {
actions = new Array();
BPStatus.actionStep.set(thread_id, actions);
}
actions.push(action);
};
BPStatus.listStepAction = (thread_id = BPStatus.currentThreadId) => {
let index = -1;
(0, logger_1.logw)(`selectd thread_id: ${thread_id}`);
BPStatus.actionStep.forEach((value, _key) => {
(0, logger_1.logd)(`[${++index}]\n\taction: ${value}`);
});
};
BPStatus.getStepActions = (thread_id = BPStatus.currentThreadId) => {
const actions = BPStatus.actionStep.get(thread_id);
if (actions == undefined)
return [];
return actions;
};
BPStatus.removeAllStepAction = (thread_id = BPStatus.currentThreadId) => {
const actions = BPStatus.actionStep.get(thread_id);
if (actions == undefined)
throw new Error("actions is null");
actions.splice(0, actions.length);
};
BPStatus.removeIndexStepAction = (index, thread_id = BPStatus.currentThreadId) => {
const actions = BPStatus.actionStep.get(thread_id);
if (actions == undefined)
throw new Error("actions is null");
actions.splice(index, 1);
};
BPStatus.addThreadContext = (thread_id, address, context) => {
let contextMap = BPStatus.threadContextMap.get(thread_id);
if (contextMap == undefined) {
contextMap = new Map();
BPStatus.threadContextMap.set(thread_id, contextMap);
}
contextMap.set(address, context);
};
BPStatus.getCurrentContext = (thread_id = BPStatus.currentThreadId) => {
const contextMap = BPStatus.threadContextMap.get(thread_id);
if (contextMap == undefined)
throw new Error("contextMap is null");
const address = BPStatus.currentPC.get(BPStatus.currentThreadId);
if (address == undefined)
throw new Error("address is null");
let context = undefined;
for (const [key, value] of contextMap) {
if (key.equals(address)) {
context = value;
break;
}
}
if (context == undefined)
throw new Error("context is null");
return context;
};
var BP_TYPE;
(function (BP_TYPE) {
BP_TYPE[BP_TYPE["LR"] = 0] = "LR";
BP_TYPE[BP_TYPE["SP"] = 1] = "SP";
BP_TYPE[BP_TYPE["RANGE"] = 2] = "RANGE";
BP_TYPE[BP_TYPE["Function"] = 3] = "Function";
})(BP_TYPE = exports.BP_TYPE || (exports.BP_TYPE = {}));
Reflect.set(globalThis, "BPStatus", BPStatus);
Reflect.set(globalThis, "bps", BPStatus);
},{"../logger":9}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackTrace = void 0;
const logger_1 = require("../logger");
const BPStatus_1 = require("./BPStatus");
class BackTrace {
constructor() { }
}
exports.BackTrace = BackTrace;
BackTrace.BackTraceByFrida = (ctx = BPStatus_1.BPStatus.getCurrentContext(), fuzzy = false, retText = false, slice = 6) => {
let tmpText = Thread.backtrace(ctx, fuzzy ? Backtracer.FUZZY : Backtracer.ACCURATE)
.slice(0, slice)
.map(DebugSymbol.fromAddress)
.map((sym, index) => {
let strRet = `${PD(`[${index}]`, 5)} ${sym}`;
return strRet;
})
.join(`\n`);
return !retText ? (0, logger_1.logd)(tmpText) : tmpText;
};
BackTrace.BackTraceBySystem = () => {
/**
* typedef enum {
_URC_NO_REASON = 0,
#if defined(__arm__) && !defined(__USING_SJLJ_EXCEPTIONS__) && \
!defined(__ARM_DWARF_EH__)
_URC_OK = 0,         #endif
_URC_FOREIGN_EXCEPTION_CAUGHT = 1,
_URC_FATAL_PHASE2_ERROR = 2,
_URC_FATAL_PHASE1_ERROR = 3,
_URC_NORMAL_STOP = 4,
_URC_END_OF_STACK = 5,
_URC_HANDLER_FOUND = 6,
_URC_INSTALL_CONTEXT = 7,
_URC_CONTINUE_UNWIND = 8,
#if defined(__arm__) && !defined(__USING_SJLJ_EXCEPTIONS__) && \
!defined(__ARM_DWARF_EH__)
_URC_FAILURE = 9         #endif
*/
let _Unwind_Reason_Code;
(function (_Unwind_Reason_Code) {
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_NO_REASON"] = 0] = "_URC_NO_REASON";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FOREIGN_EXCEPTION_CAUGHT"] = 1] = "_URC_FOREIGN_EXCEPTION_CAUGHT";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FATAL_PHASE2_ERROR"] = 2] = "_URC_FATAL_PHASE2_ERROR";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_FATAL_PHASE1_ERROR"] = 3] = "_URC_FATAL_PHASE1_ERROR";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_NORMAL_STOP"] = 4] = "_URC_NORMAL_STOP";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_END_OF_STACK"] = 5] = "_URC_END_OF_STACK";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_HANDLER_FOUND"] = 6] = "_URC_HANDLER_FOUND";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_INSTALL_CONTEXT"] = 7] = "_URC_INSTALL_CONTEXT";
_Unwind_Reason_Code[_Unwind_Reason_Code["_URC_CONTINUE_UNWIND"] = 8] = "_URC_CONTINUE_UNWIND";
})(_Unwind_Reason_Code || (_Unwind_Reason_Code = {}));
const _Unwind_Backtrace = new NativeFunction(DebugSymbol.fromName("_Unwind_Backtrace").address, 'int', ['pointer', 'pointer']);
const _Unwind_GetIP = new NativeFunction(DebugSymbol.fromName("_Unwind_GetIP").address, 'pointer', ['pointer']);
const _Unwind_SetIP = new NativeFunction(DebugSymbol.fromName("_Unwind_SetIP").address, 'void', ['pointer', 'pointer']);
const _Unwind_GetGR = new NativeFunction(DebugSymbol.fromName("_Unwind_GetGR").address, 'pointer', ['pointer', 'int']);
const _Unwind_SetGR = new NativeFunction(DebugSymbol.fromName("_Unwind_SetGR").address, 'void', ['pointer', 'int', 'pointer']);
const _Unwind_GetIPInfo = new NativeFunction(DebugSymbol.fromName("_Unwind_GetIPInfo").address, 'pointer', ['pointer', 'pointer']);
const _Unwind_GetCFA = new NativeFunction(DebugSymbol.fromName("_Unwind_GetCFA").address, 'pointer', ['pointer']);
const _Unwind_GetBSP = new NativeFunction(DebugSymbol.fromName("_Unwind_GetBSP").address, 'pointer', ['pointer']);
const _Unwind_GetDataRelBase = new NativeFunction(DebugSymbol.fromName("_Unwind_GetDataRelBase").address, 'pointer', ['pointer']);
const _Unwind_GetTextRelBase = new NativeFunction(DebugSymbol.fromName("_Unwind_GetTextRelBase").address, 'pointer', ['pointer']);
(0, logger_1.logd)(`DataRelBase ${_Unwind_GetDataRelBase} | TextRelBase ${_Unwind_GetTextRelBase}`);
var count = 0;
_Unwind_Backtrace(new NativeCallback((ctx, _arg) => {
try {
const ip = _Unwind_GetIP(ctx);             (0, logger_1.logd)(`Frame ${PD(`# ${++count}`, 5)}\n\t${DebugSymbol.fromAddress(ip)} | ${Instruction.parse(ip)}`);
if (Process.arch == 'arm64') {
const x19 = _Unwind_GetGR(ctx, 19);
const x20 = _Unwind_GetGR(ctx, 20);
const x21 = _Unwind_GetGR(ctx, 21);
const x22 = _Unwind_GetGR(ctx, 22);
const x23 = _Unwind_GetGR(ctx, 23);
const x24 = _Unwind_GetGR(ctx, 24);
const x25 = _Unwind_GetGR(ctx, 25);
const x26 = _Unwind_GetGR(ctx, 26);
const x27 = _Unwind_GetGR(ctx, 27);
const x28 = _Unwind_GetGR(ctx, 28);
const fp = _Unwind_GetGR(ctx, 29);
const lr = _Unwind_GetGR(ctx, 30);
const cfa = _Unwind_GetCFA(ctx);
(0, logger_1.logz)(`\t${PD(`x19: ${x19}`)} ${PD(`x20: ${x20}`)} ${PD(`x21: ${x21}`)} ${PD(`x22: ${x22}`)} ${PD(`x23: ${x23}`)} ${PD(`x24: ${x24}`)}\n\t${PD(`x25: ${x25}`)} ${PD(`x26: ${x26}`)} ${PD(`x27: ${x27}`)} ${PD(`x28: ${x28}`)}`);
(0, logger_1.logz)(`\t${PD(`fp: ${fp}`)} ${PD(`lr: ${lr}`)} ${PD(`sp: ${cfa}`)}`);
}
}
catch {  }
newLine();
return _Unwind_Reason_Code._URC_NO_REASON;
}, 'int', ['pointer', 'pointer']), NULL);
};
Reflect.set(globalThis, "bt", BackTrace.BackTraceByFrida);
Reflect.set(globalThis, "btf", BackTrace.BackTraceByFrida);
Reflect.set(globalThis, "bts", BackTrace.BackTraceBySystem);
},{"../logger":9,"./BPStatus":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreakPoint = void 0;
const instruction_1 = require("../instructions/instruction");
const BPStatus_1 = require("./BPStatus");
const logger_1 = require("../logger");
const utils_1 = require("../utils");
const debugger_1 = require("../debugger");
const signal_1 = require("../signal");
const DebugType = false;
class BreakPoint {
static InnerAttach(localPtr) {
Interceptor.attach(localPtr, {
onEnter(_args) {
Stalker.follow(Process.getCurrentThreadId(), {
events: {
call: false,
ret: false,
exec: true,
block: false,
compile: false,
},
transform: function (iterator) {
let instruction = iterator.next();
do {
if (debugger_1.Debugger.getModule(Process.getCurrentThreadId()).has(instruction.address)) {
if (DebugType)
(0, logger_1.logz)(`${DebugSymbol.fromAddress(instruction?.address)} ${instruction}`);
iterator.putCallout(BreakPoint.CalloutInner);
}
iterator.keep();
} while ((instruction = iterator.next()) !== null);
}
});
},
onLeave: BPStatus_1.BPStatus.getBpType(localPtr) != BPStatus_1.BP_TYPE.Function ? undefined : function (_retval) {
Stalker.unfollow(Process.getCurrentThreadId());
}
});
}
}
exports.BreakPoint = BreakPoint;
BreakPoint.continueThread = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
if (!BPStatus_1.BPStatus.hasPausedThread())
throw new Error("no paused thread");
Stalker.unfollow(thread_id);
signal_1.Signal.sem_post_thread_id(thread_id);
BPStatus_1.BPStatus.breakpoints.delete(BPStatus_1.BPStatus.currentPC.get(thread_id));
BPStatus_1.BPStatus.currentThreadId = 0;
BPStatus_1.BPStatus.setPaused(thread_id, false);
};
BreakPoint.attchByFunction = (mPtr = NULL, mdName = null) => {
let localPtr = NULL;
if (mPtr instanceof NativePointer)
localPtr = mPtr;
else {
if (typeof mPtr === 'string') {
localPtr = typeof mPtr === 'string' ? (mPtr.startsWith("0x") ? ptr(mPtr) : (function () {
const md = Module.findExportByName(mdName, mPtr);
if (md == null)
throw new Error("md is null");
return md;
})()) : mPtr;
}
else
localPtr = BreakPoint.checkArgs(mPtr);
}
BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.Function);
BreakPoint.InnerAttach(localPtr);
};
BreakPoint.checkArgs = (mPtr = NULL) => {
let localPtr = NULL;
if (mPtr instanceof NativePointer)
return localPtr;
if (typeof mPtr === 'number') {
localPtr = ptr(mPtr);
}
else {
throw new Error("mPtr must be number");
}
if (localPtr == null)
throw new Error("mPtr is null");
return localPtr;
};
BreakPoint.attachByLR = (mPtr = NULL) => {
let localPtr = BreakPoint.checkArgs(mPtr);
BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.LR);
BreakPoint.InnerAttach(localPtr);
throw new Error("not implement");
};
BreakPoint.attachBySP = (mPtr = NULL) => {
let localPtr = BreakPoint.checkArgs(mPtr);
BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.SP);
BreakPoint.InnerAttach(localPtr);
throw new Error("not implement");
};
BreakPoint.attachByRange = (mPtr = NULL) => {
let localPtr = BreakPoint.checkArgs(mPtr);
BPStatus_1.BPStatus.addBp(localPtr, BPStatus_1.BP_TYPE.RANGE);
BreakPoint.InnerAttach(localPtr);
throw new Error("not implement");
};
BreakPoint.CalloutInner = (context) => {
const currentPC = context.pc;
const thread_id = Process.getCurrentThreadId();
BPStatus_1.BPStatus.addThreadContext(thread_id, context.pc, context);
BPStatus_1.BPStatus.currentPC.set(thread_id, currentPC);
BPStatus_1.BPStatus.setPaused(thread_id, true);
if (BPStatus_1.BPStatus.breakpoints.has(currentPC.sub(4 * 4))) {
(0, logger_1.logw)(`Hit breakpoint at ${DebugSymbol.fromAddress(currentPC)} | ${Instruction.parse(currentPC)}`);
signal_1.Signal.sem_post_thread_id(thread_id);
}
if (Process.arch == "arm64") {
BreakPoint.callOutInnerArm64(context);
}
else if (Process.arch == "arm") {
BreakPoint.callOutInnerArm(context);
}
};
BreakPoint.printRegs = (context) => {
if (Process.arch == "arm64") {
const tc = context;
(0, logger_1.logw)(`${(0, utils_1.padding)(`X0: ${tc.x0}`)} ${(0, utils_1.padding)(`X1: ${tc.x1}`)} ${(0, utils_1.padding)(`X2: ${tc.x2}`)} ${(0, utils_1.padding)(`X3: ${tc.x3}`)} ${(0, utils_1.padding)(`X4: ${tc.x4}`)} ${(0, utils_1.padding)(`X5: ${tc.x5}`)} ${(0, utils_1.padding)(`X6: ${tc.x6}`)} ${(0, utils_1.padding)(`X7: ${tc.x7}`)}`);
(0, logger_1.logw)(`${(0, utils_1.padding)(`x8(XR): ${tc.x8}`)} ${(0, utils_1.padding)(`X9: ${tc.x9}`)} ${(0, utils_1.padding)(`X10: ${tc.x10}`)} ${(0, utils_1.padding)(`X11: ${tc.x11}`)} ${(0, utils_1.padding)(`X12: ${tc.x12}`)} ${(0, utils_1.padding)(`X13: ${tc.x13}`)} ${(0, utils_1.padding)(`X14: ${tc.x14}`)} ${(0, utils_1.padding)(`X15: ${tc.x15}`)}`);
(0, logger_1.logw)(`${(0, utils_1.padding)(`X19: ${tc.x19}`)} ${(0, utils_1.padding)(`X20: ${tc.x20}`)} ${(0, utils_1.padding)(`X21: ${tc.x21}`)} ${(0, utils_1.padding)(`X22: ${tc.x22}`)} ${(0, utils_1.padding)(`X23: ${tc.x23}`)}`);
(0, logger_1.logw)(`${(0, utils_1.padding)(`X24: ${tc.x24}`)} ${(0, utils_1.padding)(`X25: ${tc.x25}`)} ${(0, utils_1.padding)(`X26: ${tc.x26}`)} ${(0, utils_1.padding)(`X27: ${tc.x27}`)} ${(0, utils_1.padding)(`X28: ${tc.x28}`)}`);
(0, logger_1.logw)(`${(0, utils_1.padding)(`FP(X29): ${tc.fp}`)}  ${(0, utils_1.padding)(`LR(X30): ${tc.lr}`)}  ${(0, utils_1.padding)(`SP(X31): ${tc.sp}`)}  |  ${(0, utils_1.padding)(`PC: ${tc.pc}`)}`);
}
else if (Process.arch == "arm") {
const tc = context;
(0, logger_1.logw)(`R0: ${(0, utils_1.padding)(tc.r0)} R1: ${(0, utils_1.padding)(tc.r1)} R2: ${(0, utils_1.padding)(tc.r2)} R3: ${(0, utils_1.padding)(tc.r3)}`);
(0, logger_1.logw)(`R4: ${(0, utils_1.padding)(tc.r4)} R5: ${(0, utils_1.padding)(tc.r5)} R6: ${(0, utils_1.padding)(tc.r6)} R7: ${(0, utils_1.padding)(tc.r7)}`);
(0, logger_1.logw)(`R8: ${(0, utils_1.padding)(tc.r8)} R9: ${(0, utils_1.padding)(tc.r9)} R10: ${(0, utils_1.padding)(tc.r10)} R11: ${(0, utils_1.padding)(tc.r11)}`);
(0, logger_1.logw)(`IP(R12): ${(0, utils_1.padding)(tc.r12)} SP(R13): ${(0, utils_1.padding)(tc.sp)} LR(R14): ${(0, utils_1.padding)(tc.lr)} PC(R15): ${(0, utils_1.padding)(tc.pc)}`);
}
};
BreakPoint.callOutInnerArm64 = (context) => {
const tc = context;
const currentThread = Process.getCurrentThreadId();
(0, logger_1.logd)(`\n[ ${getThreadName(currentThread)} @ ${currentThread} }\n`);
BreakPoint.printRegs(context);
instruction_1.InstructionParser.printCurrentInstruction(tc.pc);
BPStatus_1.BPStatus.getStepActions(currentThread).forEach((action) => action(tc));
signal_1.Signal.sem_wait_threadid(currentThread);
};
BreakPoint.callOutInnerArm = (context) => {
throw new Error("not implement");
};
Reflect.set(globalThis, "BreakPoint", BreakPoint);
Reflect.set(globalThis, "bp", BreakPoint);
Reflect.set(globalThis, "b", BreakPoint.attchByFunction); Reflect.set(globalThis, "c", BreakPoint.continueThread); },{"../debugger":6,"../instructions/instruction":8,"../logger":9,"../signal":19,"../utils":20,"./BPStatus":1}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./BPStatus");
require("./breakpoint");
require("./backtrace");
},{"./BPStatus":1,"./backtrace":2,"./breakpoint":3}],5:[function(require,module,exports){
"use strict";
},{}],6:[function(require,module,exports){
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debugger = void 0;
const BPStatus_1 = require("./breakpoint/BPStatus");
const logger_1 = require("./logger");
class Debugger {
}
exports.Debugger = Debugger;
_a = Debugger;
Debugger.moduleFilters = new Set(["libil2cpp.so"]);
Debugger.CacheByThreadId = new Map();
Debugger.getModule = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
if (Debugger.CacheByThreadId.has(thread_id)) {
return Debugger.CacheByThreadId.get(thread_id);
}
else {
const ret = new ModuleMap((md) => Debugger.moduleFilters.has(md.name));
Debugger.CacheByThreadId.set(thread_id, ret);
return ret;
}
};
Debugger.getModuleMapByAddress = (mPtr) => {
const dbgInfo = DebugSymbol.fromAddress(mPtr);
if (dbgInfo == null || dbgInfo.moduleName == null) {
(0, logger_1.loge)(`dbgInfo is null`);
return _a.getModule();
}
Debugger.addModuleName(dbgInfo.moduleName);
return Debugger.getModule();
};
Debugger.addModuleName = (name) => {
Debugger.moduleFilters.add(name);
};
Reflect.set(globalThis, "Debugger", Debugger);
},{"./breakpoint/BPStatus":1,"./logger":9}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./instruction");
},{"./instruction":8}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionParser = void 0;
const BPStatus_1 = require("../breakpoint/BPStatus");
const logger_1 = require("../logger");
class InstructionParser {
constructor() { }
static InsParser(address) {
try {
const ins = Instruction.parse(address);
if (ins.mnemonic == "bl") {
const opstr = ins.opStr;
const op = opstr.split("#")[1];
const sym = DebugSymbol.fromAddress(ptr(op));
return sym.toString();
}
}
catch (error) {
return '';
}
return '';
}
}
exports.InstructionParser = InstructionParser;
InstructionParser.printCurrentInstruction = (pc = BPStatus_1.BPStatus.currentPC.get(BPStatus_1.BPStatus.currentThreadId), extraIns = 8, ret = false) => {
if (!ret)
newLine();
if (typeof pc === 'number')
pc = ptr(pc);
let count = extraIns;
let instruction_start = pc.sub(4 * ((extraIns / 2)));
const arrayRet = [];
let offset = 0;
do {
try {
const ins = Instruction.parse(instruction_start.add(offset * 4));
instruction_start = ins.address;
break;
}
catch (error) {
++offset;
}
} while (true);
var ins = Instruction.parse(instruction_start);
do {
let ins_str = `${DebugSymbol.fromAddress(ins.address)} | ${ins.toString()}`;
const ins_op = InstructionParser.InsParser(ins.address);
if (ins_op.length != 0)
ins_str += `\t| ${ins_op}`;
ins.address.equals(pc) ? (0, logger_1.loge)(`-> ${ins_str}`) : (0, logger_1.logz)(`   ${ins_str}`);
if (ret)
arrayRet.push({ address: ins.address, dis: ins_str });
try {
ins = Instruction.parse(ins.next);
}
catch (error) {
(0, logger_1.logl)(`   ${DebugSymbol.fromAddress(ins.next)} | [ ${getErrorDisc(ins.next)} ]`);
ins = Instruction.parse(ins.address.add(0x4));
}
} while (--count > 0);
if (!ret)
newLine();
if (ret)
return arrayRet;
function getErrorDisc(mPtr) {
const bt_array = mPtr.readByteArray(4);
const bt_array_str = Array.from(new Uint8Array(bt_array)).map((item) => item.toString(16).padStart(2, '0')).join(' ');
return bt_array_str;
}
};
Reflect.set(globalThis, "InstructionParser", InstructionParser);
Reflect.set(globalThis, "ins", InstructionParser);
Reflect.set(globalThis, "dism", (mPtr, extraIns) => { InstructionParser.printCurrentInstruction(mPtr, extraIns); }); Reflect.set(globalThis, "pi", (mPtr, extraIns) => { InstructionParser.printCurrentInstruction(mPtr, extraIns); }); },{"../breakpoint/BPStatus":1,"../logger":9}],9:[function(require,module,exports){
(function (__filename){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logcat = exports.log = exports.logz = exports.logh = exports.logd = exports.logn = exports.logl = exports.logo = exports.logg = exports.loge = exports.logf = exports.logm = exports.logt = exports.logw = exports.LogColor = exports.android_LogPriority = exports.LogRedirect = void 0;
const utils_1 = require("./utils");
var LogRedirect;
(function (LogRedirect) {
LogRedirect[LogRedirect["LOGCAT"] = 0] = "LOGCAT";
LogRedirect[LogRedirect["CMD"] = 1] = "CMD";
LogRedirect[LogRedirect["BOTH"] = 2] = "BOTH";
LogRedirect[LogRedirect["TOAST"] = 3] = "TOAST";
LogRedirect[LogRedirect["NOP"] = 4] = "NOP";
})(LogRedirect = exports.LogRedirect || (exports.LogRedirect = {}));
var android_LogPriority;
(function (android_LogPriority) {
android_LogPriority[android_LogPriority["ANDROID_LOG_UNKNOWN"] = 0] = "ANDROID_LOG_UNKNOWN";
android_LogPriority[android_LogPriority["ANDROID_LOG_DEFAULT"] = 1] = "ANDROID_LOG_DEFAULT";
android_LogPriority[android_LogPriority["ANDROID_LOG_VERBOSE"] = 2] = "ANDROID_LOG_VERBOSE";
android_LogPriority[android_LogPriority["ANDROID_LOG_DEBUG"] = 3] = "ANDROID_LOG_DEBUG";
android_LogPriority[android_LogPriority["ANDROID_LOG_INFO"] = 4] = "ANDROID_LOG_INFO";
android_LogPriority[android_LogPriority["ANDROID_LOG_WARN"] = 5] = "ANDROID_LOG_WARN";
android_LogPriority[android_LogPriority["ANDROID_LOG_ERROR"] = 6] = "ANDROID_LOG_ERROR";
android_LogPriority[android_LogPriority["ANDROID_LOG_FATAL"] = 7] = "ANDROID_LOG_FATAL";
android_LogPriority[android_LogPriority["ANDROID_LOG_SILENT"] = 8] = "ANDROID_LOG_SILENT"; 
})(android_LogPriority = exports.android_LogPriority || (exports.android_LogPriority = {}));
var LogColor;
(function (LogColor) {
LogColor[LogColor["TRACE"] = 0] = "TRACE";
LogColor[LogColor["MARK"] = 1] = "MARK";
LogColor[LogColor["FATAL"] = 2] = "FATAL";
LogColor[LogColor["WHITE"] = 0] = "WHITE";
LogColor[LogColor["RED"] = 1] = "RED";
LogColor[LogColor["YELLOW"] = 3] = "YELLOW";
LogColor[LogColor["C31"] = 31] = "C31";
LogColor[LogColor["C32"] = 32] = "C32";
LogColor[LogColor["C33"] = 33] = "C33";
LogColor[LogColor["C34"] = 34] = "C34";
LogColor[LogColor["C35"] = 35] = "C35";
LogColor[LogColor["C36"] = 36] = "C36";
LogColor[LogColor["C41"] = 41] = "C41";
LogColor[LogColor["C42"] = 42] = "C42";
LogColor[LogColor["C43"] = 43] = "C43";
LogColor[LogColor["C44"] = 44] = "C44";
LogColor[LogColor["C45"] = 45] = "C45";
LogColor[LogColor["C46"] = 46] = "C46";
LogColor[LogColor["C90"] = 90] = "C90";
LogColor[LogColor["C91"] = 91] = "C91";
LogColor[LogColor["C92"] = 92] = "C92";
LogColor[LogColor["C93"] = 93] = "C93";
LogColor[LogColor["C94"] = 94] = "C94";
LogColor[LogColor["C95"] = 95] = "C95";
LogColor[LogColor["C96"] = 96] = "C96";
LogColor[LogColor["C97"] = 97] = "C97";
LogColor[LogColor["C100"] = 100] = "C100";
LogColor[LogColor["C101"] = 101] = "C101";
LogColor[LogColor["C102"] = 102] = "C102";
LogColor[LogColor["C103"] = 103] = "C103";
LogColor[LogColor["C104"] = 104] = "C104";
LogColor[LogColor["C105"] = 105] = "C105";
LogColor[LogColor["C106"] = 106] = "C106";
LogColor[LogColor["C107"] = 107] = "C107";
})(LogColor = exports.LogColor || (exports.LogColor = {}));
const logw = (message, fileName = __filename) => log(message, fileName, LogColor.YELLOW);
exports.logw = logw;
const logt = (message, fileName = __filename) => log(message, fileName, LogColor.TRACE);
exports.logt = logt;
const logm = (message, fileName = __filename) => log(message, fileName, LogColor.MARK);
exports.logm = logm;
const logf = (message, fileName = __filename) => log(message, fileName, LogColor.FATAL);
exports.logf = logf;
const loge = (message, fileName = __filename) => log(message, fileName, LogColor.RED);
exports.loge = loge;
const logg = (message, fileName = __filename) => log(message, fileName, LogColor.C32);
exports.logg = logg;
const logo = (message, fileName = __filename) => log(message, fileName, LogColor.C33);
exports.logo = logo;
const logl = (message, fileName = __filename) => log(message, fileName, LogColor.C34);
exports.logl = logl;
const logn = (message, fileName = __filename) => log(message, fileName, LogColor.C35);
exports.logn = logn;
const logd = (message, fileName = __filename) => log(message, fileName, LogColor.C36);
exports.logd = logd;
const logh = (message, fileName = __filename) => log(message, fileName, LogColor.C96);
exports.logh = logh;
const logz = (message, fileName = __filename) => log(message, fileName, LogColor.C90);
exports.logz = logz;
const LOG_TO = LogRedirect.CMD;
const LOG_COUNT_MAX = 20;
function log(message, _filename = '', type = LogColor.WHITE, filter = false) {
if (LOG_TO == LogRedirect.NOP)
return;
if (filter && !(0, utils_1.filterDuplicateOBJ)(message, LOG_COUNT_MAX))
return;
switch (LOG_TO) {
case LogRedirect.CMD:
switch (type) {
case LogColor.WHITE:
console.debug(message);
break;
case LogColor.RED:
console.error(message);
break;
case LogColor.YELLOW:
console.warn(message);
break;
case LogColor.TRACE:
console.trace(message);
break;
case LogColor.MARK:
console.debug(message);
break;
case LogColor.FATAL:
console.error(message);
break;
default:
console.log(`\x1b[${type}m${message}\x1b[0m`);
break;
}
break;
case LogRedirect.LOGCAT:
(0, exports.logcat)(message);
break;
case LogRedirect.TOAST:
showToast(message);
break;
default:
console.log(`\x1b[${type}m${message}\x1b[0m`);
break;
}
}
exports.log = log;
const logcat = (msg) => {
Java.perform(() => {
const jstr = Java.use("java.lang.String");
Java.use("android.util.Log").d(jstr.$new("ZZZ"), jstr.$new(msg));
});
};
exports.logcat = logcat;
const showToast = (message) => {
Java.perform(() => {
let Toast = Java.use("android.widget.Toast");
let context = Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
Java.scheduleOnMainThread(() => Toast.makeText(context, Java.use("java.lang.String").$new(message), 1).show());
});
};
}).call(this)}).call(this,"/agent/logger.ts")
},{"./utils":20}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./logger");
require("./utils");
require("./debugger");
require("./signal");
require("./breakpoint/include");
require("./instructions/include");
require("./cmoudles/include");
require("./parser/include");
},{"./breakpoint/include":4,"./cmoudles/include":5,"./debugger":6,"./instructions/include":7,"./logger":9,"./parser/include":18,"./signal":19,"./utils":20}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtParser = void 0;
const ParserBase_1 = require("./ParserBase");
class ArtParser extends ParserBase_1.ParserBase {
from(handle) {
this.handle = handle;
}
asArtMethod() {
return this.handle;
}
asString() {
return '';
}
}
exports.ArtParser = ArtParser;
Reflect.set(globalThis, "ArtParser", ArtParser);
},{"./ParserBase":14}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicParser = void 0;
const ParserBase_1 = require("./ParserBase");
class DynamicParser extends ParserBase_1.ParserBase {
constructor() { super(); }
}
exports.DynamicParser = DynamicParser;
Reflect.set(globalThis, "DynamicParser", DynamicParser);
},{"./ParserBase":14}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Il2cppParser = void 0;
const ParserBase_1 = require("./ParserBase");
class Il2cppParser extends ParserBase_1.ParserBase {
}
exports.Il2cppParser = Il2cppParser;
Reflect.set(globalThis, "Il2cppParser", Il2cppParser);
},{"./ParserBase":14}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserBase = void 0;
class ParserBase {
constructor() {
this.handle = NULL;
}
from(handle) {
this.handle = handle;
}
toString() {
return this.constructor.name;
}
}
exports.ParserBase = ParserBase;
},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StdString = exports.StringParser = void 0;
const ParserBase_1 = require("./ParserBase");
class StringParser extends ParserBase_1.ParserBase {
asU16String() {
return this.handle.readUtf16String();
}
asU8String() {
return this.handle.readUtf8String();
}
asStdSting() {
return new StdString(this.handle).toString();
}
asCString() {
return this.handle.readCString();
}
asUnityString() {
return '';
}
}
exports.StringParser = StringParser;
Reflect.set(globalThis, "StringParser", StringParser);
class StdString {
constructor(mPtr = Memory.alloc(StdString.STD_STRING_SIZE)) {
this.handle = mPtr;
}
dispose() {
const [data, isTiny] = this._getData();
if (!isTiny)
Java.api.$delete(data);
}
static fromPointer(ptrs) {
return StdString.fromPointers([ptrs, ptrs.add(Process.pointerSize), ptrs.add(Process.pointerSize * 2)]);
}
static fromPointers(ptrs) {
if (ptrs.length != 3)
return '';
return StdString.fromPointersRetInstance(ptrs).disposeToString();
}
static from(pointer) {
try {
return pointer.add(Process.pointerSize * 2).readCString();
}
catch (error) {
return 'ERROR';
}
}
static fromPointersRetInstance(ptrs) {
if (ptrs.length != 3)
return new StdString();
const stdString = new StdString();
stdString.handle.writePointer(ptrs[0]);
stdString.handle.add(Process.pointerSize).writePointer(ptrs[1]);
stdString.handle.add(2 * Process.pointerSize).writePointer(ptrs[2]);
return stdString;
}
disposeToString() {
const result = this.toString();
this.dispose();
return result;
}
toString() {
try {
const data = this._getData()[0];
return data.readUtf8String();
}
catch (error) {
return StdString.from(this.handle.add(Process.pointerSize * 2));
}
}
_getData() {
const str = this.handle;
const isTiny = (str.readU8() & 1) === 0;
const data = isTiny ? str.add(1) : str.add(2 * Process.pointerSize).readPointer();
return [data, isTiny];
}
}
exports.StdString = StdString;
StdString.STD_STRING_SIZE = 3 * Process.pointerSize;
Reflect.set(globalThis, 'StdString', StdString);
},{"./ParserBase":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructParser = void 0;
const ParserBase_1 = require("./ParserBase");
class StructParser extends ParserBase_1.ParserBase {
constructor() { super(); }
asCStruct(c_code) {
const cmd = new CModule(c_code);
return '';
}
}
exports.StructParser = StructParser;
Reflect.set(globalThis, "StructParser", StructParser);
},{"./ParserBase":14}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymbolParser = void 0;
const ParserBase_1 = require("./ParserBase");
class SymbolParser extends ParserBase_1.ParserBase {
constructor() { super(); }
asDebugSymbol() {
return DebugSymbol.fromAddress(this.handle);
}
asMapString(map) {
return map.get(this.handle) || '';
}
}
exports.SymbolParser = SymbolParser;
Reflect.set(globalThis, "SymbolParser", SymbolParser);
},{"./ParserBase":14}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./ParserBase");
require("./ArtParser");
require("./DynamicParser");
require("./SymbolParser");
require("./StructParser");
require("./Il2cppParser");
require("./StringParser");
},{"./ArtParser":11,"./DynamicParser":12,"./Il2cppParser":13,"./ParserBase":14,"./StringParser":15,"./StructParser":16,"./SymbolParser":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signal = void 0;
const BPStatus_1 = require("./breakpoint/BPStatus");
var Signal;
(function (Signal) {
var semlock_global = Memory.alloc(0x10);
var semlock_thread_ids = new Map();
const func_sem_init = new NativeFunction(Module.findExportByName("libc.so", "sem_init"), "int", ["pointer", "int", "uint"]);
const func_sem_destroy = new NativeFunction(Module.findExportByName("libc.so", "sem_destroy"), "int", ["pointer"]);
const func_sem_wait = new NativeFunction(Module.findExportByName("libc.so", "sem_wait"), "int", ["pointer"]);
const func_sem_post = new NativeFunction(Module.findExportByName("libc.so", "sem_post"), "int", ["pointer"]);
Signal.sem_post = () => {
func_sem_post(semlock_global);
func_sem_destroy(semlock_global);
};
Signal.sem_wait = () => {
func_sem_init(semlock_global, 0, 0);
func_sem_wait(semlock_global);
};
Signal.sem_post_thread_id = (thread_id) => {
if (semlock_thread_ids.has(thread_id)) {
func_sem_post(semlock_thread_ids.get(thread_id));
func_sem_destroy(semlock_thread_ids.get(thread_id));
}
};
Signal.sem_wait_threadid = (thread_id) => {
if (!semlock_thread_ids.has(thread_id)) {
var mem = Memory.alloc(0x10);
semlock_thread_ids.set(thread_id, mem);
func_sem_init(semlock_thread_ids.get(thread_id), 0, 0);
}
func_sem_wait(semlock_thread_ids.get(thread_id));
};
Signal.continue_instruction = (thread_id = BPStatus_1.BPStatus.currentThreadId) => {
Signal.sem_post_thread_id(thread_id);
newLine();
};
})(Signal = exports.Signal || (exports.Signal = {}));
Reflect.set(globalThis, "Signal", Signal);
Reflect.set(globalThis, "step", Signal.continue_instruction);
Reflect.set(globalThis, "si", Signal.continue_instruction);
},{"./breakpoint/BPStatus":1}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packApiResove = exports.padding = exports.demangleName = exports.getThreadName = exports.filterDuplicateOBJ = void 0;
const logger_1 = require("./logger");
globalThis.clear = () => console.log('\x1Bc');
globalThis.newLine = (lines = 1) => {
for (let i = 0; i < lines; i++)
console.log('\n');
};
globalThis.d = () => { Interceptor.detachAll(); };
var nameCountMap = new Map();
const filterDuplicateOBJ = (objstr, maxCount = 10) => {
let count = nameCountMap.get(objstr.toString());
if (count == undefined)
count = 0;
if (count < maxCount) {
nameCountMap.set(objstr.toString(), count + 1);
return true;
}
return false;
};
exports.filterDuplicateOBJ = filterDuplicateOBJ;
function getThreadName(tid) {
let threadName = "unknown";
try {
var file = new File("/proc/self/task/" + tid + "/comm", "r");
threadName = file.readLine().toString().trimEnd();
file.close();
}
catch (e) {
throw e;
}
return threadName;
}
exports.getThreadName = getThreadName;
function demangleName(expName) {
let demangleAddress = Module.findExportByName("libc++.so", '__cxa_demangle');
if (demangleAddress == null)
demangleAddress = Module.findExportByName("libunwindstack.so", '__cxa_demangle');
if (demangleAddress == null)
demangleAddress = Module.findExportByName("libbacktrace.so", '__cxa_demangle');
if (demangleAddress == null)
demangleAddress = Module.findExportByName(null, '__cxa_demangle');
if (demangleAddress == null)
throw Error("can not find export function -> __cxa_demangle");
let demangle = new NativeFunction(demangleAddress, 'pointer', ['pointer', 'pointer', 'pointer', 'pointer']);
let mangledName = Memory.allocUtf8String(expName);
let outputBuffer = NULL;
let length = NULL;
let status = Memory.alloc(Process.pageSize);
let result = demangle(mangledName, outputBuffer, length, status);
if (status.readInt() === 0) {
let resultStr = result.readUtf8String();
return (resultStr == null || resultStr == expName) ? "" : resultStr;
}
else
return "";
}
exports.demangleName = demangleName;
const padding = (str, len = 18, pad = ' ', end = true) => {
if (str instanceof NativePointer)
str = str.toString();
if (str.length >= len)
return str;
if (end)
return str.padEnd(len, pad);
else
return str.padStart(len, pad);
};
exports.padding = padding;
const packApiResove = (patter = "exports:*!*Unwind*") => {
let index = 0;
new ApiResolver("module").enumerateMatches(patter).forEach((exp) => {
(0, logger_1.logd)(`${(0, exports.padding)(`[${++index}]`, 5)}${exp.name} ${exp.address}`);
(0, logger_1.logz)(`\t${demangleName(exp.name.split("!")[1])}`);
});
};
exports.packApiResove = packApiResove;
globalThis.clear = clear;
globalThis.newLine = newLine;
globalThis.filterDuplicateOBJ = exports.filterDuplicateOBJ;
globalThis.getThreadName = getThreadName;
globalThis.demangleName = demangleName;
globalThis.padding = exports.padding;
globalThis.PD = exports.padding;
globalThis.d = d;
},{"./logger":9}]},{},[10])
