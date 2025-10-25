const messageService = require("../services/messageService");

async function sendMessage(req, res) {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text) return res.status(400).json({ success: false, message: "receiverId and text required" });

    // Validate text length
    if (text.length > 1000) {
      return res.status(400).json({ success: false, message: "Message too long (max 1000 characters)" });
    }

    const msg = await messageService.sendMessage(req.user, receiverId, text);

    // real-time delivery via socket
    const io = req.app.get("io");
    if (io) {
      // Send to receiver's room
      io.to(String(receiverId)).emit("message:new", {
        ...msg.toObject(),
        sender: {
          _id: req.user._id,
          name: req.user.name,
          role: req.user.role,
          profilePic: req.user.profilePic
        }
      });
      
      // Send delivery confirmation to sender
      io.to(String(req.user._id)).emit("message:sent", {
        messageId: msg._id,
        receiverId,
        sentAt: msg.sentAt
      });
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