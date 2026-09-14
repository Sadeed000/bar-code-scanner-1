const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: String,
    phone: String,
    shopName: String,
    address: String,
    role: { type: String, enum: ["SELLER", "ADMIN", "BUYER"], default: "SELLER" },
    assignedBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "BrandProfile" }],
    isActive: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
    paymentType: { type: String, enum: ["online", "cash"], default: "cash" },
    amount: { type: Number, },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Seller", SellerSchema);
