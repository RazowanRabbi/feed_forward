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
    required: true
  },
  location: {
    type: String,
    required: true
  },
  expiry: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "available"
  },

  image: String,

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

