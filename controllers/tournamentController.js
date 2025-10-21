const tournamentService = require('../services/tournamentService');

async function createTournament(req, res, next) {
  try {
    const io = req.app.get('io');
    const doc = await tournamentService.createTournament(req.user, req.body, io);
    res.status(201).json({ success: true, data: doc });
  } catch (err) { next(err); }
}

async function listTournaments(req, res, next) {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const result = await tournamentService.listTournaments(page, limit);
    res.json({ success: true, page: result.page, limit: result.limit, data: result.data });
  } catch (err) { next(err); }
}

async function getTournament(req, res, next) {
  try {
    const doc = await tournamentService.getTournamentById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Tournament not found' });
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
}

async function applyTournament(req, res, next) {
  try {
    const doc = await tournamentService.applyTournament(req.user,  req.params.id || req.body.tournamentId);
    res.json({ success: true, data: doc, message: 'Applied successfully' });
  } catch (err) { next(err); }
}

async function getUserTournaments(req, res, next) {
  try {
    const result = await tournamentService.getUserApplications(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

async function approvePlayer(req, res, next) {
  try {
    const io = req.app.get('io');
    const t = await tournamentService.decideApplication(req.params.id, req.params.playerId, 'selected', req.user, io);
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
}

async function rejectPlayer(req, res, next) {
  try {
    const io = req.app.get('io');
    const t = await tournamentService.decideApplication(req.params.id, req.params.playerId, 'rejected', req.user, io);
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
}

module.exports = {
  createTournament,
  listTournaments,
  getTournament,
  applyTournament,
  getUserTournaments,
  approvePlayer,
  rejectPlayer
};
