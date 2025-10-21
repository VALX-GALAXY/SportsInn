// Full fields per role (storage representation)
const roleFields = {
  player: ["name", "email", "password", "role", "age", "playingRole"],
  academy: ["name", "email", "password", "role", "location", "contactInfo"],
  scout: ["name", "email", "password", "role", "organization", "experience"],
};

module.exports = roleFields;
