const jwt = require("jsonwebtoken");

function generateTokens(user) {
  const payload = { id: user._id, role: user.role };

  // Access token expires in 7 days for better user experience
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

  return { accessToken, refreshToken };
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (ex) {
    return null;
  }
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (ex) {
    return null;
  }
}

module.exports = { generateTokens, verifyRefreshToken, verifyAccessToken };
