const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");
const parser = require("body-parser");
const { body, validationResult } = require("express-validator");

const cards = require("./src/cfg/cards");
const generate_prompt = require("./src/cfg/prompt");
const API_KEY = require("./src/cfg/api_key");

app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");

app.use(parser.json());
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
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post("/q", async (req, res) => {
  const { query, circle, triangle, square } = req.body;

  // Validaciones //

  const c_card = cards.circle[circle];
  const t_card = cards.triangle[triangle];
  const s_card = cards.square[square];

  const word1 = c_card[Math.floor(Math.random() * c_card.length)];
  const word2 = t_card[Math.floor(Math.random() * t_card.length)];
  const word3 = s_card[Math.floor(Math.random() * s_card.length)];

  const prompt = generate_prompt(query, word1, word2, word3);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 120,
        temperature: 0.1,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ answer: data.data.choices[0].message.content });
    } else {
      res.status(response.status).json({ error: response.statusText });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
