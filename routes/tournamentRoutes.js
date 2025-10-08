const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");
const authMiddleware = require("../middlewares/authMiddleware");
const { roleCheck }= require("../middlewares/roleMiddleware");

// admin, academy, club can create tournaments
router.post("/", authMiddleware, roleCheck(["admin", "academy", "club"]), tournamentController.createTournament);

// anyone can view tournaments
router.get("/", tournamentController.listTournaments);

// players/clubs can apply
router.post("/apply/:id", authMiddleware, tournamentController.applyTournament);

module.exports = router;
