// middlewares/authMiddleware.js
const { verifyAccessToken } = require("../utils/jwtUtils");
const User = require("../models/userModel");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

<<<<<<< HEAD
    let decoded;
    try {
      // Validate token format before verification
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error("JWT format error: Invalid token structure");
        return res.status(401).json({ 
          success: false, 
          message: "Invalid token format", 
          code: "INVALID_TOKEN_FORMAT" 
        });
      }

      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      // Provide helpful server-side logs for debugging (don't leak secret details to client)
      console.error("JWT verify error:", jwtErr && jwtErr.name, jwtErr && jwtErr.message);
      console.error("Token preview:", token.substring(0, 20) + "...");
      
      if (jwtErr.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false, 
          message: "Token expired", 
          code: "TOKEN_EXPIRED",
          shouldRefresh: true 
        });
      }
      
      if (jwtErr.name === "JsonWebTokenError") {
        // Check if it's a signature error specifically
        if (jwtErr.message.includes("invalid signature")) {
          console.error("JWT signature verification failed - possible secret mismatch");
          return res.status(401).json({ 
            success: false, 
            message: "Token signature invalid", 
            code: "INVALID_SIGNATURE" 
          });
        }
        
        if (jwtErr.message.includes("jwt malformed")) {
          console.error("JWT malformed - invalid token structure");
          return res.status(401).json({ 
            success: false, 
            message: "Token malformed", 
            code: "MALFORMED_TOKEN" 
          });
        }
        
        return res.status(401).json({ 
          success: false, 
          message: "Invalid token format", 
          code: "INVALID_TOKEN" 
        });
      }
      
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token", 
        code: "INVALID_TOKEN" 
      });
=======
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      // helpful server-side log for debugging
      console.warn("authMiddleware: token verification failed (null payload)");
      return res.status(403).json({ success: false, message: "Invalid token" });
>>>>>>> origin/backend/day2-auth
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
