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

module.exports = { academyFollowers, scoutSearchPlayers };
