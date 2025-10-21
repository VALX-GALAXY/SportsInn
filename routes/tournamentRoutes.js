const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const authMiddleware = require("../middlewares/authMiddleware");
const { roleCheck }= require("../middlewares/roleMiddleware");

// admin, academy, club can create tournaments
router.post("/", authMiddleware, roleCheck(["admin", "academy", "club"]), tournamentController.createTournament);

// anyone can view tournaments
router.get("/", tournamentController.listTournaments);


// Get by id
router.get('/:id', tournamentController.getTournament);


// Apply (player)
router.post('/apply/:id', authMiddleware, roleCheck(['player','club','academy']), tournamentController.applyTournament);
// (alternative path: POST /api/tournaments/apply/:id) keep both
router.post('/apply', authMiddleware, roleCheck(['player','club','academy']), tournamentController.applyTournament);

// Get user's applications
router.get('/user/:id', authMiddleware, tournamentController.getUserTournaments);

// Admin approve / reject
router.patch('/:id/approve/:playerId', authMiddleware, roleCheck(['admin']), tournamentController.approvePlayer);
router.patch('/:id/reject/:playerId', authMiddleware, roleCheck(['admin']), tournamentController.rejectPlayer);

module.exports = router;
