const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

   const decoded = jwt.verify(token, process.env.JWT_SECRET);

req.user = {
  _id: decoded.sub,
  email: decoded.email,
  role: decoded.role
};
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = { requireAuth };