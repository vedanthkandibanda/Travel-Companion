const express = require("express")
const router = express.Router()
const db = require("../config/db")

// Add Profile
router.post("/add", (req, res) => {
  const { user_id, languages, interests, hobbies, travel_purpose, university } = req.body

  const sql = `
    INSERT INTO profiles (user_id, languages, interests, hobbies, travel_purpose, university)
    VALUES (?, ?, ?, ?, ?, ?)
  `

  db.query(sql, [user_id, languages, interests, hobbies, travel_purpose, university],
    (err, result) => {
      if (err) return res.status(500).json(err)
      res.json({ message: "Profile added successfully" })
    }
  )
})

module.exports = router