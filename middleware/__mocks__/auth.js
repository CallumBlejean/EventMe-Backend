module.exports = {
  verifyToken: (req, res, next) => {
    req.user = { user_id: 1, user_status: "admin" };
    next();
  },
  checkAdmin: (req, res, next) => {
    if (req.user.user_status === "admin") return next();
    return res.status(403).json({ msg: "Forbidden - Admin access required" });
  },
  checkStaff: (req, res, next) => {
    if (["admin", "staff"].includes(req.user.user_status)) return next();
    return res.status(403).json({ msg: "Forbidden - Staff access required" });
  }
};
