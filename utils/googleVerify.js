// utils/googleVerify.js
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * verifyIdToken(idToken)
 * - verifies Google id_token and returns payload
 */
async function verifyIdToken(idToken) {
  if (!idToken) throw new Error("No idToken provided");
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  return payload; // contains sub, email, email_verified, name, picture, etc.
}

module.exports = { verifyIdToken };
