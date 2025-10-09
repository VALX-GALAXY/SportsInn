const Tournament = require('../models/tournamentModel');
const User = require("../models/userModel");

async function academyFollowers(req, res) {
  // list players who follow this academy (academy is owner)
  try {
    const academyId = req.user._id;
    if (req.user.role !== "academy") return res.status(403).json({ success: false, message: "Forbidden" });

    // find users where following includes academyId and role = player
    const players = await User.find({ following: academyId, role: "player" }).select("name email age playingRole");
    res.json({ success: true, data: players });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function scoutSearchPlayers(req, res) {
  try {
    if (req.user.role !== "scout") return res.status(403).json({ success: false, message: "Forbidden" });

    const { maxAge = 25, playingRole = "batsman", page = 1, limit = 50 } = req.query;
    const query = { role: "player", age: { $lt: parseInt(maxAge) } };
    if (playingRole) query.playingRole = playingRole;

    const players = await User.find(query).limit(parseInt(limit)).skip((page-1)*limit).select("name email age playingRole");
    res.json({ success: true, data: players });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'player') {
      // tournaments applied & selected
      const tournaments = await Tournament.find({ 'applicants.userId': userId }).lean();
      let tournamentsApplied = tournaments.length;
      let selectedCount = 0;
      tournaments.forEach(t => {
        const app = t.applicants.find(a => String(a.userId) === String(userId));
        if (app && app.status === 'selected') selectedCount += 1;
      });

      // connectionCount: we keep followers/following in user model
      const connectionCount = (user.followers ? user.followers.length : 0) + (user.following ? user.following.length : 0);

      return res.json({ success: true, data: { tournamentsApplied, selectedCount, connectionCount } });
    }

    if (user.role === 'academy') {
      // academy stats: total players scouted (maybe number of followers who are players), tournaments hosted
      const trainees = user.followers ? user.followers.length : 0;
      const tournamentsHosted = await Tournament.countDocuments({ createdBy: userId });
      return res.json({ success: true, data: { trainees, tournamentsHosted } });
    }

    if (user.role === 'scout') {
      // scout stats: applications reviewed - approximate by counting decisions where decision made by this scout? fallback: 0
      const applicationsReviewed = 0; // placeholder
      return res.json({ success: true, data: { applicationsReviewed } });
    }

    // default
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
}

module.exports = { academyFollowers, scoutSearchPlayers, getDashboardStats };
