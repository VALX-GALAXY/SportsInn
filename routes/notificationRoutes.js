const express = require("express");
const { getNotifications, markOneRead } = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getNotifications);       // ?page=&limit=
router.get('/:userId', authMiddleware, getNotifications);

router.put("/read/:id", authMiddleware, markOneRead);   // both routes exposed as of now 
// router.patch('/:id/read', authMiddleware, markOneRead); // alternate route

module.exports = router;
