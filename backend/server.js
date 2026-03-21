require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const profileRoutes = require("./routes/profileRoutes");
const flightRoutes = require("./routes/flightRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app);

const flightRooms = {};

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ==============================
  // PRIVATE CHAT
  // ==============================
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message, messageId }) => {
    const time = new Date().toISOString();
    const payload = { senderId, receiverId, message, messageId, time };

    // Emit to receiver
    io.to(`user_${receiverId}`).emit("receiveMessage", payload);
    // Emit back to sender for "Sent ✓" confirmation
    io.to(`user_${senderId}`).emit("messageSent", payload);
  });

  // WhatsApp-like Features: Typing & Seen
  socket.on("typing", ({ senderId, receiverId }) => {
    io.to(`user_${receiverId}`).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    io.to(`user_${receiverId}`).emit("stopTyping", { senderId });
  });

  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    io.to(`user_${senderId}`).emit("messageSeen", { messageId });
  });

  // ==============================
  // GROUP CHAT (FLIGHT)
  // ==============================
  socket.on("joinFlight", (flightNumber) => {
    flightNumber = String(flightNumber).trim();

    if (!flightRooms[flightNumber]) {
      flightRooms[flightNumber] = new Set();
    }
    flightRooms[flightNumber].add(socket.id);

    socket.join(`flight_${flightNumber}`);
    socket.flightNumber = flightNumber;

    io.to(`flight_${flightNumber}`).emit("flightCount", {
      flightNumber,
      count: flightRooms[flightNumber].size
    });
  });

  socket.on("sendFlightMessage", ({ senderId, flightNumber, message, messageId }) => {
    const time = new Date().toISOString();
    io.to(`flight_${flightNumber}`).emit("receiveFlightMessage", {
      senderId, message, flightNumber, messageId, time
    });
  });

  // Group Typing
  socket.on("flightTyping", ({ flightNumber, userName }) => {
    socket.to(`flight_${flightNumber}`).emit("flightTyping", { userName });
  });

  socket.on("flightStopTyping", ({ flightNumber }) => {
    socket.to(`flight_${flightNumber}`).emit("flightStopTyping");
  });

  // ==============================
  // CLEANUP
  // ==============================
  socket.on("disconnect", () => {
    const flight = socket.flightNumber;
    if (flight && flightRooms[flight]) {
      flightRooms[flight].delete(socket.id);
      io.to(`flight_${flight}`).emit("flightCount", {
        flightNumber: flight,
        count: flightRooms[flight].size
      });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));