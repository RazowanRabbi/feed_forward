const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["donor", "receiver", "volunteer", "admin"],
    default: "receiver"
  },

  phone: {
  type: String,
  default: ""
},

location: {
  type: String,
  default: ""
},

profileImage: {
  type: String,
  default: ""
},

  

  donorStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  },

  volunteerStatus: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);