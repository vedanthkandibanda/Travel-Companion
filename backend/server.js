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

// In-memory store for flight group occupancy
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
  // 1. PRIVATE CHAT LOGIC
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

  // Typing & Seen Features
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
  // 2. GROUP CHAT (FLIGHT) LOGIC
  // ==============================
  
  // FIX: This handler allows the "View Flight Group" button to see stats before joining
  socket.on("getFlightCount", (flightNumber) => {
    const cleanedFlight = String(flightNumber).trim().toUpperCase();
    const count = flightRooms[cleanedFlight] ? flightRooms[cleanedFlight].size : 0;
    
    socket.emit("flightCount", {
      flightNumber: cleanedFlight,
      count: count
    });
  });

  socket.on("joinFlight", (flightNumber) => {
    const cleanedFlight = String(flightNumber).trim().toUpperCase();

    if (!flightRooms[cleanedFlight]) {
      flightRooms[cleanedFlight] = new Set();
    }
    flightRooms[cleanedFlight].add(socket.id);

    socket.join(`flight_${cleanedFlight}`);
    socket.flightNumber = cleanedFlight;

    // Notify the room of the new count
    io.to(`flight_${cleanedFlight}`).emit("flightCount", {
      flightNumber: cleanedFlight,
      count: flightRooms[cleanedFlight].size
    });
  });

  socket.on("sendFlightMessage", ({ senderId, flightNumber, message, messageId }) => {
    const cleanedFlight = String(flightNumber).trim().toUpperCase();
    const time = new Date().toISOString();
    
    io.to(`flight_${cleanedFlight}`).emit("receiveFlightMessage", {
      senderId, message, flightNumber: cleanedFlight, messageId, time
    });
  });

  // Group Typing
  socket.on("flightTyping", ({ flightNumber, userName }) => {
    const cleanedFlight = String(flightNumber).trim().toUpperCase();
    socket.to(`flight_${cleanedFlight}`).emit("flightTyping", { userName });
  });

  socket.on("flightStopTyping", ({ flightNumber }) => {
    const cleanedFlight = String(flightNumber).trim().toUpperCase();
    socket.to(`flight_${cleanedFlight}`).emit("flightStopTyping");
  });


  // ==============================
  // 3. CLEANUP & DISCONNECT
  // ==============================
  socket.on("disconnect", () => {
    const flight = socket.flightNumber;
    if (flight && flightRooms[flight]) {
      flightRooms[flight].delete(socket.id);
      
      // Update remaining users about the new count
      io.to(`flight_${flight}`).emit("flightCount", {
        flightNumber: flight,
        count: flightRooms[flight].size
      });

      // Optional: Remove empty sets to save memory
      if (flightRooms[flight].size === 0) {
        delete flightRooms[flight];
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));