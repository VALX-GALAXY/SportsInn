const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:id", authMiddleware, getProfile);
router.put("/:id", authMiddleware, updateProfile);

module.exports = router;
