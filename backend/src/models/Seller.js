const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: String,
    phone: String,
    shopName: String,
    address: String,
    role: { type: String, enum: ["seller", "admin"], default: "seller" },
   },
  
  { timestamps: true }
);

module.exports = mongoose.model("Seller", SellerSchema);
