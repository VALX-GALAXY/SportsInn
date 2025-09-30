const bcrypt = require("bcrypt");
const {
  users,
  refreshTokens,
  findUserByEmail,
  addUser,
  storeRefreshToken,
  removeRefreshToken,
  isRefreshTokenValid,
} = require("../models/userModel");

const { validateSignup } = require("../utils/validation");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwtUtils");
const roleFields = require("../utils/roleFields");

// Signup business logic
async function signupService(body) {
  const error = validateSignup(body);
  if (error) return { error };

  if (findUserByEmail(body.email)) return { error: "Email already exists" };

  const hashed = await bcrypt.hash(body.password, 10);

  const user = {
    id: Date.now().toString(),
    name: body.name,
    email: body.email,
    passwordHash: hashed,
    role: body.role,
    // role specific fields:
    ...(body.role === "player" ? { age: body.age, playingRole: body.playingRole } : {}),
    ...(body.role === "academy" ? { location: body.location, contactInfo: body.contactInfo } : {}),
    ...(body.role === "scout" ? { organization: body.organization, experience: body.experience } : {}),
  };

  addUser(user);

  return { user: { id: user.id, email: user.email, role: user.role, name: user.name } };
}

// Login business logic
async function loginService(body) {
  const { email, password } = body;
  if (!email || !password) return { error: "Email and password required" };

  const user = findUserByEmail(email);
  if (!user) return { error: "Invalid credentials" };

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return { error: "Invalid credentials" };

  // payload for tokens
  const payload = { userId: user.id, email: user.email, role: user.role, name: user.name };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // store refresh token (with simple expiry mock)
  storeRefreshToken(user.id, refreshToken);

  return {
    data: {
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
      accessToken,
      refreshToken,
    },
  };
}

// Refresh token exchange
async function refreshService(token) {
  if (!token) return { error: "Refresh token required" };
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    return { error: "Invalid refresh token" };
  }

  // ensure stored
  if (!isRefreshTokenValid(decoded.userId, token)) return { error: "Refresh token not recognized" };

  const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role, name: decoded.name };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
}

// Logout logic
async function logoutService(token) {
  if (!token) return false;
  const exists = isRefreshTokenValid(null, token) || refreshTokens.some(rt => rt.token === token);
  // remove
  removeRefreshToken(token);
  return exists;
}

// Update profile by role-limited fields only
async function updateProfileService(userId, payload) {
  const user = users.find(u => u.id === userId);
  if (!user) return { error: "User not found" };

  // allowed fields per role for updates
  const allowed = {
    player: ["name", "age", "playingRole"],
    academy: ["name", "location", "contactInfo"],
    scout: ["name", "organization", "experience"],
  };

  const allowedFields = allowed[user.role] || ["name"];

  let changed = false;
  for (const key of Object.keys(payload)) {
    if (allowedFields.includes(key)) {
      user[key] = payload[key];
      changed = true;
    }
  }

  if (!changed) return { error: "No permitted fields to update or payload empty" };

  // return updated object (omit passwordHash)
  const { passwordHash, ...publicUser } = user;
  return { updated: publicUser };
}

module.exports = { signupService, loginService, refreshService, logoutService, updateProfileService };
