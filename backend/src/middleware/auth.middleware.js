const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller");
const Brand = require("../models/BrandProfile");
const mongoose = require("mongoose");
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await Seller.findById(decoded.sub).select("-passwordHash");
    if (!user || user.isActive === false || (decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) return res.status(401).json({ message: "Please sign in again" });
    req.user = user;
    next();
  } catch { return res.status(401).json({ message: "Unauthorized" }); }
}
function requireAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Administrator access required" });
  next();
}
function requireBrandCreator(req, res, next) {
  if (!["ADMIN", "SELLER"].includes(req.user.role)) return res.status(403).json({ message: "You can only edit your assigned brands" });
  next();
}
async function requireBrandAccess(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid brand ID" });
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).json({ message: "Brand not found" });
  const allowed = req.user.role === "ADMIN" ||
    (req.user.role === "BUYER" && (req.user.assignedBrands || []).some(id => String(id) === String(brand._id))) ||
    (req.user.role === "SELLER" && String(brand.createdBy) === String(req.user._id));
  if (!allowed) return res.status(403).json({ message: "You do not have access to this brand" });
  next();
}
module.exports = { requireAuth, requireAdmin, requireBrandAccess, requireBrandCreator };
