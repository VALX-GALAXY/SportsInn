// utils/googleVerify.js
const { OAuth2Client } = require("google-auth-library");

/**
 * verifyIdToken(idToken)
 * - verifies Google id_token and returns payload
 */
async function verifyIdToken(idToken) {
  // Check if Google Client ID is configured
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not configured");
  }

  // Initialize client
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  // Validate token presence
  if (!idToken) {
    throw new Error("No idToken provided");
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error("Failed to extract payload from Google token");
    }

    return payload; // contains sub, email, email_verified, name, picture, etc.
  } catch (error) {
    // Enhance error message based on the type of error
    if (error.message.includes('Token used too late')) {
      throw new Error("Google token has expired. Please try signing in again.");
    } else if (error.message.includes('Invalid token')) {
      throw new Error("Invalid Google token format. Please try signing in again.");
    } else if (error.message.includes('audience')) {
      throw new Error("Token validation failed: Invalid application. Please ensure you're using the correct Google Sign-In button.");
    }
    
    // If it's not one of the known errors, throw the original error
    throw error;
  }
}

module.exports = { verifyIdToken };

module.exports = { verifyIdToken };
