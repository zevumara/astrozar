const generate_prompt = ($query, word1, word2, word3) => {
  return `Responder a esto: "${$query}" con 30 palabras usando sinónimos de las
  palabras ${word1}, ${word2}, y ${word3} con estilo críptico dirigido hacia una
  persona a modo de consejo`;
};

module.exports = generate_prompt;
