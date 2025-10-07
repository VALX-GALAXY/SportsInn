const express = require("express");
const { getNotifications, markOneRead } = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);       // ?page=&limit=
router.put("/read/:id", authMiddleware, markOneRead);

module.exports = router;
