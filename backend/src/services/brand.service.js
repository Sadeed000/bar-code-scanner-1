const BrandProfile = require("../models/BrandProfile");
const { slugify } = require("../utils/slugify");
const QRCode = require("qrcode");

async function createBrand(payload) {

  const slug = payload.slug
    ? payload.slug.toLowerCase().replace(/\s+/g, "-")
    : payload.name.toLowerCase().replace(/\s+/g, "-");

  const qrCodeUrl = await generateQRCode(slug);

  const doc = await BrandProfile.create({
    ...payload,
    slug,
    qrCodeUrl,
  });

  return doc;
}


async function updateBrand(id, payload) {

  if (payload.slug) {
    payload.slug = slugify(payload.slug);
  }

  // if slug is changing we should regenerate the QR code too
  if (payload.slug) {
    const existing = await BrandProfile.findById(id);
    if (existing && existing.slug !== payload.slug) {
      payload.qrCodeUrl = await generateQRCode(payload.slug);
    }
  }

  const doc = await BrandProfile.findByIdAndUpdate(
    id,
    payload,
    { returnDocument: 'after' }
  );

  return doc;
}

async function getBrandBySlug(slug) {
  return BrandProfile.findOne({ slug });
}

async function listBrands(user) {

  
  // If admin → return all brands
  if (user?.role === "ADMIN") {
return BrandProfile
      .find()
      .populate("createdBy", "name email") 
      .sort({ createdAt: -1 });  }

  // Otherwise → return only user's brands
  return BrandProfile
    .find({ createdBy: user._id })
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
}

async function listBrandsPaged(user, options = {}) {
  const {
    page = 1,
    limit = 10,
    q,
    startDate,
    endDate,
  } = options;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (user?.role !== "ADMIN") {
    filter.createdBy = user?._id;
  }

  if (q && String(q).trim()) {
    const term = String(q).trim();
    filter.$or = [
      { name: { $regex: term, $options: "i" } },
      { slug: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ];
  }

  if (startDate || endDate) {
    const createdAt = {};
    if (startDate) {
      const d = new Date(startDate);
      if (!Number.isNaN(d.getTime())) createdAt.$gte = d;
    }
    if (endDate) {
      const d = new Date(endDate);
      if (!Number.isNaN(d.getTime())) {
        const endExclusive = new Date(d);
        endExclusive.setDate(endExclusive.getDate() + 1);
        createdAt.$lt = endExclusive;
      }
    }
    if (Object.keys(createdAt).length > 0) filter.createdAt = createdAt;
  }

  const [items, total] = await Promise.all([
    BrandProfile.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    BrandProfile.countDocuments(filter),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    items,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
  };
}

async function deleteBrand(id) {
  return BrandProfile.findByIdAndDelete(id);
}

const QRScan = require("../models/qrScan.model");

async function getBrandStats() {
  const totalBrands = await BrandProfile.countDocuments();

  // Count actual QR scans recorded in the system
  const qrScans = await QRScan.countDocuments();

  // payment stats stored on brands now
  const totalPayments = await BrandProfile.countDocuments({ amount: { $gt: 0 } });
  const totalAmountAgg = await BrandProfile.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
      },
    },
  ]);
  const totalAmount = totalAmountAgg[0]?.totalAmount || 0;

  return {
    totalBrands,
    qrScans,
    totalPayments,
    totalAmount,
  };
}

async function generateQRCode(slug) {
  // QR code should hit the tracking endpoint on the backend which will
  // record the scan and then redirect the user to the public page.
  // We use SERVER_URL env var for the backend API base.
  const serverBase = process.env.SERVER_URL || "";
  const trackUrl = `${serverBase}/p/${slug}`;
  const qr = await QRCode.toDataURL(trackUrl);
  return qr;
}

module.exports = {
  createBrand,
  updateBrand,
  getBrandBySlug,
  listBrands,
  listBrandsPaged,
  deleteBrand,
  getBrandStats,
  generateQRCode,
};