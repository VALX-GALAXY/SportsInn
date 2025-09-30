const {
  signupService,
  loginService,
  refreshService,
  logoutService,
  updateProfileService,
} = require("../services/authService");

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { user, error } = await signupService(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    return res.status(201).json({ success: true, data: user, message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { data, error } = await loginService(req.body);
    if (error) return res.status(400).json({ success: false, message: error });
    return res.json({ success: true, data, message: "Login successful" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/refresh
async function refreshToken(req, res) {
  try {
    const { refreshToken: token } = req.body;
    const { accessToken, error } = await refreshService(token);
    if (error) return res.status(401).json({ success: false, message: error });
    return res.json({ success: true, data: { accessToken }, message: "Token refreshed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/auth/logout
async function logout(req, res) {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Refresh token required" });
    const removed = await logoutService(token);
    if (!removed) return res.status(400).json({ success: false, message: "Invalid refresh token" });
    return res.json({ success: true, data: null, message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const payload = req.body;
    const { updated, error } = await updateProfileService(userId, payload);
    if (error) return res.status(400).json({ success: false, message: error });
    return res.json({ success: true, data: updated, message: "Profile updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { signup, login, refreshToken, logout, updateProfile };
