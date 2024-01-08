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
const cards = require("./src/cfg/cards");
const generatePrompt = require("./src/cfg/prompt");

app.use(parser.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.once("connected", () => console.log("Connected to MongoDB"));

const Spread = mongoose.model("Spread", {
  query: String,
  answer: String,
  circle: [
    {
      number: Number,
      word: String,
    },
  ],
  triangle: [
    {
      number: Number,
      word: String,
    },
  ],
  square: [
    {
      number: Number,
      word: String,
    },
  ],
});

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

app.get("/", async (req, res) => {
  const apiUrl = process.env.VERCEL ? `https://astrozar.vercel.app/` : "http://localhost:3000/";
  try {
    const filePath = path.join(process.cwd(), "public", "index.html");
    if (fs.existsSync(filePath)) {
      let file = fs.readFileSync(filePath, "utf8");
      file = file.replace("{{apiUrl}}", apiUrl);
      res.setHeader("Content-Type", "text/html");
      return res.end(file);
    } else {
      res.status(404).send("The file does not exists.");
    }
  } catch (error) {
    res.status(500).send("Error:", error);
  }
});

app.use(express.static("public"));

app.get("/share/:id", async (req, res) => {
  try {
    const data = await Spread.findById(req.params.id);
    const number = `${data.triangle[0].number} ${data.circle[0].number} ${data.square[0].number}`;
    if (data) {
      res.json({ query: data.query, answer: data.answer, number: number });
    } else {
      res.status(404).json({ error: "Data not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.post(
  "/query",
  [
    validator.body("q").isString().isLength({ min: 15, max: 76 }),
    validator.body("t").isInt({ min: 0, max: 10 }),
    validator.body("c").isInt({ min: 0, max: 10 }),
    validator.body("s").isInt({ min: 0, max: 10 }),
  ],
  async (req, res) => {
    const errors = validator.validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, t, c, s } = req.body;

    const t_word = cards.triangle[t][Math.floor(Math.random() * cards.triangle[t].length)];
    const c_word = cards.circle[c][Math.floor(Math.random() * cards.circle[c].length)];
    const s_word = cards.square[s][Math.floor(Math.random() * cards.square[s].length)];

    const prompt = generatePrompt(q, t_word, c_word, s_word);

    try {
      chat_completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      const answer = chat_completion.choices[0].message.content;
      const spread = new Spread({
        query: q,
        answer: answer,
        triangle: [
          {
            number: t,
            word: t_word,
          },
        ],
        circle: [
          {
            number: c,
            word: c_word,
          },
        ],
        square: [
          {
            number: s,
            word: s_word,
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
