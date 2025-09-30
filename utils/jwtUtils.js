const jwt = require("jsonwebtoken");

// NOTE: in production use process.env values
const ACCESS_SECRET = process.env.ACCESS_SECRET || "access_secret_example";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret_example";

function generateAccessToken(payload) {
  // short lived
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(payload) {
  // longer lived
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
