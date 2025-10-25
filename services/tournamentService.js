const Tournament = require("../models/tournamentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const redis = require("../utils/redisClient");

const DEFAULT_TTL = Number(process.env.TOUR_CACHE_TTL) || 60; // seconds

async function invalidateTournamentsCache() {
  try {
    const client = redis.getClient && redis.getClient();
    if (!client) return;

    // Prefer scanIterator (node-redis v4)
    if (typeof client.scanIterator === "function") {
      const batch = [];
      for await (const k of client.scanIterator({ MATCH: "tournaments:*", COUNT: 100 })) {
        batch.push(k);
        if (batch.length >= 100) {
          try { await client.unlink(...batch); } catch (e) { await client.del(...batch); }
          batch.length = 0;
        }
      }
      if (batch.length) {
        try { await client.unlink(...batch); } catch (e) { await client.del(...batch); }
      }
      return;
    }

    // Fallback - KEYS (not recommended on large DBs)
    const keys = await client.keys("tournaments:*").catch(() => []);
    if (keys && keys.length) {
      try { await client.unlink(...keys); } catch (e) { await client.del(...keys); }
    }
  } catch (err) {
    console.warn("invalidateTournamentsCache error:", err && err.message ? err.message : err);
  }
}

async function createTournament(user, data, io) {
  const doc = new Tournament({
    title: data.title,
    entryFee: data.entryFee || 0,
    location: data.location || "",
    type: data.type || "",
    vacancies: data.vacancies || 0,
    deadline: data.deadline ? new Date(data.deadline) : null,
    createdBy: user._id
  });
  await doc.save();

  // notify all players
  const players = await User.find({ role: "player" }).select("_id");
  const notes = players.map(p => ({
    userId: p._id,
    message: `New tournament: ${doc.title}`,
    type: "tournament",
    isRead: false,
    createdAt: new Date()
  }));
  if (notes.length) {
    try { await Notification.insertMany(notes); } catch (e) { console.warn("Notification insertMany failed:", e && e.message ? e.message : e); }
  }

  // emit socket event
  if (io) {
    try { io.emit("notification:new", { message: `New tournament: ${doc.title}`, type: "tournament" }); } catch (e) {}
  }

  // Invalidate cache
  await invalidateTournamentsCache();

  return doc;
}

async function listTournaments(page = 1, limit = 10) {
  const p = Math.max(1, Number(page || 1));
  const l = Math.max(1, Number(limit || 10));
  const key = `tournaments:page=${p}:limit=${l}`;

  // Try redis cache
  try {
    const cached = await redis.get(key);
    if (cached) return cached;
  } catch (err) {
    // continue to DB
    console.warn("Redis read error (tournaments):", err && err.message ? err.message : err);
  }

  const skip = (p - 1) * l;
  const docs = await Tournament.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(l + 1)
    .lean();

  const hasMore = docs.length > l;
  const paged = hasMore ? docs.slice(0, l) : docs;
  const nextPage = hasMore ? p + 1 : null;

  const result = {
    page: p,
    limit: l,
    hasMore,
    nextPage,
    data: paged
  };

  // write to redis
  try {
    await redis.set(key, result, DEFAULT_TTL);
  } catch (err) {
    console.warn("Redis write error (tournaments):", err && err.message ? err.message : err);
  }

  return result;
}

async function getTournamentById(id) {
  return Tournament.findById(id).populate("createdBy", "name email").lean();
}

async function applyTournament(user, tournamentId) {
  const t = await Tournament.findById(tournamentId);
  if (!t) {
    const e = new Error("Tournament not found");
    e.status = 404;
    throw e;
  }

  // check deadline
  if (t.deadline && new Date() > new Date(t.deadline)) {
    const err = new Error("Application deadline has passed");
    err.status = 400;
    throw err;
  }

  // prevent duplicate
  const already = t.applicants.find(a => String(a.userId) === String(user._id));
  if (already) {
    const err = new Error("Already applied to this tournament");
    err.status = 400;
    throw err;
  }

  t.applicants.push({ userId: user._id, status: "applied", appliedAt: new Date() });
  await t.save();

  // notify tournament creator
  try {
    await Notification.create({
      userId: t.createdBy,
      message: `${user.name} applied to ${t.title}`,
      type: "application",
      fromUserId: user._id,
      isRead: false,
      createdAt: new Date()
    });
  } catch (e) {
    console.warn("Notification create failed:", e && e.message ? e.message : e);
  }

  // invalidate cache to reflect new applicant counts if UI shows them
  await invalidateTournamentsCache();

  return t;
}

async function getUserApplications(userId) {
  const docs = await Tournament.find({ "applicants.userId": userId })
    .sort({ createdAt: -1 })
    .lean();

  return docs.map(d => {
    const app = d.applicants.find(a => String(a.userId) === String(userId));
    return { tournament: d, application: app };
  });
}

async function decideApplication(tournamentId, playerId, decision, adminUser, io) {
  const t = await Tournament.findById(tournamentId);
  if (!t) {
    const err = new Error("Tournament not found");
    err.status = 404;
    throw err;
  }

  const applicant = t.applicants.find(a => String(a.userId) === String(playerId));
  if (!applicant) {
    const err = new Error("Application not found");
    err.status = 404;
    throw err;
  }

  if (applicant.status === decision) {
    return t; // no-op
  }

  applicant.status = decision;
  applicant.decidedAt = new Date();
  await t.save();

  // notify player
  const msg = decision === "selected" ? `You have been selected for ${t.title}` : `You have been rejected for ${t.title}`;
  const note = await Notification.create({
    userId: playerId,
    message: msg,
    type: "decision",
    fromUserId: adminUser._id,
    isRead: false,
    createdAt: new Date()
  });

  // emit to player room
  if (io) {
    try { io.to(String(playerId)).emit("notification:new", note); } catch (e) {}
  }

  // invalidate tournaments cache (if listing shows statuses)
  await invalidateTournamentsCache();

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