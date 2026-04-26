const mongoose = require("mongoose");

const foodPostSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  foodName: {
    type: String,
    required: true
  },

  quantity: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["Cooked Food", "Raw Food", "Packaged Food", "Fruits/Vegetables", "Bakery", "Other"],
    required: true
  },

  description: {
    type: String,
    required: true
  },

  expiryDateTime: {
    type: Date,
    required: true
  },

  pickupAddress: {
    type: String,
    required: true
  },

  area: {
    type: String,
    default: ""
  },

  city: {
    type: String,
    default: ""
  },

  latitude: {
    type: Number,
    default: null
  },

  longitude: {
    type: Number,
    default: null
  },

  foodImage: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["available", "requested", "assigned", "delivered", "expired"],
    default: "available"
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  reactions: {
    type: Number,
    default: 0
  },

  comments: [
    {
      userName: String,
      text: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("FoodPost", foodPostSchema);