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
    { new: true }
  );

  return doc;
}

async function getBrandBySlug(slug) {
  return BrandProfile.findOne({ slug });
}

async function listBrands(user) {

  
  // If admin → return all brands
  if (user?.role === "ADMIN") {
    return BrandProfile.find().sort({ createdAt: -1 });
  }

  // Otherwise → return only user's brands
  return BrandProfile.find({ createdBy: user._id }).sort({ createdAt: -1 });
}

async function deleteBrand(id) {
  return BrandProfile.findByIdAndDelete(id);
}

const QRScan = require("../models/qrScan.model");

async function getBrandStats() {
  const totalBrands = await BrandProfile.countDocuments();

  // Count actual QR scans recorded in the system
  const qrScans = await QRScan.countDocuments();

  return {
    totalBrands,
    qrScans,
  };
}

async function generateQRCode(slug) {
  // QR code should hit the tracking endpoint on the backend which will
  // record the scan and then redirect the user to the public page.
  // We use SERVER_URL env var for the backend API base.
  const serverBase = process.env.SERVER_URL || "";
  const trackUrl = `${serverBase}/api/qr-code/r/${slug}`;
  const qr = await QRCode.toDataURL(trackUrl);
  return qr;
}

module.exports = { createBrand, updateBrand, getBrandBySlug, listBrands, deleteBrand, getBrandStats, generateQRCode };