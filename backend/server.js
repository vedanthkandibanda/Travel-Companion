require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const profileRoutes = require("./routes/profileRoutes");
const flightRoutes = require("./routes/flightRoutes");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔥 Attach socket.io
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("Travel Companion Backend Running 🚀");
});

// ================= SOCKET LOGIC =================
io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

});
// =================================================

// 🔥 IMPORTANT: use server.listen NOT app.listen
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});