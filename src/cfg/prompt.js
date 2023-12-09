const generate_prompt = ($query, word1, word2, word3) => {
  return `Responder a esto sin nombrar las mismas palabras: "${$query}" con menos de 30 
   palabras usando sinónimos de la palabras ${word1}, ${word2}, y ${word3} con estilo 
   críptico dirigido hacia una persona a modo de consejo y predicción. No usar palabras 
   como misterio o enigma. Ser conciso y preciso`;
};

module.exports = generate_prompt;
