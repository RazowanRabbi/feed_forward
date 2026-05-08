const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// Get messages for a request
router.get("/:requestId", async (req, res) => {
  try {
    const messages = await Message.find({ request: req.params.requestId })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count for current user
router.get("/unread/:userId", async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.params.userId,
      isRead: false
    });

    res.json({ unread: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put("/read/:requestId/:userId", async (req, res) => {
  try {
    await Message.updateMany(
      {
        request: req.params.requestId,
        receiver: req.params.userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;