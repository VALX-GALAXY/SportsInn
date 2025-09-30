// Full fields per role (storage representation)
const roleFields = {
  player: ["name", "email", "passwordHash", "role", "age", "playingRole"],
  academy: ["name", "email", "passwordHash", "role", "location", "contactInfo"],
  scout: ["name", "email", "passwordHash", "role", "organization", "experience"],
};

module.exports = roleFields;
