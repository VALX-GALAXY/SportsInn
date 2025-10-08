const tournamentService = require("../services/tournamentService");

async function createTournament(req, res) {
  try {
    const io = req.app.get("io");
    const result = await tournamentService.createTournament(req.user, req.body, io);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function listTournaments(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await tournamentService.listTournaments(page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function applyTournament(req, res) {
  try {
    const result = await tournamentService.applyTournament(req.user, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

module.exports = { createTournament, listTournaments, applyTournament };
