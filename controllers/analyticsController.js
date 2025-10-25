const User = require('../models/userModel');
const Tournament = require('../models/tournamentModel');
const Post = require('../models/postModel');
const Message = require('../models/messageModel');

// GET /api/analytics/player/:id
async function playerAnalytics(req, res) {
  try {
    const playerId = req.params.id;
    const user = await User.findById(playerId);
    if (!user || user.role !== 'player') {
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    // Tournament performance
    const tournaments = await Tournament.find({ 'applicants.userId': playerId }).lean();
    let tournamentsApplied = tournaments.length;
    let selectedCount = 0;
    let rejectedCount = 0;
    
    tournaments.forEach(t => {
      const app = t.applicants.find(a => String(a.userId) === String(playerId));
      if (app) {
        if (app.status === 'selected') selectedCount += 1;
        else if (app.status === 'rejected') rejectedCount += 1;
      }
    });

    const selectionRate = tournamentsApplied > 0 ? Math.round((selectedCount / tournamentsApplied) * 100) : 0;

    // Social engagement
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;
    const postsCount = await Post.countDocuments({ authorId: playerId });

    // Calculate total likes received
    const posts = await Post.find({ authorId: playerId }).select('likes');
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes ? post.likes.length : 0), 0);

    // Calculate total comments received
    const postsWithComments = await Post.find({ authorId: playerId }).select('comments');
    const totalComments = postsWithComments.reduce((sum, post) => sum + (post.comments ? post.comments.length : 0), 0);

    // Activity metrics
    const messagesSent = await Message.countDocuments({ senderId: playerId });
    const messagesReceived = await Message.countDocuments({ receiverId: playerId });

    const data = {
      tournamentPerformance: {
        tournamentsApplied,
        selectedCount,
        rejectedCount,
        selectionRate
      },
      socialEngagement: {
        followersCount,
        followingCount,
        postsCount,
        totalLikes,
        totalComments
      },
      activity: {
        messagesSent,
        messagesReceived,
        totalConnections: followersCount + followingCount
      }
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/analytics/academy/:id
async function academyAnalytics(req, res) {
  try {
    const academyId = req.params.id;
    const user = await User.findById(academyId);
    if (!user || user.role !== 'academy') {
      return res.status(404).json({ success: false, message: 'Academy not found' });
    }

    // Tournament hosting stats
    const tournaments = await Tournament.find({ createdBy: academyId }).lean();
    const tournamentsHosted = tournaments.length;
    
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

    const selectionRate = totalApplications > 0 ? Math.round((totalSelected / totalApplications) * 100) : 0;

    // Trainee stats
    const traineesCount = user.followers ? user.followers.length : 0;
    
    // Calculate average applications per tournament
    const avgApplicationsPerTournament = tournamentsHosted > 0 ? Math.round(totalApplications / tournamentsHosted) : 0;

    // Revenue estimation (entry fees)
    const totalRevenue = tournaments.reduce((sum, t) => sum + (t.entryFee * t.applicants.length), 0);

    const data = {
      tournamentHosting: {
        tournamentsHosted,
        totalApplications,
        totalSelected,
        totalRejected,
        selectionRate,
        avgApplicationsPerTournament
      },
      trainees: {
        traineesCount
      },
      revenue: {
        totalRevenue,
        avgRevenuePerTournament: tournamentsHosted > 0 ? Math.round(totalRevenue / tournamentsHosted) : 0
      }
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/analytics/scout/:id
async function scoutAnalytics(req, res) {
  try {
    const scoutId = req.params.id;
    const user = await User.findById(scoutId);
    if (!user || user.role !== 'scout') {
      return res.status(404).json({ success: false, message: 'Scout not found' });
    }

    // Applications reviewed
    const tournaments = await Tournament.find({ 'applicants.decidedBy': scoutId }).lean();
    let applicationsReviewed = 0;
    let decisionsMade = 0;
    let selectionsMade = 0;
    let rejectionsMade = 0;
    
    tournaments.forEach(t => {
      t.applicants.forEach(app => {
        if (app.decidedBy && String(app.decidedBy) === String(scoutId)) {
          applicationsReviewed += 1;
          if (app.status === 'selected' || app.status === 'rejected') {
            decisionsMade += 1;
            if (app.status === 'selected') selectionsMade += 1;
            else if (app.status === 'rejected') rejectionsMade += 1;
          }
        }
      });
    });

    const selectionRate = decisionsMade > 0 ? Math.round((selectionsMade / decisionsMade) * 100) : 0;

    // Players scouted
    const playersScouted = user.followers ? user.followers.length : 0;

    // Activity metrics
    const messagesSent = await Message.countDocuments({ senderId: scoutId });
    const messagesReceived = await Message.countDocuments({ receiverId: scoutId });

    const data = {
      scoutingActivity: {
        applicationsReviewed,
        decisionsMade,
        selectionsMade,
        rejectionsMade,
        selectionRate
      },
      network: {
        playersScouted,
        messagesSent,
        messagesReceived
      }
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { playerAnalytics, academyAnalytics, scoutAnalytics };