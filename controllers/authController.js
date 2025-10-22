const authService = require("../services/authService");
const { verifyIdToken } = require("../utils/googleVerify");

async function signup(req, res) {
  const result = await authService.signup(req.body);
  if (result.error) return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, data: result.user, message: "User registered successfully" });
}

async function login(req, res) {
  const result = await authService.login(req.body);
  if (result.error) return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, data: result, message: "Login successful" });
}

// Admin signup
async function adminSignup(req, res) {
  try {
    const result = await authService.adminSignup(req.body);
    if (result.error) return res.status(400).json({ success: false, message: result.error });
    res.json({ success: true, data: result.user, message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


// Admin login
async function adminLogin(req, res) {
  const result = await authService.adminLogin(req.body);
  if (result.error)
    return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, data: result, message: "Admin login successful" });
}

async function refresh(req, res) {
  const result = await authService.refresh(req.body.refreshToken);
  if (result.error) return res.status(401).json({ success: false, message: result.error });
  res.json({ success: true, data: result, message: "Token refreshed" });
}

async function logout(req, res) {
  const result = await authService.logout(req.body.refreshToken);
  if (result.error) return res.status(400).json({ success: false, message: result.error });
  res.json({ success: true, message: "Logged out successfully" });
}

// Google OAuth2 authentication
async function googleAuth(req, res) {
  try {
    const { idToken, role } = req.body;
    if (!idToken) return res.status(400).json({ success: false, message: "idToken required" });

    const payload = await verifyIdToken(idToken);
    if (!payload) return res.status(400).json({ success: false, message: "Invalid Google token" });

    if (!payload.email_verified) {
      // you can relax this if necessary, but recommended to require verified email
      return res.status(400).json({ success: false, message: "Google email not verified" });
    }

    const result = await authService.loginWithGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role // optional: front can suggest a role
    });

    if (result.error) return res.status(400).json({ success: false, message: result.error });

    return res.json({ success: true, data: result, message: "Google login successful" });
  } catch (err) {
    console.error("googleAuth error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { signup, login, adminSignup, adminLogin, refresh, logout, googleAuth };
