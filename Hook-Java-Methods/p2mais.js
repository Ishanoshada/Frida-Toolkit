setTimeout(() => {
Java.perform(() => {
Java.use("br.com.kerhkhd.Engine.Query")["sync_filmes$lambda$21"].implementation = function(q, u, p, c, j) {
console.log("\n=== DETECTEI CHAMADA DO MÃ‰TODO ===");
console.log("ðŸ”‘ Username:", u);
console.log("ðŸ”’ Password:", p); 
console.log("ðŸ“ž Callback:", c ? c.toString() : "null");
console.log("ðŸ” Query Object:", q ? q.getClass().getName() : "null");
return this["sync_filmes$lambda$21"](q, u, p, c, j);         };
Java.use("br.com.kerhkhd.Engine.Query")["sync_canais_categoria$lambda$4$lambda$2"].implementation = function(query, callback, jsonString) {
console.log("\n=== CANAIS/CATEGORIA DETECTADO ===");
console.log("ðŸ“¡ JSON Recebido:", jsonString);
console.log("ðŸ”„ Callback:", callback ? callback.toString() : "null");
console.log("ðŸ” Query Object:", query ? query.getClass().getName() : "null");
return this["sync_canais_categoria$lambda$4$lambda$2"](query, callback, jsonString);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_filmes_categoria$lambda$7"].implementation = function(query, callback, jsonString) {
console.log("\n=== FILMES/CATEGORIA HOOK ===");
console.log("ðŸŽ¬ JSON Recebido:", jsonString);
console.log("ðŸ“ž Callback:", callback ? callback.toString() : "null");
if (query) {
console.log("ðŸ” Query Object:");
console.log("  - ID LanÃ§amento:", query.id_lancamento.value || "null");
console.log("  - FilmesX:", query.filmesx ? "Presente" : "Ausente");
}
try {
const jsonObj = JSON.parse(jsonString);
console.log("ðŸ“Š Categorias encontradas:", Object.keys(jsonObj).length);
} catch (e) {
console.log("âš ï¸ NÃ£o foi possÃ­vel parsear o JSON");
}
return this["sync_filmes_categoria$lambda$7"](query, callback, jsonString);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_series$lambda$24"].implementation = function(q, cb, json) {
console.log("\n=== SERIES (lambda24) ===");
console.log("ðŸ“º Query:", q);
console.log("ðŸ“‹ JSON:", json.substring(0, 100) + (json.length > 100 ? "..." : ""));
console.log("ðŸ“ž Callback:", cb);
return this["sync_series$lambda$24"](q, cb, json);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_series_categoria$lambda$13"].implementation = function(q, cb, json) {
console.log("\n=== SERIES/CATEGORIA (lambda13) ===");
console.log("ðŸ·ï¸ Categoria:", q.id_lancamento.value);
console.log("ðŸ“‹ JSON Size:", json.length, "bytes");
return this["sync_series_categoria$lambda$13"](q, cb, json);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_canais$lambda$19"].implementation = function(q, user, pass, cb, json) {
console.log("\n=== CANAIS (lambda19) ===");
console.log("ðŸ”‘ User:", user);
console.log("ðŸ”’ Pass:", pass);
console.log("ðŸ“» JSON Keys:", Object.keys(JSON.parse(json)).length);
return this["sync_canais$lambda$19"](q, user, pass, cb, json);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_canais_categoria$lambda$4$lambda$2"].implementation = function(q, cb, json) {
console.log("\n=== CANAIS/CATEGORIA (lambda4-lambda2) ===");
console.log("ðŸ“¡ Categoria ID:", q.id_lancamento.value);
console.log("ðŸ“‹ JSON Sample:", json.split(',')[0]);
return this["sync_canais_categoria$lambda$4$lambda$2"](q, cb, json);
};
Java.use("br.com.kerhkhd.Engine.Query")["sync_desmembramento$lambda$10"].implementation = function(q, cb, json) {
console.log("\n=== DESMEMBRAMENTO (lambda10) ===");
console.log("ðŸ§© Query Fields:", Object.keys(q.getClass().getDeclaredFields()));
console.log("ðŸ“¦ JSON Data:", json.length > 200 ? "[...]" : json);
return this["sync_desmembramento$lambda$10"](q, cb, json);
};
console.log("âœ… Hook instalado com sucesso!");
});
}, 500);
