const Tournament = require("../models/tournamentModel");
const Notification = require("../models/notificationModel");

// Simple in-memory cache for listing tournaments
const cache = new Map();
const CACHE_TTL = 1000 * 60; // 1 min

async function createTournament(user, data, io) {
  const tournament = await Tournament.create({
    title: data.title,
    entryFee: data.entryFee,
    location: data.location,
    type: data.type,
    vacancies: data.vacancies,
    createdBy: user._id
  });

  // mock notification trigger → notify all players
  const message = `New tournament "${tournament.title}" is now open for entries!`;
  await Notification.create({
    userId: null, // generic broadcast
    message,
    type: "tournament",
    createdAt: new Date(),
    isRead: false
  });

  if (io) io.emit("notification:new", { message, type: "tournament" });

  return tournament;
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

async function applyTournament(user, id) {
  const tournament = await Tournament.findById(id);
  if (!tournament) throw new Error("Tournament not found");

  // check if already applied
  if (tournament.applicants.includes(user._id))
    throw new Error("Already applied");

  tournament.applicants.push(user._id);
  await tournament.save();

  // notify creator
  await Notification.create({
    userId: tournament.createdBy,
    message: `${user.name} applied for ${tournament.title}`,
    type: "application",
    createdAt: new Date(),
    isRead: false
  });

  return tournament;
}

module.exports = { createTournament, listTournaments, applyTournament };
