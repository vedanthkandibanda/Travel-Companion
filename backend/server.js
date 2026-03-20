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

const flightRooms = {}; // 🔥 keep

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/profile", profileRoutes);

// TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// SOCKET
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // =========================
  // 👤 PRIVATE CHAT (FIXED)
  // =========================
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`); // ✅ FIX
    socket.userId = userId; // store for cleanup
  });

  socket.on("sendMessage", (data) => {

    const { senderId, receiverId, message } = data;

    io.to(`user_${receiverId}`).emit("receiveMessage", { // ✅ FIX
      senderId,
      message
    });

  });

  // =========================
  // ✈️ JOIN FLIGHT GROUP
  // =========================
  socket.on("joinFlight", (flightNumber) => {

    if (!flightRooms[flightNumber]) {
      flightRooms[flightNumber] = new Set();
    }

    flightRooms[flightNumber].add(socket.id);

    socket.join(`flight_${flightNumber}`);
    socket.flightNumber = flightNumber; // store for cleanup

    io.to(`flight_${flightNumber}`).emit("flightCount", {
      flightNumber,
      count: flightRooms[flightNumber].size
    });

  });

  // =========================
  // 👥 GET GROUP COUNT
  // =========================
  socket.on("getFlightCount", (flightNumber) => {

    const count = flightRooms[flightNumber]
      ? flightRooms[flightNumber].size
      : 0;

    socket.emit("flightCount", {
      flightNumber,
      count
    });

  });

  // =========================
  // 📢 GROUP MESSAGE (KEEP ONLY THIS)
  // =========================
  socket.on("sendFlightMessage", ({ senderId, flightNumber, message }) => {

    io.to(`flight_${flightNumber}`).emit("receiveFlightMessage", {
      senderId,
      message
    });

  });

  // =========================
  // ❗ CLEANUP ON DISCONNECT
  // =========================
  socket.on("disconnect", () => {

    console.log("User disconnected");

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