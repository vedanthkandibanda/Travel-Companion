const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email exists" });
      }
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: "Registered ✅" });
  });
});


// LOGIN (Modified to check profile status)
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_completed: user.profile_completed // This tells the frontend where to go
      },
      token
    });
  });
});

// NEW: SAVE PROFILE SETUP
router.post("/setup-profile", authMiddleware, (req, res) => {
  const { fullName, username, bio, interests } = req.body;
  const userId = req.user.id;

  // 1. Insert into profiles table (based on your DB image)
  const profileSql = "INSERT INTO profiles (user_id, full_name, username, bio, interests) VALUES (?, ?, ?, ?, ?)";
  
  db.query(profileSql, [userId, fullName, username, bio, JSON.stringify(interests)], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Mark setup as complete in users table
    db.query("UPDATE users SET profile_completed = TRUE WHERE id = ?", [userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ error: updateErr.message });
      res.json({ message: "Profile setup successful! ✈️" });
    });
  });
});


// PROTECTED
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;