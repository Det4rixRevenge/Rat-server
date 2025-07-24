const express = require('express');
const app = express();
app.use(express.json());

let lastCommand = "";
app.post("/command", (req, res) => {
  lastCommand = req.body.command;
  res.send("OK");
});

app.get("/command", (req, res) => {
  res.json({ command: lastCommand });
  lastCommand = "";
});

app.listen(3000, () => console.log("Сервер работает!"));
