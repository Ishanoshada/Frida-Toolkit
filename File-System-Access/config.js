/**************************************************************************************************
*
* This file defines various config parameters, used later within the other scripts.
*
* In all cases, you'll want to set CERT_PEM and likely PROXY_HOST and PROXY_PORT.
*
* Source available at https: * SPDX-License-Identifier: AGPL-3.0-or-later
* SPDX-File
*
*************************************************************************************************/
const CERT_PEM = `-----BEGIN CERTIFICATE-----
[!! Put your CA certificate data here, in PEM format !!]
-----END CERTIFICATE-----`;
const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 8000;
const DEBUG_MODE = false;
const IGNORED_NON_HTTP_PORTS = [];
const BLOCK_HTTP3 = true;
const PROXY_SUPPORTS_SOCKS5 = false;
if (DEBUG_MODE) {
console.log('\n*** Starting scripts ***');
if (globalThis.Java?.available) {
Java.perform(() => {
setTimeout(() => console.log('*** Scripts completed ***\n'), 5);
});
} else {
setTimeout(() => console.log('*** Scripts completed ***\n'), 5);
}
} else {
console.log(''); }
if (CERT_PEM.match(/\[!!.* CA certificate data .* !!\]/)) {
throw new Error('No certificate was provided' +
'\n\n' +
'You need to set CERT_PEM in the Frida config script ' +
'to the contents of your CA certificate.'
);
}
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const BASE64_LOOKUP = new Uint8Array(123);
for (let i = 0; i < BASE64_CHARS.length; i++) {
BASE64_LOOKUP[BASE64_CHARS.charCodeAt(i)] = i;
}
/**
* Take a base64 string, and return the raw bytes
* @param {string} input
* @returns Uint8Array
*/
function decodeBase64(input) {
let outputLength = Math.floor((input.length * 3) / 4);
if (input[input.length - 1] === '=') outputLength--;
if (input[input.length - 2] === '=') outputLength--;
const output = new Uint8Array(outputLength);
let outputPos = 0;
for (let i = 0; i < input.length; i += 4) {
const a = BASE64_LOOKUP[input.charCodeAt(i)];
const b = BASE64_LOOKUP[input.charCodeAt(i + 1)];
const c = BASE64_LOOKUP[input.charCodeAt(i + 2)];
const d = BASE64_LOOKUP[input.charCodeAt(i + 3)];
const chunk = (a << 18) | (b << 12) | (c << 6) | d;
output[outputPos++] = (chunk >> 16) & 0xff;
if (input.charCodeAt(i + 2) !== 61) output[outputPos++] = (chunk >> 8) & 0xff;
if (input.charCodeAt(i + 3) !== 61) output[outputPos++] = chunk & 0xff;
}
return output;
}
/**
* Take a single-certificate PEM string, and return the raw DER bytes
* @param {string} input
* @returns Uint8Array
*/
function pemToDer(input) {
const pemLines = input.split('\n');
if (
pemLines[0] !== '-----BEGIN CERTIFICATE-----' ||
pemLines[pemLines.length- 1] !== '-----END CERTIFICATE-----'
) {
throw new Error(
'Your certificate should be in PEM format, starting & ending ' +
'with a BEGIN CERTIFICATE & END CERTIFICATE header/footer'
);
}
const base64Data = pemLines.slice(1, -1).map(l => l.trim()).join('');
if ([...base64Data].some(c => !BASE64_CHARS.includes(c))) {
throw new Error(
'Your certificate should be in PEM format, containing only ' +
'base64 data between a BEGIN & END CERTIFICATE header/footer'
);
}
return decodeBase64(base64Data);
}
const CERT_DER = pemToDer(CERT_PEM);
function waitForModule(moduleName, callback) {
if (Array.isArray(moduleName)) {
moduleName.forEach(module => waitForModule(module, callback));
}
try {
const module = Process.getModuleByName(moduleName)
module.ensureInitialized();
callback(module);
return;
} catch (e) {
try {
const module = Module.load(moduleName);
callback(module);
return;
} catch (e) {}
}
MODULE_LOAD_CALLBACKS[moduleName] = callback;
}
const getModuleName = (nameOrPath) => {
const endOfPath = nameOrPath.lastIndexOf('/');
return nameOrPath.slice(endOfPath + 1);
};
const MODULE_LOAD_CALLBACKS = {};
Process.attachModuleObserver({
onAdded(module) {
const moduleName = getModuleName(module.name || module.path || '');
const callback = MODULE_LOAD_CALLBACKS[moduleName];
if (!callback) return;
delete MODULE_LOAD_CALLBACKS[moduleName];
callback(module);
}
});
