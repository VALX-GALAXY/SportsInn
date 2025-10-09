const Tournament = require("../models/tournamentModel");
const Notification = require("../models/notificationModel");

// Simple in-memory cache for listing tournaments
const cache = new Map();
const CACHE_TTL = 1000 * 60; // 1 min

async function createTournament(user, data, io) {
  // ensure only admin/academy/club callers call via middleware
  const doc = new Tournament({
    title: data.title,
    entryFee: data.entryFee || 0,
    location: data.location || '',
    type: data.type || '',
    vacancies: data.vacancies || 0,
    deadline: data.deadline ? new Date(data.deadline) : null,
    createdBy: user._id
  });
  await doc.save();

  // mock notify all players (create notifications per player)
  const players = await User.find({ role: 'player' }).select('_id');
  const notes = players.map(p => ({
    userId: p._id,
    message: `New tournament: ${doc.title}`,
    type: 'tournament'
  }));
  if (notes.length) await Notification.insertMany(notes);

  // emit socket globally (or per-room) if io exists
  if (io) io.emit('notification:new', { message: `New tournament: ${doc.title}`, type: 'tournament' });

  return doc;
}

async function listTournaments(page = 1, limit = 10) {
  const key = `page:${page}-limit:${limit}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.data; // return cached data
  }

  const skip = (page - 1) * limit;
  const tournaments = await Tournament.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  cache.set(key, { data: tournaments, time: Date.now() });
  return tournaments;
}

async function getTournamentById(id) {
  const t = await Tournament.findById(id).populate('createdBy', 'name email');
  return t;
}


async function applyTournament(user, tournamentId) {
  const t = await Tournament.findById(tournamentId);
  if (!t) throw new Error('Tournament not found');

  // deadline check
  if (t.deadline && new Date() > new Date(t.deadline)) {
    const err = new Error('Application deadline has passed');
    err.status = 400;
    throw err;
  }

  // prevent duplicate
  const already = t.applicants.find(a => String(a.userId) === String(user._id));
  if (already) {
    const err = new Error('Already applied to this tournament');
    err.status = 400;
    throw err;
  }

  t.applicants.push({ userId: user._id, status: 'applied' });
  await t.save();

  // notify tournament creator
  await Notification.create({
    userId: t.createdBy,
    message: `${user.name} applied to ${t.title}`,
    type: 'application',
    fromUserId: user._id
  });

  return t;
}

async function getUserApplications(userId) {
  // Find tournaments where applicants contain userId
  const docs = await Tournament.find({ 'applicants.userId': userId })
    .sort({ createdAt: -1 })
    .lean();
  // filter to include status for that user
  const result = docs.map(d => {
    const app = d.applicants.find(a => String(a.userId) === String(userId));
    return { tournament: d, application: app };
  });
  return result;
}

async function decideApplication(tournamentId, playerId, decision, adminUser, io) {
  // decision: 'selected' | 'rejected'
  const t = await Tournament.findById(tournamentId);
  if (!t) throw new Error('Tournament not found');

  const applicant = t.applicants.find(a => String(a.userId) === String(playerId));
  if (!applicant) {
    const err = new Error('Application not found');
    err.status = 404;
    throw err;
  }

  if (applicant.status === decision) {
    return t; // no change
  }

  applicant.status = decision;
  applicant.decidedAt = new Date();
  await t.save();

  // notify player
  const msg = decision === 'selected'
    ? `You have been selected for ${t.title}`
    : `You have been rejected for ${t.title}`;

  const note = await Notification.create({
    userId: playerId,
    message: msg,
    type: 'decision',
    fromUserId: adminUser._id
  });

  if (io) io.to(String(playerId)).emit('notification:new', note);

  return t;
}

module.exports = {
  createTournament,
  listTournaments,
  getTournamentById,
  applyTournament,
  getUserApplications,
  decideApplication
};
