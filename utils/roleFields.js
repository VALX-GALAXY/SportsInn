// Full fields per role (storage representation)
const roleFields = {
  player: ["name", "email", "password", "role", "age", "playingRole", "sport", "gender"],
  academy: ["name", "email", "password", "role", "location", "contactInfo", "sport", "gender"],
  scout: ["name", "email", "password", "role", "organization", "experience", "sport", "gender"],
};

module.exports = roleFields;
