const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const feedController = require("../controllers/feedController");

const authMiddleware = require("../middlewares/authMiddleware");

const uploadDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});
const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("media"), feedController.uploadMedia);

router.post("/", authMiddleware, feedController.  createPost);
router.get("/", authMiddleware, feedController.getFeed);

router.post("/:id/like", authMiddleware, feedController.likePost);
router.post("/:id/unlike", authMiddleware, feedController.unlikePost);
router.put("/:id/toggle-like", authMiddleware, feedController.toggleLike);

router.delete("/:id", authMiddleware, feedController.deletePost);
router.get("/personalized", authMiddleware, feedController.getPersonalizedFeed);
router.post("/:id/comment", authMiddleware, feedController.addComment);
router.get("/:id/comments", authMiddleware, feedController.getComments);

module.exports = router;
