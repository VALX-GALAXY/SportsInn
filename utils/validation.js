const roleFields = require("./roleFields");

function validateSignup(body) {
  const { role } = body;
  if (!role || !roleFields[role]) {
    return "Invalid role provided";
  }

  const requiredFields = roleFields[role].filter(f => f !== "passwordHash");
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }

  if (!body.password) return "Password is required";

  return null;
}

module.exports = { validateSignup };
