const bcrypt = require("bcrypt");
const Seller = require("../models/Seller");

async function createSeller(payload) {
  const existing = await Seller.findOne({ email: payload.email.toLowerCase() });
  if (existing) {
    throw new Error("Seller with this email already exists");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  const doc = await Seller.create({
    ...payload,
    email: payload.email.toLowerCase(),
    passwordHash,
  });

  // Don't send password hash to frontend
  return doc.toObject();
}

async function updateSeller(id, payload) {
  if (payload.password) {
    payload.passwordHash = await bcrypt.hash(payload.password, 10);
    delete payload.password;
  }

  const doc = await Seller.findByIdAndUpdate(id, payload, { returnDocument: 'after' });
  return doc.toObject();
}

async function getSeller(id) {
  return Seller.findById(id);
}

async function deleteSeller(id) {
  return Seller.findByIdAndDelete(id);
}

async function listSellers() {
  return Seller.find().sort({ createdAt: -1 });
}
async function getSellerStats() {
  const totalSellers = await Seller.countDocuments();
  const activeSellers = await Seller.countDocuments({ isActive: true });
  const pendingSellers = await Seller.countDocuments({ status: "pending" });

  // Count sellers who have payment recorded
  const totalPayments = await Seller.countDocuments({
    amount: { $gt: 0 },
  });

  // Calculate total payment amount
  const totalAmountAgg = await Seller.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
      },
    },
  ]);

  const totalAmount = totalAmountAgg[0]?.totalAmount || 0;

  return {
    totalSellers,
    activeSellers,
    pendingSellers,
    totalPayments,
    totalAmount,
  };
}

module.exports = {
  createSeller,
  updateSeller,
  getSeller,
  deleteSeller,
  listSellers,
  getSellerStats,
};