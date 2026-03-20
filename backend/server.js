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

// ✅ CORS (clean)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ✅ ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/profile", profileRoutes);

// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// ✅ SOCKET (optional)
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // ✅ join room (userId)
  socket.on("join", (userId) => {
    socket.join(userId);
  });

// join flight
  socket.on("joinFlight", (flightNumber) => {

  if (!flightRooms[flightNumber]) {
    flightRooms[flightNumber] = new Set();
  }

  // ⚠️ remove userId dependency (or optional)
  flightRooms[flightNumber].add(socket.id);

  socket.join(`flight_${flightNumber}`);

  io.to(`flight_${flightNumber}`).emit("flightCount", {
    flightNumber,
    count: flightRooms[flightNumber].size
  });

});

socket.on("sendGroupMessage", (data) => {
  const { flightNumber, senderId, message } = data;

  io.to(`flight_${flightNumber}`).emit("receiveGroupMessage", {
    senderId,
    message
  });
});

// 👥 CHECK GROUP SIZE
socket.on("getFlightCount", (flightNumber) => {

  const count = flightRooms[flightNumber]
    ? flightRooms[flightNumber].size
    : 0;

  socket.emit("flightCount", {
    flightNumber,
    count
  });

});

// 📢 SEND GROUP MESSAGE
socket.on("sendFlightMessage", ({ senderId, flightNumber, message }) => {

  io.to(`flight_${flightNumber}`).emit("receiveFlightMessage", {
    senderId,
    message
  });

});

  // ✅ send message instantly
  socket.on("sendMessage", (data) => {

    const { senderId, receiverId, message } = data;

    // send to receiver room
    io.to(receiverId).emit("receiveMessage", {
      senderId,
      message
    });

  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));