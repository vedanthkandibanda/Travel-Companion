const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Add flight
router.post("/add", (req, res) => {
  const {
    user_id,
    flight_number,
    departure_city,
    arrival_city,
    departure_date,
    departure_time,
    seat_number
  } = req.body;

  const sql = `
    INSERT INTO flights 
    (user_id, flight_number, departure_city, arrival_city, departure_date, departure_time, seat_number)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, flight_number, departure_city, arrival_city, departure_date, departure_time, seat_number],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Flight added successfully" });
    }
  );
});

router.get("/matches/:flight_number/:user_id", (req, res) => {

  const { flight_number, user_id } = req.params;

  console.log("Flight:", flight_number);
  console.log("User:", user_id);

  const sql = `
    SELECT 
  users.id,
  users.name,
  profiles.languages,
  profiles.interests,
  profiles.hobbies,
  profiles.travel_purpose,
  profiles.university
FROM flights
JOIN users ON flights.user_id = users.id
LEFT JOIN profiles ON profiles.user_id = users.id
WHERE flights.flight_number = ?
GROUP BY users.id
  `;

  db.query(sql, [flight_number], (err, results) => {

    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    console.log("RESULTS:", results);

    // ✅ safety check
    if (!Array.isArray(results)) {
      return res.json([]);
    }

    // ✅ find current user (FIXED TYPE)
    const currentUser = results.find(u => u.id === Number(user_id));

    // ✅ remove current user
    const filtered = results.filter(u => u.id !== Number(user_id));

    // ✅ scoring
    const scored = filtered.map(user => {

      let score = 0;
      let reasons = [];

      // LANGUAGES
      if (user.languages && currentUser?.languages) {
        const u1 = user.languages.toLowerCase().split(",");
        const u2 = currentUser.languages.toLowerCase().split(",");

        const match = u1.filter(l => u2.includes(l.trim()));

        if (match.length > 0) {
          score += 30;
          reasons.push("Common language");
        }
      }

      // INTERESTS
      if (user.interests && currentUser?.interests) {
        const u1 = user.interests.toLowerCase().split(",");
        const u2 = currentUser.interests.toLowerCase().split(",");

        const match = u1.filter(i => u2.includes(i.trim()));

        score += match.length * 20;

        if (match.length > 0) {
          reasons.push("Shared interests");
        }
      }

      // HOBBIES
      if (user.hobbies && currentUser?.hobbies) {
        const h1 = user.hobbies.toLowerCase().split(",");
        const h2 = currentUser.hobbies.toLowerCase().split(",");

        const match = h1.filter(h => h2.includes(h.trim()));

        score += match.length * 10;

        if (match.length > 0) {
          reasons.push("Similar hobbies");
        }
      }

      // PURPOSE
      if (user.travel_purpose && currentUser?.travel_purpose) {
        if (user.travel_purpose === currentUser.travel_purpose) {
          score += 20;
          reasons.push("Same travel purpose");
        }
      }

      // UNIVERSITY
      if (
        user.university &&
        currentUser?.university &&
        user.university.toLowerCase() === currentUser.university.toLowerCase()
      ) {
        score += 15;
        reasons.push("Same university");
      }

      return { ...user, score, reasons };
    });

    // ✅ sort by best match
    scored.sort((a, b) => b.score - a.score);

    res.json(scored);
  });
});

// Send connection request
router.post("/connect", (req, res) => {

  const { senderId, receiverId } = req.body

  const checkSql = `
    SELECT * FROM connections 
    WHERE sender_id = ? AND receiver_id = ?
  `

  db.query(checkSql, [senderId, receiverId], (err, result) => {

    if (result.length > 0) {
      return res.json({ message: "Already requested" })
    }

    const insertSql = `
      INSERT INTO connections (sender_id, receiver_id)
      VALUES (?, ?)
    `

    db.query(insertSql, [senderId, receiverId], (err) => {
      if (err) return res.status(500).json(err)

      res.json({ message: "Request sent 🚀" })
    })
  })
})

// ✅ GET CONNECTIONS FOR CURRENT USER
router.get("/connections/:user_id", (req, res) => {

  const { user_id } = req.params;

  const sql = `
    SELECT 
      connections.id,
      users.name,
      connections.status
    FROM connections
    JOIN users ON connections.sender_id = users.id
    WHERE connections.receiver_id = ?
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results);
  });

});

// ===============================
// GET CONNECTION REQUESTS
// ===============================
router.get("/requests/:userId", (req, res) => {

  const userId = req.params.userId;

  const sql = `
    SELECT connections.id, connections.status, users.name
    FROM connections
    JOIN users ON connections.sender_id = users.id
    WHERE connections.receiver_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);

    console.log("REQUESTS:", results); // debug

    res.json(results);
  });
});


// ===============================
// ACCEPT CONNECTION
// ===============================
router.post("/accept", (req, res) => {

  const { connectionId } = req.body;

  const sql = `
    UPDATE connections 
    SET status = 'accepted'
    WHERE id = ?
  `;

  db.query(sql, [connectionId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Connection accepted ✅" });
  });
});

router.get("/connections/:userId", (req, res) => {

  const { userId } = req.params

  const sql = `
    SELECT users.id, users.name, profiles.languages, profiles.interests
    FROM connections
    JOIN users 
      ON users.id = connections.sender_id OR users.id = connections.receiver_id
    LEFT JOIN profiles ON profiles.user_id = users.id
    WHERE 
      (connections.sender_id = ? OR connections.receiver_id = ?)
      AND connections.status = 'accepted'
      AND users.id != ?
  `

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json(err)

    res.json(results)
  })
})

// ===============================
// SEND MESSAGE
// ===============================
router.post("/message", (req, res) => {

  const { senderId, receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  const sql = `
    INSERT INTO messages (sender_id, receiver_id, message)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [senderId, receiverId, message], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Message sent 🚀" });
  });
});


// ===============================
// GET MESSAGES BETWEEN 2 USERS
// ===============================
router.get("/messages/:user1/:user2", (req, res) => {

  const { user1, user2 } = req.params;

  const sql = `
    SELECT * 
    FROM messages
    WHERE 
      (sender_id = ? AND receiver_id = ?)
      OR 
      (sender_id = ? AND receiver_id = ?)
    ORDER BY id ASC
  `;

  db.query(sql, [user1, user2, user2, user1], (err, results) => {

    if (err) {
      console.log("MESSAGE ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

router.get("/unread/:userId", (req, res) => {

  const { userId } = req.params;

  const sql = `
    SELECT COUNT(*) as count 
    FROM messages 
    WHERE receiver_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json(err);

    res.json(results[0]);
  });
});

module.exports = router;