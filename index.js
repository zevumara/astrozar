require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT;

const mongoose = require("mongoose");
const parser = require("body-parser");
const OpenAI = require("openai");
const { body, validationResult } = require("express-validator");

const cards = require("./src/cfg/cards");
const generate_prompt = require("./src/cfg/prompt");

app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");

app.use(parser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

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

app.post(
  "/q",
  [
    body("q").isString().isLength({ min: 15, max: 76 }),
    body("c").isInt({ min: 0, max: 10 }),
    body("t").isInt({ min: 0, max: 10 }),
    body("s").isInt({ min: 0, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, c, t, s } = req.body;

    const c_word = cards.circle[c][Math.floor(Math.random() * cards.circle[c].length)];
    const t_word = cards.triangle[t][Math.floor(Math.random() * cards.triangle[t].length)];
    const s_word = cards.square[s][Math.floor(Math.random() * cards.square[s].length)];

    const prompt = generate_prompt(q, c_word, t_word, s_word);

    try {
      chat_completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      const answer = chat_completion.choices[0].message.content;
      const spread = new Spread({
        query: q,
        answer: answer,
        circle: [
          {
            number: c,
            word: c_word,
          },
        ],
        triangle: [
          {
            number: t,
            word: t_word,
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
