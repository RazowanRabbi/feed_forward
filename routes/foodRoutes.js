const express = require("express");
const router = express.Router();
const FoodPost = require("../models/FoodPost");

// Create a new food post
// Create a new food post
router.post("/create", async (req, res) => {
  try {
    const {
      donor,
      foodName,
      quantity,
      category,
      description,
      expiryDateTime,
      pickupAddress,
      area,
      city,
      latitude,
      longitude,
      foodImage
    } = req.body;

    const post = new FoodPost({
      donor,
      foodName,
      quantity,
      category,
      description,
      expiryDateTime,
      pickupAddress,
      area,
      city,
      latitude,
      longitude,
      foodImage
    });

    await post.save();

    res.status(201).json({
      message: "Food post submitted for admin approval",
      post
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all food posts
router.get("/all", async (req, res) => {
  try {
    const posts = await FoodPost.find({ approvalStatus: "approved" })
      .populate("donor", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
