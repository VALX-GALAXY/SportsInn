const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const feedController = require("../controllers/feedController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");


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

router.get("/:id", authMiddleware, profileController.getProfile);
router.put("/:id", authMiddleware, profileController.updateProfile);
router.post("/:id/picture", authMiddleware, upload.single("profilePic"), profileController.uploadProfilePicture);
router.get("/:id/posts", authMiddleware, feedController.getPostsByUser);

// Convenience endpoints for frontend to get/update current user
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    // forward to controller (getProfile expects req.params.id)
    req.params.id = req.user._id;
    return await getProfile(req, res, next);
  } catch (err) { next(err); }
});

router.put("/", authMiddleware, async (req, res, next) => {
  try {
    req.params.id = req.user._id;
    return await updateProfile(req, res, next);
  } catch (err) { next(err); }
});

module.exports = router;
