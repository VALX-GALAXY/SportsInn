// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { sendMessage, getConversation, markAsRead } = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, sendMessage);
router.get("/:userId", auth, getConversation);
router.put("/read/:id", auth, markAsRead);

module.exports = router;
