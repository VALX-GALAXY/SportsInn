const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const { generateTokens, verifyRefreshToken } = require("../utils/jwtUtils");
const { validateSignup } = require("../utils/validation");

async function signup(body) {
  const error = validateSignup(body);
  if (error) return { error };

  const existing = await User.findOne({ email: body.email });
  if (existing) return { error: "Email already exists" };

  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = new User({ ...body, passwordHash });
  await user.save();

  return { user: { id: user._id, email: user.email, role: user.role, name: user.name } };
}

async function login(body) {
  const { email, password } = body;
  const user = await User.findOne({ email });
  if (!user) return { error: "Invalid email or password" };

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

  const user = await User.findById(payload.id);
  if (!user || !user.refreshTokens.includes(refreshToken)) return { error: "Invalid refresh token" };

  const { accessToken, refreshToken: newRefresh } = generateTokens(user);

  // replace old token
  user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
  user.refreshTokens.push(newRefresh);
  await user.save();

  return { accessToken, refreshToken: newRefresh };
}

async function logout(refreshToken) {
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) return { error: "Token not found" };

  user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
  await user.save();

  return { success: true };
}

module.exports = { signup, login, adminSignup, adminLogin, refresh, logout };
