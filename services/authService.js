const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { generateTokens, verifyRefreshToken } = require("../utils/jwtUtils");
const { validateSignup } = require("../utils/validation");

// Token refresh queue to prevent race conditions
const refreshQueue = new Map(); // Map of userId -> Promise<{accessToken, refreshToken}>

// Cleanup old entries from the queue every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, promise] of refreshQueue.entries()) {
    // If a promise has been in the queue for more than 5 minutes, remove it
    if (promise._timestamp && (now - promise._timestamp) > 300000) {
      console.log(`Cleaning up stale refresh queue entry for user ${userId}`);
      refreshQueue.delete(userId);
    }
  }
}, 300000); // 5 minutes

async function signup(body) {
  const error = validateSignup(body);
  if (error) return { error };

  const existing = await User.findOne({ email: body.email });
  if (existing) return { error: "Email already exists" };

  const { gender = 'Prefer not to say', sport, cricketRole } = body;
  const passwordHash = await bcrypt.hash(body.password, 10);
  
  const userData = {
    ...body,
    passwordHash,
    gender,
    sport,
    cricketRole: sport === 'Cricket' ? cricketRole : undefined
  };
  
  const user = new User(userData);
  await user.save();

  return { user: { id: user._id, email: user.email, role: user.role, name: user.name } };
}

async function login(body) {
  const { email, password } = body;
  const user = await User.findOne({ email });
  if (!user) return { error: "Invalid email or password" };

  if (!user.passwordHash) {
    return { error: "Account registered via social login. Use Google sign-in or set a password." };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return { error: "Invalid email or password" };

  const { accessToken, refreshToken } = generateTokens(user);
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken, user: { id: user._id, email: user.email, role: user.role, name: user.name } };
}


async function adminSignup(data) {
  const existing = await User.findOne({ email: data.email });
  if (existing) return { error: "Admin already exists" };

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash: hashedPassword,
    role: "admin",
    isAdmin: true,
  });

  const tokens = generateTokens(user);
  return { user, ...tokens };
}

async function adminLogin({ email, password }) {
  try {
    const user = await User.findOne({ email, isAdmin: true });
    if (!user) return { error: "Invalid admin credentials" };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return { error: "Invalid admin credentials" };

    const { accessToken, refreshToken } = generateTokens(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
    };
  } catch (err) {
    console.error("Admin login error:", err);
    return { error: "Server error during admin login" };
  }
}

async function refresh(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return { error: "Invalid refresh token" };

  const userId = payload.id;
  
  // Check if there's already a refresh in progress for this user
  if (refreshQueue.has(userId)) {
    console.log(`Token refresh already in progress for user ${userId}, waiting...`);
    try {
      return await refreshQueue.get(userId);
    } catch (error) {
      // If the queued refresh failed, remove it and try again
      refreshQueue.delete(userId);
    }
  }

  // Create a new refresh promise and add it to the queue
  const refreshPromise = performTokenRefresh(refreshToken, userId);
  refreshPromise._timestamp = Date.now(); // Add timestamp for cleanup
  refreshQueue.set(userId, refreshPromise);

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Clean up the queue after completion
    refreshQueue.delete(userId);
  }
}

async function performTokenRefresh(refreshToken, userId) {
  console.log(`Performing token refresh for user ${userId}`);
  
  const user = await User.findById(userId);
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new Error("Invalid refresh token");
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens(user);

  // Replace old token
  user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
  user.refreshTokens.push(newRefresh);
  await user.save();

  console.log(`Token refresh completed for user ${userId}`);
  return { accessToken, refreshToken: newRefresh };
}

async function logout(refreshToken) {
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) return { error: "Token not found" };

  user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
  await user.save();

  return { success: true };
}



async function loginWithGoogle({ googleId, email, name, picture, role, gender, sport, cricketRole }) {
  if (!email) return { error: "Email missing from Google profile" };

  // Try find user by googleId or email
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    // New user registration
    if (!sport) return { error: "Sport is required for registration" };
    
    if (sport === 'Cricket' && !cricketRole) {
      return { error: "Cricket role is required when sport is Cricket" };
    }

    if (cricketRole && !['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].includes(cricketRole)) {
      return { error: "Invalid cricket role" };
    }

    // For players, we need age and playingRole
    const defaultUserData = {
      age: 18, // Default age
      playingRole: sport === 'Cricket' ? cricketRole : 'Player' // Use cricketRole as playingRole for cricket players
    };
    
    // Create new user with all required fields
    const newUser = {
      name: name || (email.split('@')[0]),
      email,
      role: role || "player",
      profilePic: picture || "",
      googleId,
      gender: gender || 'Prefer not to say',
      sport,
      cricketRole: sport === 'Cricket' ? cricketRole : undefined,
      ...defaultUserData
    };

    try {
      user = await User.create(newUser);
    } catch (error) {
      console.error('User creation error:', error);
      return { error: "Failed to create user. Please try again." };
    }
  } else {
    // Existing user login or account linking
    if (!user.googleId) {
      // Link Google account to existing email account
      user.googleId = googleId;
      if (!user.profilePic && picture) user.profilePic = picture;
      
      // Update optional fields if provided
      if (gender) user.gender = gender;
      if (sport && user.sport !== sport) {
        user.sport = sport;
        user.cricketRole = sport === 'Cricket' ? cricketRole : undefined;
      } else if (sport === 'Cricket' && cricketRole) {
        user.cricketRole = cricketRole;
      }
      
      try {
        await user.save();
      } catch (error) {
        console.error('User update error:', error);
        return { error: "Failed to update user information" };
      }
    }
  }

  // Generate access + refresh tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Update refresh tokens
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Return enhanced user object with all relevant fields
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      profilePic: user.profilePic,
      gender: user.gender,
      sport: user.sport,
      cricketRole: user.cricketRole,
      age: user.age,
      playingRole: user.playingRole,
      bio: user.bio || "",
      stats: user.stats || {
        matches: 0,
        runs: 0,
        wickets: 0
      }
    }
  };
}


module.exports = { signup, login, adminSignup, adminLogin, refresh, logout, loginWithGoogle };
