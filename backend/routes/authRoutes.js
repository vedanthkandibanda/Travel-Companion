const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const db = require("../config/db");


// REGISTER USER
router.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {

    if (err) {

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists" });
      }

      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ message: "User registered successfully" });

  });

});


// LOGIN USER
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {

    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id },
      "secretkey",
      { expiresIn: "1h" }
    );

    // ✅ FIXED RESPONSE FORMAT
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  });
});

router.get("/profile", authMiddleware, (req, res) => {

  res.json({
    message: "Welcome to protected route",
    user: req.user
  });

});

module.exports = router;