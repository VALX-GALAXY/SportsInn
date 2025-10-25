// controllers/notificationController.js
const Notification = require("../models/notificationModel");

async function getNotifications(req, res, next) {
  try {
    // prefer auth user; fallback to :userId param
    const userId = req.user ? String(req.user._id) : req.params.userId;
    if (!userId) return res.status(401).json({ success: false, message: "No user context" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const notes = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, page, limit, data: notes });
  } catch (err) { next(err); }
}

async function markOneRead(req, res, next) {
  try {
    const id = req.params.id;
    const note = await Notification.findById(id);
    if (!note) return res.status(404).json({ success: false, message: "Notification not found" });
    if (String(note.userId) !== String(req.user._id)) return res.status(403).json({ success: false, message: "Not allowed" });

    note.read = true;
    await note.save();
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
}

async function markAllRead(req, res, next) {
  try {
    const userId = req.user._id;
    const result = await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    // result.modifiedCount (MongoDB 4.2+), fallback to nModified
    const modified = result.modifiedCount || result.nModified || 0;
    res.json({ success: true, data: { modifiedCount: modified }, message: "All notifications marked as read" });
  } catch (err) { next(err); }
}

async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, read: false });
    res.json({ success: true, data: { unreadCount: count } });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markOneRead, markAllRead, getUnreadCount };
