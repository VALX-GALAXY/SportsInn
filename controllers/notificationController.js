const Notification = require("../models/notificationModel");

async function getNotifications(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const notes = await Notification.find({ userId: req.user._id })
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
    if (!note) return res.status(404).json({ success: false, message: 'Notification not found' });
    if (String(note.userId) !== String(req.user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });

    note.read = true;
    await note.save();
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
}

module.exports = { getNotifications, markOneRead };