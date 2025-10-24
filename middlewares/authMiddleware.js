// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function authMiddleware(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT secret is not set in process.env");
      return res.status(500).json({ success: false, message: "Server misconfiguration" });
    }

    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization header missing or malformed" });
    }

    const token = authHeader.split(" ")[1].trim();
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

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
    }

    // Support either 'id' or '_id' in payload just in case
    const userId = decoded.id || decoded._id;
    if (!userId) {
      console.error("JWT payload missing user id:", decoded);
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-passwordHash -refreshTokens");
    if (!user) {
      console.error("Auth: user not found for id:", userId);
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware unexpected error:", err);
    res.status(500).json({ success: false, message: "Authentication error" });
  }
}

module.exports = authMiddleware;
