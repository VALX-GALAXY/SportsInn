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

// Token validation endpoint for debugging
async function validateToken(req, res) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1].trim();
    const jwt = require("jsonwebtoken");
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await require("../models/userModel").findById(decoded.id).select("-passwordHash -refreshTokens");
      
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      return res.json({ 
        success: true, 
        message: "Token is valid",
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          tokenInfo: {
            expiresAt: new Date(decoded.exp * 1000),
            issuedAt: new Date(decoded.iat * 1000),
            timeRemaining: Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
          }
        }
      });
    } catch (jwtErr) {
      return res.status(401).json({ 
        success: false, 
        message: jwtErr.message,
        code: jwtErr.name 
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Google OAuth2 authentication
async function googleAuth(req, res) {
  try {
    console.log("Starting Google OAuth process with body:", {
      ...req.body,
      idToken: req.body.idToken ? '[REDACTED]' : undefined
    });

    const { 
      idToken, 
      role,
      sport,
      gender = 'Prefer not to say',
      cricketRole
    } = req.body;

    // Validate required fields
    if (!idToken) {
      return res.status(400).json({ 
        success: false, 
        message: "idToken required" 
      });
    }

    // Verify Google token format first
    if (!idToken.includes('.') || idToken.split('.').length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google ID token format. A valid token should be a JWT containing three segments separated by dots.",
        details: process.env.NODE_ENV === 'development' ? {
          expected: "header.payload.signature",
          received: idToken,
          help: "This error usually occurs when testing with a placeholder token. You need to use a real Google ID token obtained from Google Sign-In."
        } : undefined
      });
    }

    // Verify Google token
    let payload;
    try {
      payload = await verifyIdToken(idToken);
      console.log("Google token verified successfully for email:", payload.email);
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError);
      return res.status(401).json({ 
        success: false, 
        message: verifyError.message,
        details: process.env.NODE_ENV === 'development' ? {
          error: verifyError.message,
          stack: verifyError.stack,
          help: "Make sure you're using a fresh token from Google Sign-In and that your GOOGLE_CLIENT_ID matches the one used to obtain the token."
        } : undefined
      });
    }

    if (!payload) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid Google token" 
      });
    }

    // Verify email is validated by Google
    if (!payload.email_verified) {
      return res.status(400).json({ 
        success: false, 
        message: "Google email not verified" 
      });
    }

    // Validate sport field if this is a new registration
    if (!sport) {
      return res.status(400).json({
        success: false,
        message: "Sport is required for registration"
      });
    }

    // Validate cricket role if sport is Cricket
    if (sport === 'Cricket' && !cricketRole) {
      return res.status(400).json({
        success: false,
        message: "Cricket role is required when sport is Cricket"
      });
    }

    if (sport === 'Cricket' && cricketRole) {
      const validCricketRoles = ['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];
      if (!validCricketRoles.includes(cricketRole)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cricket role. Must be one of: Batsman, Bowler, All-Rounder, Wicket-Keeper"
        });
      }
    }

    // Validate gender if provided
    if (gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender value. Must be one of: Male, Female, Other, Prefer not to say"
      });
    }

    const result = await authService.loginWithGoogle({
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role,
      sport,
      gender,
      cricketRole: sport === 'Cricket' ? cricketRole : undefined
    });

    if (result.error) {
      return res.status(400).json({ 
        success: false, 
        message: result.error 
      });
    }

    // Enhanced success response
    return res.json({ 
      success: true, 
      data: {
        ...result,
        user: {
          ...result.user,
          sport,
          gender,
          cricketRole: sport === 'Cricket' ? cricketRole : undefined
        }
      }, 
      message: "Google login successful" 
    });

  } catch (err) {
    console.error("Google Auth Error:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    
    // Determine if it's a validation error or system error
    const isValidationError = err.message.includes('required') || 
                            err.message.includes('invalid') ||
                            err.message.includes('Cricket role');
    
    return res.status(isValidationError ? 400 : 500).json({ 
      success: false, 
      message: isValidationError ? err.message : "An error occurred during Google authentication",
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack,
        code: err.code
      } : undefined
    });
  }
}

module.exports = { signup, login, adminSignup, adminLogin, refresh, logout, googleAuth, validateToken };
