function loadCodeshareScript(scriptName) {
return new Promise((resolve, reject) => {
try {
Java.perform(() => {                  const codeshare = require('frida-codeshare');
codeshare.load(scriptName)
.then(() => {
console.log(`[+] Loaded codeshare script: ${scriptName}`);
resolve();
})
.catch(error => {
console.log(`[!] Error loading ${scriptName}: ${error.message}`);
reject(error);
});
});
} catch(error) {
reject(error);
}
});
}
const codeshareScripts = [
'sdcampbell/script1',
'sdcampbell/script2',
'sdcampbell/script3'
];
async function loadAllScripts() {
for (const script of codeshareScripts) {
try {
await loadCodeshareScript(script);
} catch(error) {
console.log(`[!] Failed to load ${script}: ${error.message}`);
}
}
console.log('[+] Finished loading all codeshare scripts');
}
loadAllScripts();
