const roleFields = require("./roleFields");

function validateSignup(body) {
  const { role, sport, gender, cricketRole } = body;
  
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

  // Validate gender if provided
  if (gender && !['Male', 'Female', 'Other', 'Prefer not to say'].includes(gender)) {
    return "Invalid gender value";
  }

  // Validate sport (required)
  if (!sport) {
    return "Sport is required";
  }

  // Validate cricketRole if sport is Cricket
  if (sport === 'Cricket') {
    if (!cricketRole) {
      return "Cricket role is required when sport is Cricket";
    }
    if (!['Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'].includes(cricketRole)) {
      return "Invalid cricket role";
    }
  }

  return null;
}

module.exports = { validateSignup };
