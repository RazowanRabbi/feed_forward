const path = require("path");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");
const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Message = require("./models/Message");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("FeedForward backend is running");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_request_room", (requestId) => {
    socket.join(requestId);
  });

  socket.on("send_message", async (data) => {
    try {
      const message = new Message({
        request: data.requestId,
        sender: data.sender,
        receiver: data.receiver,
        text: data.text
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name")
        .populate("receiver", "name");

      io.to(data.requestId).emit("receive_message", populatedMessage);
    } catch (error) {
      console.error("Socket message error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));