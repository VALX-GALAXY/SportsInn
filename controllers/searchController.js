const User = require('../models/userModel');

// GET /api/search
// query params: role, name (partial), location (partial), ageMin, ageMax, page, limit
async function searchUsers(req, res) {
  try {
    const {
      role,
      name,
      location,
      ageMin,
      ageMax,
      page = 1,
      limit = 10
    } = req.query;

    // fetch all users then filter in-memory 
    const rawUsers = await User.find().select('-passwordHash -refreshTokens').lean();

    // in-memory filter
    let filtered = rawUsers.filter(u => {
      if (role && String(u.role) !== String(role)) return false;
      if (name && !String(u.name || '').toLowerCase().includes(String(name).toLowerCase())) return false;
      if (location && !String(u.location || '').toLowerCase().includes(String(location).toLowerCase())) return false;
      if (ageMin && (u.age === undefined || u.age < Number(ageMin))) return false;
      if (ageMax && (u.age === undefined || u.age > Number(ageMax))) return false;
      return true;
    });

    // pagination
    const total = filtered.length;
    const p = Math.max(1, Number(page));
    const l = Math.max(1, Number(limit));
    const start = (p - 1) * l;
    const paged = filtered.slice(start, start + l);

    res.json({ success: true, total, page: p, limit: l, data: paged });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { searchUsers };
