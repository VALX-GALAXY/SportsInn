const Message = require("../models/messageModel");

async function sendMessage(sender, receiverId, text) {
  const msg = new Message({
    senderId: sender._id,
    receiverId,
    text
  });
  await msg.save();
  return msg;
}

async function getConversation(userId, otherUserId, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  return Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  }).sort({ createdAt: 1 }).skip(skip).limit(limit);
}

module.exports = { sendMessage, getConversation };