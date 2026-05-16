const FoodPost = require("../models/FoodPost");
const express = require("express");
const router = express.Router();
const FoodRequest = require("../models/FoodRequest");


router.post("/create", async (req, res) => {
  try {
    const {
      foodPost,
      requester,
      donor,
      requestedQuantity,
      message,
      pickupPreference,
    } = req.body;

    const existingRequest = await FoodRequest.findOne({
      foodPost,
      requester,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this food post.",
      });
    }

    const food = await FoodPost.findById(foodPost);

    if (!food) {
      return res.status(404).json({ message: "Food post not found." });
    }

    if (food.status !== "available") {
      return res.status(400).json({
        message: "This food is no longer available.",
      });
    }

    const request = new FoodRequest({
      foodPost,
      requester,
      donor,
      requestedQuantity,
      message,
      pickupPreference,
    });

    await request.save();

    await FoodPost.findByIdAndUpdate(foodPost, {
      status: "requested",
    });

    res.status(201).json({
      message: "Food request sent successfully.",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


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


router.put("/accept/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const foodPostId = request.foodPost;

    const foodPost = await FoodPost.findById(foodPostId);

    if (!foodPost) {
      return res.status(404).json({ message: "Food post not found" });
    }

    if (foodPost.status === "assigned" || foodPost.status === "delivered") {
      return res.status(400).json({
        message: "This food has already been assigned.",
      });
    }

    request.status = "accepted";
    await request.save();

    await FoodPost.findByIdAndUpdate(foodPostId, {
      status: "assigned",
    });

    await FoodRequest.updateMany(
      {
        foodPost: foodPostId,
        _id: { $ne: request._id },
        status: "pending",
      },
      {
        status: "rejected",
      },
    );

    res.json({
      message: "Request accepted. Other pending requests were rejected.",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put("/reject/:id", async (req, res) => {
  try {
    const request = await FoodRequest.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const remainingPendingRequests = await FoodRequest.countDocuments({
      foodPost: request.foodPost,
      status: "pending",
    });

    const acceptedRequest = await FoodRequest.findOne({
      foodPost: request.foodPost,
      status: "accepted",
    });

    if (remainingPendingRequests === 0 && !acceptedRequest) {
      await FoodPost.findByIdAndUpdate(request.foodPost, {
        status: "available",
      });
    }

    res.json({
      message: "Request rejected.",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
