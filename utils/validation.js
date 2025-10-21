const roleFields = require("./roleFields");

function validateSignup(body) {
  const { role } = body;
  if (!role || !roleFields[role]) {
    return "Invalid role provided";
  }

  // Required fields for this role (exclude 'password' because we treat it separately)
  const requiredFields = roleFields[role].filter(f => f !== "password");
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }

  if (!body.password) return "Password is required";

  return null;
}

module.exports = { validateSignup };
