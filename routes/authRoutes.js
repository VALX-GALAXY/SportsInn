const express = require("express");
const router = express.Router();
const { signup, login, refresh, logout, adminLogin, adminSignup, googleAuth } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/admin/login", adminLogin);
router.post("/admin/signup", adminSignup);
router.post("/google", googleAuth);

module.exports = router;
