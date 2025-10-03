const Notification = require("../models/notificationModel");

async function getNotifications(req, res) {
  const notes = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate("fromUserId", "name role");
  res.json({ success: true, data: notes });
};

async function markRead(req, res) {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true, message: "Marked as read" });
};

module.exports = { getNotifications, markRead };