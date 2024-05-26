const cards = {
  octahedron: [
    ["seek", "find"], // 0: El Bosque Profundo
    ["look", "observe", "aware"], // 1: El Espejo Negro
    ["wait", "patience"], // 2: La Niebla Espesa
    ["materialize", "make", "create"], // 3: El Bastón Místico
    ["dream", "intention", "think"], // 4: El Portal Abierto
    ["avoid", "run", "rebel", "secret"], // 5: La Torre Hermética
    ["accept", "specify", "deal", "unity"], // 6: La Llama Eterna
    ["cut", "destroy", "finish", "let go", "cycle"], // 7: La Antorcha Boreal
    ["fight", "serve", "honor", "try"], // 8: La Espada Luminosa
    ["care", "protect"], // 9: El Tesoro Olvidado
  ],
  icosahedron: [
    ["yourself", "introspection"], // 0: La Sombra Cenicienta
    ["justice", "balance"], // 1: La Rosa Carmesí
    ["surprise", "revelation"], // 2: El Libro Prohibido
    ["destiny", "love", "wisdom"], // 3: El Sendero Revelado
    ["void", "emptiness", "rest"], // 4: La Cueva Oculta
    ["transformation", "release", "revive"], // 5: La Poción Iridiscente
    ["treason", "sacrifice"], // 6: La Daga Venenosa
    ["grow", "heal", "healing", "growing", "help"], // 7: La Luna Roja
    ["love", "kindness", "humanity"], // 8: La Lámpara Infalible
    ["abundance", "success", "opportunity", "joy"], // 9: La Llave Dorada
  ],
  dodecahedron: [
    ["force", "body", "physical"], // 0: La Bestia Ardiente
    ["rectitude", "courage", "benevolence", "politeness", "honesty", "sincerity", "loyalty"], // 1: El Secreto Latente
    ["focus", "determination", "mind"], // 2: El Poncho Errante
    ["confidence", "hope", "conviction"], // 3: La Estrella Sideral
    [""], // 4: El Vacío Ancestral
    ["awareness", "consciousness"], // 5: La Máscara Partida
    ["intuition", "vision"], // 6: Las Ruinas Sagradas
    ["time"], // 7: La Campana Silente
    ["money", "material", "asset"], // 8: La Dimensión Oscura
    ["energy", "vitality"], // 9: La Flor Nocturna
  ],
};

const generate_prompt = ($query, word1, word2, word3, lang) => {
  const language = lang != "es" ? ", responder en inlgés" : "";
  return `Responder a esto sin nombrar las mismas palabras: "${$query}" con menos de 30 palabras usando sinónimos de la palabras ${word1}, ${word2}, y ${word3} con estilo críptico dirigido hacia una persona a modo de consejo y predicción. No usar palabras como misterio o enigma. Ser conciso y preciso${language}`;
};

module.exports = {
  cards: cards,
  generate_prompt: generate_prompt,
};
