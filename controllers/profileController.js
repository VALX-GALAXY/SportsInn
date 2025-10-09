const User = require("../models/userModel");
const profileService = require("../services/profileService");
const roleFields = require("../utils/roleFields");

async function getProfile(req, res) {
  const user = await profileService.getProfile(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
}

async function updateProfile(req, res, next) {
  try {
    const id = req.params.id;
    if (String(id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }
    
    // Role-based field restrictions
    const allowed = roleFields[req.user.role] || [];
    // exclude protected fields
    const protectedFields = ['passwordHash', 'email', 'role', 'refreshTokens', '_id', 'isAdmin'];
    const updates = {};

    // Handle uploaded image URL
    if (req.body.profilePic) updates.profilePic = req.body.profilePic;

    // Allow clearing profilePic if explicitly sent as empty string
    if (req.body.profilePic === "") {
      updates.profilePic = "";
    }

    for (const key of Object.keys(req.body)) {
      if (protectedFields.includes(key)) continue;
      // if role-specific list exists, only allow those fields (plus generic fields)
      if (allowed.length && !allowed.includes(key) && !['name', 'location', 'contactInfo', 'bio'].includes(key)) {
        // skip fields not allowed
        continue;
      }
      updates[key] = req.body[key];
    }

    // Validate required role fields: ensure required fields exist if provided empty
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash -refreshTokens');
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile };
