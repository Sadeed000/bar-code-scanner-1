const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const sellerUser = require("../models/Seller");

// async function ensureSeedAdmin({ email, password }) {
//   const existing = await AdminUser.findOne({ email });
//   if (existing) return;

//   const passwordHash = await bcrypt.hash(password, 10);
//   await AdminUser.create({ email, passwordHash });
//   console.log("✅ Seed admin created:", email);
// }

async function login({ email, password, jwtSecret }) {
  const user = await sellerUser.findOne({ email: email.toLowerCase() });
  if (!user || user.isActive === false) return null;

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

const token = jwt.sign(
  {
    sub: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion || 0
  },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);
  const safeUser = user.toObject();
  delete safeUser.passwordHash;
  return { user: safeUser, token };
}

module.exports = { login };