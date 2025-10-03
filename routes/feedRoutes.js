const express = require("express");
const router = express.Router();
const { createPost, getFeed, toggleLike, deletePost, getPersonalizedFeed, addComment, getComments } = require("../controllers/feedController");

const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getFeed);
router.put("/:id/like", authMiddleware, toggleLike);
router.delete("/:id", authMiddleware, deletePost);
router.get("/personalized", authMiddleware, getPersonalizedFeed);
router.post("/:id/comment", authMiddleware, addComment);
router.get("/:id/comments", getComments);

module.exports = router;
