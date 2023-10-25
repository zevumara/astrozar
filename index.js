const express = require("express");
const app = express();
const port = 3000;
const endpoints = require("./src/api");

app.use(express.static("public"));
app.use("/api", endpoints);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});
