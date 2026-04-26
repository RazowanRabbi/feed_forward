const adminRoutes = require("./routes/adminRoutes");
const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

app.use("/api/food", foodRoutes);

app.get("/", (req, res) => {
  res.send("FeedForward backend is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log(err));
app.use("/api/auth", authRoutes);
