const User = require("../models/userModel");
const roleFields = require("../utils/roleFields");

async function getProfile(id) {
  return User.findById(id).select("-passwordHash -refreshTokens");
}

async function updateProfile(id, requester, body) {
  if (String(id) !== String(requester._id)) {
    return { error: "You can only update your own profile" };
  }

  // Build allowedFields from roleFields but allow generic 'bio' too
  const allowedFieldsFromRole = (roleFields[requester.role] || []).filter(f => !["passwordHash", "email", "role"].includes(f));
  const allowedFields = new Set([...allowedFieldsFromRole, "name", "location", "contactInfo", "bio"]);

  const updates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-passwordHash -refreshTokens");
  return user;
}

module.exports = { getProfile, updateProfile };
