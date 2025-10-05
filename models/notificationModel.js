const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  type: { type: String, enum: ["follow","like","comment","message"], required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);
