const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "profile-" + Date.now() + path.extname(file.originalname));
  },
});

const profileUpload = multer({ storage: profileStorage });

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
      location,
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
      { expiresIn: "1d" },
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

// Update user profile with optional profile image
router.put(
  "/update-profile/:id",
  profileUpload.single("profileImage"),
  async (req, res) => {
    try {
      const { name, phone, location, bio } = req.body;

      const updateData = {
        name,
        phone,
        location,
        bio,
      };

      if (req.file) {
        updateData.profileImage = `http://localhost:5000/uploads/${req.file.filename}`;
      }

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// Forgot password
// Forgot password - send reset link by email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset_password.html?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"FeedForward" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your FeedForward password",
      html: `
        <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:30px;">
          <div style="max-width:560px; margin:auto; background:white; border-radius:18px; padding:28px; border:1px solid #e2e8f0;">
            <h2 style="color:#14532d; margin-bottom:10px;">Reset your password</h2>

            <p style="color:#475569; line-height:1.6;">
              We received a request to reset your FeedForward password.
              Click the button below to set a new password.
            </p>

            <a
              href="${resetLink}"
              style="display:inline-block; margin-top:18px; background:#16a34a; color:white; text-decoration:none; padding:12px 20px; border-radius:14px; font-weight:bold;"
            >
              Reset Password
            </a>

            <p style="color:#64748b; font-size:13px; margin-top:24px;">
              This link will expire in 15 minutes.
            </p>

            <p style="color:#64748b; font-size:13px;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });

    res.json({
      message: "Password reset link has been sent to your email."
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now login." });

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
