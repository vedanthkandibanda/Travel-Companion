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

// Find matching travelers
router.get("/matches/:flight_number/:user_id", (req, res) => {

  const { flight_number, user_id } = req.params;

  const sql = `
SELECT 
users.id,
users.name,
users.email,
flights.flight_number,
flights.departure_city,
flights.arrival_city,
flights.departure_date,
flights.departure_time,
flights.seat_number,
profiles.languages,
profiles.interests,
profiles.hobbies,
profiles.travel_purpose,
profiles.university

FROM flights

JOIN users ON flights.user_id = users.id
LEFT JOIN profiles ON profiles.user_id = users.id

WHERE flights.flight_number = ?
`;

  db.query(sql, [flight_number], (err, results) => {
    if (err) return res.status(500).json(err);

    // ✅ Find current user correctly
    const currentUser = results.find(u => u.id == user_id);

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found in this flight" });
    }

    // ✅ Remove current user
    const filtered = results.filter(u => u.id != user_id);

    const scored = filtered.map(user => {

  let score = 0
let reasons = []

// Language match (strong signal)
const userLangs = user.languages?.toLowerCase().split(",") || []
const currentLangs = currentUser.languages?.toLowerCase().split(",") || []

if (userLangs.some(l => currentLangs.includes(l.trim()))) {
  score += 25
  reasons.push("Speaks same language")
}

// Interest match (strongest signal)
const userInterests = user.interests?.toLowerCase().split(",") || []
const currentInterests = currentUser.interests?.toLowerCase().split(",") || []

if (userInterests.some(i => currentInterests.includes(i.trim()))) {
  score += 35
  reasons.push("Shared interests")
}

// Hobby match (medium signal)
const userHobbies = user.hobbies?.toLowerCase().split(",") || []
const currentHobbies = currentUser.hobbies?.toLowerCase().split(",") || []

if (userHobbies.some(h => currentHobbies.includes(h.trim()))) {
  score += 15
  reasons.push("Similar hobbies")
}

// Travel purpose (context match)
if (user.travel_purpose === currentUser.travel_purpose) {
  score += 15
  reasons.push("Same travel purpose")
}

// University (weak signal but useful)
if (
  user.university &&
  currentUser.university &&
  user.university.toLowerCase() === currentUser.university.toLowerCase()
) {
  score += 10
  reasons.push("Same university")
}

  return { ...user, score, reasons }
})

    // ✅ Sort by best match
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
    SELECT * FROM messages
    WHERE 
      (sender_id = ? AND receiver_id = ?)
      OR
      (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `;

  db.query(sql, [user1, user2, user2, user1], (err, results) => {
    if (err) return res.status(500).json(err);

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