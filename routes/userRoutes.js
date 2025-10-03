const express = require("express");
const { followUser, getFollowers, getFollowing, searchUsers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// follow/unfollow
router.post("/:id/follow", authMiddleware, followUser);

// followers list
router.get("/:id/followers", getFollowers);

// following list
router.get("/:id/following", getFollowing);


// search users
router.get("/search", searchUsers);

module.exports = router;
