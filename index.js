require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const parser = require("body-parser");
const fs = require("fs");
const path = require("path");
const validator = require("express-validator");
const OpenAI = require("openai");
const { cards, generate_prompt } = require("./config");

app.use(parser.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("connected", () => console.log("Connected to MongoDB"));

const Spread = mongoose.model("Spread", {
  query: String,
  answer: String,
  octahedron: [
    {
      number: Number,
      word: String,
    },
  ],
  icosahedron: [
    {
      number: Number,
      word: String,
    },
  ],
  dodecahedron: [
    {
      number: Number,
      word: String,
    },
  ],
});

app.use(express.static("public"));

app.get("/share/:id", async (req, res) => {
  try {
    const data = await Spread.findById(req.params.id);
    const number = `${data.octahedron[0].number} ${data.icosahedron[0].number} ${data.dodecahedron[0].number}`;
    if (data) {
      res.json({ query: data.query, answer: data.answer, number: number });
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

app.post(
  "/query",
  [
    validator.body("q").isString().isLength({ min: 20, max: 76 }),
    validator.body("o").isInt({ min: 0, max: 10 }),
    validator.body("i").isInt({ min: 0, max: 10 }),
    validator.body("d").isInt({ min: 0, max: 10 }),
  ],
  async (req, res) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400);
    }
    const { q, o, i, d } = req.body;
    const o_word = cards.octahedron[o][Math.floor(Math.random() * cards.octahedron[o].length)];
    const i_word = cards.icosahedron[i][Math.floor(Math.random() * cards.icosahedron[i].length)];
    const d_word = cards.dodecahedron[d][Math.floor(Math.random() * cards.dodecahedron[d].length)];
    const prompt = generate_prompt(q, o_word, i_word, d_word);
    try {
      chat_completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      const answer = chat_completion.choices[0].message.content;
      const spread = new Spread({
        query: q,
        answer: answer,
        octahedron: [
          {
            number: o,
            word: o_word,
          },
        ],
        icosahedron: [
          {
            number: i,
            word: i_word,
          },
        ],
        dodecahedron: [
          {
            number: d,
            word: d_word,
          },
        ],
      });
      await spread.save();
      res.json({ id: spread._id, answer: answer });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
