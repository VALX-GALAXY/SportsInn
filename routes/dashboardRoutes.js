const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { academyFollowers, scoutSearchPlayers } = require("../controllers/dashboardController");

router.get("/academy/followers", auth, academyFollowers);
router.get("/scout/players", auth, scoutSearchPlayers);

module.exports = router;
