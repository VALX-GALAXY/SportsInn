// middlewares/authMiddleware.js
const { verifyAccessToken } = require("../utils/jwtUtils");
const User = require("../models/userModel");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      // helpful server-side log for debugging
      console.warn("authMiddleware: token verification failed (null payload)");
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    // accept multiple naming conventions used across code
    const userId = decoded.id || decoded._id || decoded.userId || decoded.sub;
    if (!userId) {
      console.warn("authMiddleware: decoded token missing user id", decoded);
      return res.status(403).json({ success: false, message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("authMiddleware: user not found for id", userId);
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    return next();
  } catch (err) {
    console.error("authMiddleware error:", err && err.message);
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
}

module.exports = authMiddleware;
