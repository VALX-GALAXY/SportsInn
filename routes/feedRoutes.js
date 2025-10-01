const express = require("express");
const router = express.Router();
const { createPost, getFeed, toggleLike, deletePost } = require("../controllers/feedController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getFeed);
router.put("/:id/like", authMiddleware, toggleLike);
router.delete("/:id", authMiddleware, deletePost);

module.exports = router;
