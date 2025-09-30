// In-memory store
const users = [];
const refreshTokens = []; // entries: { userId, token }

function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

function addUser(user) {
  users.push(user);
  return user;
}

function storeRefreshToken(userId, token) {
  refreshTokens.push({ userId, token });
}

function removeRefreshToken(token) {
  const idx = refreshTokens.findIndex(rt => rt.token === token);
  if (idx !== -1) refreshTokens.splice(idx, 1);
}

function isRefreshTokenValid(userId, token) {
  if (userId) return refreshTokens.some(rt => rt.userId === userId && rt.token === token);
  return refreshTokens.some(rt => rt.token === token);
}

module.exports = {
  users,
  refreshTokens,
  findUserByEmail,
  addUser,
  storeRefreshToken,
  removeRefreshToken,
  isRefreshTokenValid,
};
