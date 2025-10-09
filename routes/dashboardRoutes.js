const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { academyFollowers, scoutSearchPlayers } = require("../controllers/dashboardController");
const analytics = require('../controllers/analyticsController');
const { getDashboardStats } = require("../controllers/dashboardController");

// Dashboard routes
router.get("/academy/followers", auth, academyFollowers);
router.get("/scout/players", auth, scoutSearchPlayers);

// Analytics routes
router.get('/analytics/player/:id', auth, analytics.playerAnalytics);
router.get('/analytics/academy/:id', auth, analytics.academyAnalytics);
router.get('/analytics/scout/:id', auth, analytics.scoutAnalytics);

router.get("/:userId", auth, getDashboardStats);


module.exports = router;
