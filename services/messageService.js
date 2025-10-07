const Message = require("../models/messageModel");

async function sendMessage(sender, receiverId, text) {
  const msg = new Message({
    senderId: sender._id,
    receiverId,
    text,
    sentAt: new Date()
  });
  await msg.save();
  return msg;
}

async function getConversation(userId, otherUserId, page = 1, limit = 10) {
  const skip = (Math.max(1, page) - 1) * Math.max(1, limit);

  const filter = {
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId }
    ]
  };

  const total = await Message.countDocuments(filter);

  const messages = await Message.find(filter)
    .sort({ sentAt: 1 }) // oldest first
    .skip(skip)
    .limit(Number(limit));

  const hasMore = skip + messages.length < total;

  return {
    messages,
    pagination: {
      currentPage: page,
      nextPage: hasMore ? page + 1 : null,
      hasMore
    }
  };
}

async function markMessageRead(messageId, userId) {
  // Only receiver can mark as read
  const msg = await Message.findById(messageId);
  if (!msg) throw new Error('Message not found');
  if (String(msg.receiverId) !== String(userId)) {
    const err = new Error('Not allowed');
    err.status = 403;
    throw err;
  }
  msg.read = true;
  await msg.save();
  return msg;
}

module.exports = { sendMessage, getConversation, markMessageRead };