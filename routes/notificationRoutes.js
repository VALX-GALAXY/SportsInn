const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, notificationController.getNotifications);       // ?page=&limit=
// unread count
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);

router.get('/:userId', authMiddleware, notificationController.getNotifications);

router.put("/read/:id", authMiddleware, notificationController.markOneRead);   // both routes exposed as of now 
// router.patch('/:id/read', authMiddleware, markOneRead); // alternate route

// mark all as read
router.patch("/read-all", authMiddleware, notificationController.markAllRead);


module.exports = router;
