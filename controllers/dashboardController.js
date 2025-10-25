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
      let rejectedCount = 0;
      let pendingCount = 0;
      
      tournaments.forEach(t => {
        const app = t.applicants.find(a => String(a.userId) === String(userId));
        if (app) {
          if (app.status === 'selected') selectedCount += 1;
          else if (app.status === 'rejected') rejectedCount += 1;
          else if (app.status === 'applied') pendingCount += 1;
        }
      });

      // Calculate percentages with zero-division protection
      const selectionRate = tournamentsApplied > 0 ? Math.round((selectedCount / tournamentsApplied) * 100) : 0;
      const rejectionRate = tournamentsApplied > 0 ? Math.round((rejectedCount / tournamentsApplied) * 100) : 0;

      // connectionCount: followers + following
      const followersCount = user.followers ? user.followers.length : 0;
      const followingCount = user.following ? user.following.length : 0;
      const connectionCount = followersCount + followingCount;

      // Posts count
      const Post = require('../models/postModel');
      const postsCount = await Post.countDocuments({ authorId: userId });

      return res.json({ 
        success: true, 
        data: { 
          tournamentsApplied, 
          selectedCount, 
          rejectedCount,
          pendingCount,
          selectionRate,
          rejectionRate,
          connectionCount,
          followersCount,
          followingCount,
          postsCount
        } 
      });
    }

    if (user.role === 'academy') {
      // academy stats: total players scouted, tournaments hosted
      const followersCount = user.followers ? user.followers.length : 0;
      const tournamentsHosted = await Tournament.countDocuments({ createdBy: userId });
      
      // Get total applications received across all tournaments
      const tournaments = await Tournament.find({ createdBy: userId }).lean();
      let totalApplications = 0;
      let totalSelected = 0;
      let totalRejected = 0;
      
      tournaments.forEach(t => {
        totalApplications += t.applicants.length;
        t.applicants.forEach(app => {
          if (app.status === 'selected') totalSelected += 1;
          else if (app.status === 'rejected') totalRejected += 1;
        });
      });

      // Calculate selection rate
      const selectionRate = totalApplications > 0 ? Math.round((totalSelected / totalApplications) * 100) : 0;

      return res.json({ 
        success: true, 
        data: { 
          trainees: followersCount, 
          tournamentsHosted,
          totalApplications,
          totalSelected,
          totalRejected,
          selectionRate
        } 
      });
    }

    if (user.role === 'scout') {
      // scout stats: applications reviewed, players scouted
      const followersCount = user.followers ? user.followers.length : 0;
      
      // Count tournaments where this scout made decisions
      const tournaments = await Tournament.find({ 'applicants.decidedBy': userId }).lean();
      let applicationsReviewed = 0;
      let decisionsMade = 0;
      
      tournaments.forEach(t => {
        t.applicants.forEach(app => {
          if (app.decidedBy && String(app.decidedBy) === String(userId)) {
            applicationsReviewed += 1;
            if (app.status === 'selected' || app.status === 'rejected') {
              decisionsMade += 1;
            }
          }
        });
      });

      return res.json({ 
        success: true, 
        data: { 
          applicationsReviewed,
          decisionsMade,
          playersScouted: followersCount
        } 
      });
    }

    if (user.role === 'club') {
      // club stats: tournaments hosted, players recruited
      const tournamentsHosted = await Tournament.countDocuments({ createdBy: userId });
      const followersCount = user.followers ? user.followers.length : 0;
      
      return res.json({ 
        success: true, 
        data: { 
          tournamentsHosted,
          playersRecruited: followersCount
        } 
      });
    }

    if (user.role === 'admin') {
      // admin stats: total users, tournaments, reports
      const totalUsers = await User.countDocuments();
      const totalTournaments = await Tournament.countDocuments();
      const Report = require('../models/reportModel');
      const totalReports = await Report.countDocuments();
      
      // User breakdown by role
      const userBreakdown = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      return res.json({ 
        success: true, 
        data: { 
          totalUsers,
          totalTournaments,
          totalReports,
          userBreakdown
        } 
      });
    }

    // default
    res.json({ success: true, data: {} });
  } catch (err) { 
    console.error('Dashboard stats error:', err);
    next(err); 
  }
}

module.exports = { academyFollowers, scoutSearchPlayers, getDashboardStats };
