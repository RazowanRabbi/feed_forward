const FoodPost = require("../models/FoodPost");
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Get all pending donor applications
router.get("/pending-donors", async (req, res) => {
  try {
    const users = await User.find({ donorStatus: "pending" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve donor
router.put("/approve-donor/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        donorStatus: "approved",
        role: "donor"
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Donor approved successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject donor
router.put("/reject-donor/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        donorStatus: "rejected"
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Donor rejected",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending volunteer applications
router.get("/pending-volunteers", async (req, res) => {
  try {
    const users = await User.find({ volunteerStatus: "pending" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve volunteer
router.put("/approve-volunteer/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        volunteerStatus: "approved",
        role: "volunteer"
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Volunteer approved successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject volunteer
router.put("/reject-volunteer/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        volunteerStatus: "rejected"
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Volunteer rejected",
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending food posts
router.get("/pending-posts", async (req, res) => {
  try {
    const posts = await FoodPost.find({ approvalStatus: "pending" })
      .populate("donor", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve food post
router.put("/approve-post/:id", async (req, res) => {
  try {
    const post = await FoodPost.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "approved" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post approved", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject food post
router.put("/reject-post/:id", async (req, res) => {
  try {
    const post = await FoodPost.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: "rejected" },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post rejected", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;