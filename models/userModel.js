const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["player", "academy", "scout", "admin"], required: true },
  isAdmin: { type: Boolean, default: false },
  gallery: { type: [String], default: [] },
  profilePic: { type: String, default: "" },

  // new: short bio / about me
  bio: { type: String, default: "" },

  // Role-specific fields
  age: Number,
  playingRole: String,
  location: String,
  contactInfo: String,
  organization: String,
  experience: String,

  refreshTokens: [String],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
