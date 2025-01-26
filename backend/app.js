const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    // origin: "http://localhost:3001", // Update this to match your React app's port
    origin: "https://real-time-tracker-pearl.vercel.app/", // Update this to match your React app's port
    methods: ["GET", "POST"],
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  connectedUsers.set(socket.id, null); // Initialize user without location

  socket.on("sendLocation", (location) => {
    console.log(`Location received from ${socket.id}:`, location);
    connectedUsers.set(socket.id, location);

    // Broadcast the updated locations to all clients
    io.emit(
        "receiveLocation",
        Array.from(connectedUsers.entries()).map(([id, loc]) => ({ id, ...loc }))
      );
    });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);

    // Broadcast updated locations after disconnection
       io.emit(
    "receiveLocation",
    Array.from(connectedUsers.entries()).map(([id, loc]) => ({ id, ...loc }))
  );
});
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
