const multer = require("multer");
const path = require("path");
const express = require("express");
const FoodPost = require("../models/FoodPost");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post("/create", upload.single("foodImage"), async (req, res) => {
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
      latitude: latitude || null,
      longitude: longitude || null,
      foodImage: req.file
        ? `http://localhost:5000/uploads/${req.file.filename}`
        : "",
      approvalStatus: "pending",
    });

    await post.save();

    res.status(201).json({
      message: "Food post submitted for admin approval",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const posts = await FoodPost.find({
      approvalStatus: "approved",
      status: "available",
    })
      .populate("donor", "name role")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query, category, city, area } = req.query;

    let filter = {
      approvalStatus: "approved",
      status: "available",
    };

    if (query) {
      filter.foodName = { $regex: query, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (area) {
      filter.area = { $regex: area, $options: "i" };
    }

    const posts = await FoodPost.find(filter)
      .populate("donor", "name")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/my-posts/:donorId", async (req, res) => {
  try {
    const posts = await FoodPost.find({ donor: req.params.donorId })
      .populate("donor", "name email phone location")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const post = await FoodPost.findById(req.params.id).populate(
      "donor",
      "name email phone location",
    );

    if (!post) {
      return res.status(404).json({ message: "Food post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
