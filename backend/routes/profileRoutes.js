const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===============================
// CREATE OR UPDATE PROFILE
// ===============================
router.post("/save", (req, res) => {

  const {
    user_id,
    languages,
    interests,
    hobbies,
    travel_purpose,
    university
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "User ID required" });
  }

  // 🔥 Check if profile exists
  const checkSql = "SELECT * FROM profiles WHERE user_id = ?";

  db.query(checkSql, [user_id], (err, result) => {

    if (err) return res.status(500).json(err);

    // ===============================
    // UPDATE
    // ===============================
    if (result.length > 0) {

      const updateSql = `
        UPDATE profiles 
        SET languages=?, interests=?, hobbies=?, travel_purpose=?, university=?
        WHERE user_id=?
      `;

      db.query(
        updateSql,
        [languages, interests, hobbies, travel_purpose, university, user_id],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Profile updated ✅" });
        }
      );

    } else {

      // ===============================
      // INSERT
      // ===============================
      const insertSql = `
        INSERT INTO profiles 
        (user_id, languages, interests, hobbies, travel_purpose, university)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, languages, interests, hobbies, travel_purpose, university],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({ message: "Profile created ✅" });
        }
      );
    }
  });
});

// ===============================
// GET PROFILE
// ===============================
router.get("/:userId", (req, res) => {

  const { userId } = req.params;

  const sql = "SELECT * FROM profiles WHERE user_id = ?";

  db.query(sql, [userId], (err, results) => {

    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.json({ message: "No profile found" });
    }

    res.json(results[0]);
  });
});

module.exports = router;