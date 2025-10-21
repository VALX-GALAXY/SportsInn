const bcrypt = require("bcrypt");

async function sanitizeUserInput(updates) {
  if (!updates || typeof updates !== "object") return updates;

  // If client provided 'password', hash it to 'passwordHash' and delete raw password
  if (updates.password) {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    try {
      const hash = await bcrypt.hash(updates.password, saltRounds);
      updates.passwordHash = hash;
    } catch (err) {
      // bubble up error
      throw new Error("Failed to hash password");
    }
    delete updates.password;
  }

  // Defensive: if client tried to send passwordHash directly, remove it
  if (updates.passwordHash && updates._fromClient) {
    delete updates.passwordHash;
  }

  return updates;
}

module.exports = sanitizeUserInput;
