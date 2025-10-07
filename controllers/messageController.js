const messageService = require("../services/messageService");

async function sendMessage(req, res) {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) return res.status(400).json({ success: false, message: "receiverId and text required" });

    const msg = await messageService.sendMessage(req.user, receiverId, text);

    // real-time delivery via socket
    const io = req.app.get("io");
    if (io) {
      io.to(String(receiverId)).emit("message:new", msg);
    }

    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getConversation(req, res) {
  try {
    const otherUserId = req.params.userId;
    const page = parseInt(req.query.page) || 1;

    const result = await messageService.getConversation(req.user._id, otherUserId, page, 10);

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function markAsRead(req, res, next) {
  try {
    const messageId = req.params.id;
    const msg = await messageService.markMessageRead(messageId, req.user._id);
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
}

module.exports = { sendMessage, getConversation, markAsRead };