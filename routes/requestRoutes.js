const express = require("express");
const router = express.Router();
const FoodRequest = require("../models/FoodRequest");

// Create food request
router.post("/create", async (req, res) => {
  try {
    const {
      foodPost,
      requester,
      donor,
      requestedQuantity,
      message,
      pickupPreference
    } = req.body;

    const existingRequest = await FoodRequest.findOne({
      foodPost,
      requester,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this food post."
      });
    }

    const request = new FoodRequest({
      foodPost,
      requester,
      donor,
      requestedQuantity,
      message,
      pickupPreference
    });

    await request.save();

    res.status(201).json({
      message: "Food request sent successfully.",
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests made by current user
router.get("/my-requests/:userId", async (req, res) => {
  try {
    const requests = await FoodRequest.find({ requester: req.params.userId })
      .populate("foodPost")
      .populate("donor", "name email phone location")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get requests received by donor
router.get("/donor-requests/:donorId", async (req, res) => {
  try {
    const requests = await FoodRequest.find({ donor: req.params.donorId })
      .populate("foodPost")
      .populate("requester", "name email phone location")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept food request
router.put("/accept/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Request accepted successfully.",
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject food request
router.put("/reject/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      message: "Request rejected.",
      request
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;