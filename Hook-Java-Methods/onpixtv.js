Java.perform(function() {
console.log("[*] Hooking TextView.setText()...");
var TextView = Java.use("android.widget.TextView");
TextView.setText.overload('java.lang.CharSequence').implementation = function(text) {
try {
var id = this.getId();
var name = this.getResources().getResourceEntryName(id); 
if (name === "tv_trial_days") {
console.log("[*] setText chamado para TextView com nome 'tv_trial_days'");
var processedText = text.toString().replace(/Data de expiraÃ§Ã£o:\n/, '').trim();
console.log("    Data extraÃ­da: " + processedText);
}
} catch (err) {
console.error("[!] Erro ao verificar ID: " + err);
}
return this.setText(text);
};
console.log("[*] Hook de TextView.setText() completo.");
});
