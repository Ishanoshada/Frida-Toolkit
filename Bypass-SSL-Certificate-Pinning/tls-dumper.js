console.log("TLS DUMPER - FROM ARCTIC")
const tlsStuff = {
version: null,
ciphers: [],
curves: [],
extensions: [],
sigAlgos: [],
alpnList: [],
supportedVersions: []
};
let alreadyDumped = false; 
function parseHello(packet) {
try {
let pos = 0;
pos += 5; 
const handshakeLen = (packet[pos + 1] << 16) | (packet[pos + 2] << 8) | packet[pos + 3];
pos += 4;
tlsStuff.version = `0x${packet[pos].toString(16).padStart(2, '0')}${packet[pos + 1].toString(16).padStart(2, '0')}`;
pos += 2;
pos += 32;         const sessIdLen = packet[pos];
pos += 1 + sessIdLen; 
const cipherLen = (packet[pos] << 8) | packet[pos + 1];
pos += 2;
for (let idx = 0; idx < cipherLen; idx += 2) {
const cipher = (packet[pos + idx] << 8) | packet[pos + idx + 1];
tlsStuff.ciphers.push(`0x${cipher.toString(16).padStart(4, '0')}`);
}
pos += cipherLen;
const compLen = packet[pos];
pos += 1 + compLen; 
const extLen = (packet[pos] << 8) | packet[pos + 1];
pos += 2;
const extEnd = pos + extLen;
while (pos + 4 <= extEnd) {
const extType = (packet[pos] << 8) | packet[pos + 1];
const extDataLen = (packet[pos + 2] << 8) | packet[pos + 3];
const extData = packet.slice(pos + 4, pos + 4 + extDataLen);
tlsStuff.extensions.push(extType);
if (extType === 0x000a) {                 const groupsLen = (extData[0] << 8) | extData[1];
for (let k = 2; k < groupsLen + 2; k += 2) {
const grp = (extData[k] << 8) | extData[k + 1];
tlsStuff.curves.push(`0x${grp.toString(16).padStart(4, '0')}`);
}
} else if (extType === 0x000d) {                 const sigLen = (extData[0] << 8) | extData[1];
for (let k = 2; k < sigLen + 2; k += 2) {
const sig = (extData[k] << 8) | extData[k + 1];
tlsStuff.sigAlgos.push(`0x${sig.toString(16).padStart(4, '0')}`);
}
} else if (extType === 0x002b) {                 const verLen = extData[0];
for (let k = 1; k < verLen + 1; k += 2) {
const ver = (extData[k] << 8) | extData[k + 1];
tlsStuff.supportedVersions.push(`0x${ver.toString(16).padStart(4, '0')}`);
}
} else if (extType === 0x0010) {                 let offset = 0;
while (offset < extDataLen) {
const size = extData[offset];
const proto = String.fromCharCode(...extData.slice(offset + 1, offset + 1 + size));
tlsStuff.alpnList.push(proto);
offset += 1 + size;
}
}
pos += 4 + extDataLen;
}
console.log("[*] CONFIGGGGGGGGG:\n" + JSON.stringify(tlsStuff, null, 2));
alreadyDumped = true;
} catch (err) {
console.log("[-] Whoops, error parsing ClientHello: " + err);
}
}
function sniffClientHello(buffer) {
if (alreadyDumped) return false;
if (buffer[0] === 0x16 && buffer[5] === 0x01) {         parseHello(buffer);
return true;
}
return false;
}
function hookFunction(lib, funcName, onEnterCallback) {
const funcAddr = Module.findExportByName(lib, funcName);
if (funcAddr) {
Interceptor.attach(funcAddr, {
onEnter: onEnterCallback
});
console.log(`[+] Hooked ${funcName} in ${lib} :DDDDDD`);
} else {
console.log(`[-] Could not find ${funcName} in ${lib} â€” uhhh.`);
}
}
hookFunction("libssl.so", "SSL_write", function(args) {
try {
const length = args[2].toInt32();
if (length > 0 && length < 8192) {
const bytesArr = Memory.readByteArray(args[1], length);
const u8arr = new Uint8Array(bytesArr);
if (sniffClientHello(u8arr)) {
console.log("[*] ClientHello sniffed in SSL_write");
}
}
} catch {}
});
hookFunction("libssl.so", "BIO_write", function(args) {
try {
const length = args[2].toInt32();
if (length > 0 && length < 8192) {
const bytesArr = Memory.readByteArray(args[1], length);
const u8arr = new Uint8Array(bytesArr);
if (sniffClientHello(u8arr)) {
console.log("[*] ClientHello sniffed in BIO_write");
}
}
} catch {}
});
