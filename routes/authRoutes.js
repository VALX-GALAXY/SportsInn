const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  refreshToken,
  logout,
  updateProfile,
} = require("../controllers/authController");

const auth = require("../middlewares/authMiddleware");
const roleCheck = require("../middlewares/roleMiddleware");

router.post("/signup", signup);
router.post("/login", login);

router.post("/refresh", refreshToken);
router.post("/logout", logout);

router.put("/profile", auth, updateProfile);

module.exports = router;
