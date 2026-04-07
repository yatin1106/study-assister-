const express = require("express");
const cors = require("cors");
require("dotenv").config();

const studyRoute = require("./routes/study");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CSE Study Assistant Backend Running");
});

app.use("/study", studyRoute);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});