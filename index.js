const Cards = require("./src/cfg/cards");
const Prompt = require("./src/cfg/prompt");
const API_KEY = require("./src/cfg/api_key");

const mongoose = require("mongoose");
const express = require("express");
const { body, validationResult } = require("express-validator");
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/astrozar");
mongoose.connection.once("connected", () => console.log("Connected to MongoDB"));

const Spread = mongoose.model("Spread", {
  query: String,
  answer: String,
  circle: Number,
  triangle: Number,
  square: Number,
});

app.get("/s/:id", async (req, res) => {
  try {
    const data = await Spread.findById(req.params.id);
    if (data) {
      res.render("share", { data });
    } else {
      res.status(404).json({ error: "Datos no encontrados" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

app.post("/q", async (req, res) => {
  const { query, circle, triangle, square } = req.body;

  const circle_card = Cards.circle[circle];
  const triangle_card = Cards.triangle[triangle];
  const square_card = Cards.square[square];

  const circle_keyword = circle_card[Math.floor(Math.random() * circle_card.length)];
  const triangle_keyword = triangle_card[Math.floor(Math.random() * triangle_card.length)];
  const square_keyword = square_card[Math.floor(Math.random() * square_card.length)];

  const prompt = `${Prompt} ${circle_keyword}, ${triangle_keyword}, ${square_keyword}`;

  getCompletion(prompt)
    .then(async (answer) => {
      console.log("Texto completado:", answer);
      try {
        const spread = new Spread({ query, answer, circle, triangle, square });
        await spread.save();
        res.json({ message: "Datos guardados exitosamente", id: spread._id });
      } catch (error) {
        res.status(500).json({ error: "Error al guardar los datos." });
      }
      res.json({ answer: answer });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(400).json({ error: error });
    });
});

async function getCompletion(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    return response.data.data.choices[0].message.content;
  } catch (error) {
    console.error("Error en la solicitud a la API de OpenAI:", error);
  }
}

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
