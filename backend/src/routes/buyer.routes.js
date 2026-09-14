const router = require("express").Router();
const { z } = require("zod");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Seller = require("../models/Seller");
const Brand = require("../models/BrandProfile");
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform(value => value.toLowerCase()),
  password: z.string().min(4).max(72).optional(),
  assignedBrands: z.array(z.string().refine(value => mongoose.isValidObjectId(value))).max(1000),
  isActive: z.boolean().default(true),
});
router.use(requireAuth, requireAdmin);
router.get("/", async (req, res) => {
  res.json(await Seller.find({ role: "BUYER" }).select("-passwordHash").populate("assignedBrands", "name slug").sort({ createdAt: -1 }));
});
async function save(req, res) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid name, email, password (8–72 characters), and brand selection" });
  const { password, ...data } = parsed.data;
  if (!req.params.id && !password) return res.status(400).json({ message: "Password is required" });
  if (req.params.id && !mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid buyer ID" });
  data.assignedBrands = [...new Set(data.assignedBrands)];
  if (await Brand.countDocuments({ _id: { $in: data.assignedBrands } }) !== data.assignedBrands.length) return res.status(400).json({ message: "One or more selected brands no longer exist. Refresh and try again." });
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  try {
    let buyer;
    if (req.params.id) {
      buyer = await Seller.findOneAndUpdate({ _id: req.params.id, role: "BUYER" }, { $set: data, ...(password || !data.isActive ? { $inc: { tokenVersion: 1 } } : {}) }, { returnDocument: "after", runValidators: true }).select("-passwordHash");
      if (!buyer) return res.status(404).json({ message: "Buyer not found" });
    } else {
      buyer = await Seller.create({ ...data, role: "BUYER" });
      buyer = buyer.toObject();
      delete buyer.passwordHash;
    }
    res.status(req.params.id ? 200 : 201).json(buyer);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "This email is already used by an account" });
    throw error;
  }
}
router.post("/", save);
router.put("/:id", save);
module.exports = router;
