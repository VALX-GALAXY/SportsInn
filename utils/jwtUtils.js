// utils/jwtUtils.js
const jwt = require("jsonwebtoken");

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  console.warn("⚠️ JWT_SECRET or JWT_REFRESH_SECRET not set in environment.");
}

const ACCESS_EXP = process.env.ACCESS_TOKEN_EXP || "1h"; // change as needed
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXP || "7d";

function generateTokens(user) {
  // user may be mongoose doc or plain object
  const id = user._id ? String(user._id) : user.id || user.userId || user.sub;
  const payload = { id, role: user.role };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });

  return { accessToken, refreshToken };
}

// returns payload or null (never throws)
function verifyAccessToken(token) {
  try {
    if (!token) return null;
    const payload = jwt.verify(token, ACCESS_SECRET);
    return payload;
  } catch (err) {
    console.warn("JWT verifyAccessToken error:", err && err.message);
    return null;
  }
}

// returns payload or null
function verifyRefreshToken(token) {
  try {
    if (!token) return null;
    const payload = jwt.verify(token, REFRESH_SECRET);
    return payload;
  } catch (err) {
    console.warn("JWT verifyRefreshToken error:", err && err.message);
    return null;
  }
}

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };
