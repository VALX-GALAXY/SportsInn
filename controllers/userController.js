const User = require("../models/userModel");
const Notification = require("../models/notificationModel");


// Follow/Unfollow
async function followUser(req, res){
  try {
    const targetId = req.params.id;
    const userId = req.user.id;

    if (userId === targetId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    const user = await User.findById(userId);
    const target = await User.findById(targetId);

    if (!target) return res.status(404).json({ success: false, message: "User not found" });

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      // unfollow
      user.following.pull(targetId);
      target.followers.pull(userId);
    } else {
      // follow
      user.following.push(targetId);
      target.followers.push(userId);

      await Notification.create({
        userId: target._id,
        type: "follow",
        message: `${user.name} started following you`,
      });
    }

    await user.save();
    await target.save();

    res.json({ success: true, message: isFollowing ? "Unfollowed" : "Followed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Followers
async function getFollowers(req, res){
  const user = await User.findById(req.params.id).populate("followers", "name email role");
  res.json({ success: true, data: user.followers });
};

// Following
async function getFollowing(req, res){
  const user = await User.findById(req.params.id).populate("following", "name email role");
  res.json({ success: true, data: user.following });
};

async function searchUsers(req, res) {
  const { q } = req.query;
  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { role: { $regex: q, $options: "i" } }
    ]
  }).limit(10);

  res.json({ success: true, data: users });
};

module.exports = { followUser, getFollowers, getFollowing, searchUsers };
