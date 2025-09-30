// usage: roleCheck(["academy","scout"])
module.exports = function roleCheck(allowedRoles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient role" });
    }
    next();
  };
};
