const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let rooms = {};
let messages = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("createRoom", (room) => {
    if (!rooms[room]) {
      rooms[room] = true;
      messages[room] = []; // Initialize message storage for the room
      socket.join(room);
      io.emit("roomCreated", room);
      console.log(`Room created: ${room}`);
    }
  });

  socket.on("joinRoom", (room) => {
    if (rooms[room]) {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      // Send previous messages to the user
      socket.emit("previousMessages", messages[room]);
      socket.emit("joinSuccess", room);
    } else {
      console.log(`Invalid room attempted: ${room}`);
      socket.emit("invalidRoom", room);
    }
  });

  socket.on("message", ({ room, message }) => {
    console.log(`Received message in room ${room}: ${message}`);
    messages[room].push(message); // Save message to storage
    io.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
