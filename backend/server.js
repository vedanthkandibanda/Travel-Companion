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

  // PRIVATE CHAT
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    io.to(`user_${receiverId}`).emit("receiveMessage", {
      senderId,
      message
    });
  });

  // GROUP JOIN (FIXED)
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

  // GROUP MESSAGE
  socket.on("sendFlightMessage", ({ senderId, flightNumber, message }) => {

    flightNumber = String(flightNumber).trim();

    io.to(`flight_${flightNumber}`).emit("receiveFlightMessage", {
      senderId,
      message,
      flightNumber
    });

  });

  // COUNT CHECK
  socket.on("getFlightCount", (flightNumber) => {

    const count = flightRooms[flightNumber]
      ? flightRooms[flightNumber].size
      : 0;

    socket.emit("flightCount", {
      flightNumber,
      count
    });

  });

  // CLEANUP
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