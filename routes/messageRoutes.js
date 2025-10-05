// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const { sendMessage, getConversation } = require("../controllers/messageController");
const auth = require("../middlewares/authMiddleware");

router.post("/", auth, sendMessage);
router.get("/:userId", auth, getConversation);

module.exports = router;
