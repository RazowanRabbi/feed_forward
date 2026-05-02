const mongoose = require("mongoose");

const foodRequestSchema = new mongoose.Schema({
  foodPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodPost",
    required: true
  },

  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  requestedQuantity: {
    type: String,
    default: ""
  },

  message: {
    type: String,
    default: ""
  },

  pickupPreference: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("FoodRequest", foodRequestSchema);