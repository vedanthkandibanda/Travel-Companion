
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Travel Companion Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});