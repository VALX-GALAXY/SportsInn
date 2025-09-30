const roleFields = require("./roleFields");

// returns string message on error, or null if ok
function validateSignup(body) {
  const { role } = body;
  if (!role || !roleFields[role]) {
    return "Invalid role provided";
  }

  // required fields for signup (client provides plain 'password', not passwordHash)
  const requiredFields = roleFields[role].filter(f => f !== "passwordHash");

  // Ensure all required fields are present (role included)
  for (const field of requiredFields) {
    if (!body[field]) return `Missing required field: ${field}`;
  }

  if (!body.password) return "Password is required";
  // add other validations as needed (email format, password length, etc.)

  return null;
}

module.exports = { validateSignup };
