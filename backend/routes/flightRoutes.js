const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ===============================
// ADD FLIGHT
// ===============================
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

  if (!user_id || !flight_number) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    INSERT INTO flights 
    (user_id, flight_number, departure_city, arrival_city, departure_date, departure_time, seat_number)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, flight_number, departure_city, arrival_city, departure_date, departure_time, seat_number],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Flight added ✅" });
    }
  );
});

// ===============================
// CONNECTION REQUEST
// ===============================
router.post("/connect", (req, res) => {
  const { senderId, receiverId } = req.body;

  const check = `SELECT * FROM connections WHERE sender_id=? AND receiver_id=?`;

  db.query(check, [senderId, receiverId], (err, result) => {
    if (result.length > 0) {
      return res.json({ message: "Already requested" });
    }

    const insert = `INSERT INTO connections (sender_id, receiver_id) VALUES (?, ?)`;

    db.query(insert, [senderId, receiverId], (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Request sent 🚀" });
    });
  });
});

// ===============================
// GET CONNECTIONS (FIXED - ONLY ONE ROUTE)
// ===============================
router.get("/connections/:userId", (req, res) => {
  const { userId } = req.params;

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
  `;

  db.query(sql, [userId, userId, userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ===============================
// REQUESTS
// ===============================
router.get("/requests/:userId", (req, res) => {
  const sql = `
    SELECT connections.id, users.name
    FROM connections
    JOIN users ON connections.sender_id = users.id
    WHERE connections.receiver_id = ?
  `;

  db.query(sql, [req.params.userId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ===============================
// ACCEPT
// ===============================
router.post("/accept", (req, res) => {
  db.query(
    "UPDATE connections SET status='accepted' WHERE id=?",
    [req.body.connectionId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Accepted ✅" });
    }
  );
});

// ===============================
// SEND MESSAGE
// ===============================
router.post("/message", (req, res) => {
  const { senderId, receiverId, message } = req.body;

  if (!message) return res.status(400).json({ message: "Empty message" });

  db.query(
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)",
    [senderId, receiverId, message],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Sent ✅" });
    }
  );
});

// ===============================
// GET MESSAGES
// ===============================
router.get("/messages/:u1/:u2", (req, res) => {
  const { u1, u2 } = req.params;

  const sql = `
    SELECT * FROM messages
    WHERE 
      (sender_id=? AND receiver_id=?)
      OR (sender_id=? AND receiver_id=?)
    ORDER BY id ASC
  `;

  db.query(sql, [u1, u2, u2, u1], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ===============================
// UNREAD COUNT
// ===============================
router.get("/unread/:userId", (req, res) => {
  db.query(
    "SELECT COUNT(*) as count FROM messages WHERE receiver_id=?",
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results[0]);
    }
  );
});

module.exports = router;