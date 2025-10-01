const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["player", "academy", "scout"], required: true },

  // Role-specific fields
  age: Number,
  playingRole: String,
  location: String,
  contactInfo: String,
  organization: String,
  experience: Number,

  refreshTokens: [String],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
