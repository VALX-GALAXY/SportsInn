const profileService = require("../services/profileService");

async function getProfile(req, res) {
  const user = await profileService.getProfile(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
}

async function updateProfile(req, res) {
  const result = await profileService.updateProfile(req.params.id, req.user, req.body);
  if (result.error) return res.status(403).json({ success: false, message: result.error });
  res.json({ success: true, data: result, message: "Profile updated" });
}

module.exports = { getProfile, updateProfile };
