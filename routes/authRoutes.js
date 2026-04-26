const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      location
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply as volunteer
router.post("/apply-volunteer", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.volunteerStatus === "pending") {
      return res.status(400).json({ message: "Already applied as volunteer" });
    }

    user.volunteerStatus = "pending";
    await user.save();

    res.json({ message: "Volunteer application submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Apply as donor
router.post("/apply-donor", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.donorStatus === "pending") {
      return res.status(400).json({ message: "Already applied" });
    }

    user.donorStatus = "pending";
    await user.save();

    res.json({ message: "Donor application submitted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Get user by ID

});