const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    label: String,
    enabled: { type: Boolean, default: true },
    url: String,
    icon: String, // optional custom icon name
    bgColor: String, // optional custom color
  },
  { _id: false }
);

const ReviewSchema = new mongoose.Schema(
  {
    name: String,
    rating: { type: Number, min: 1, max: 5 },
    message: String,
    date: String,
  },
  { _id: false }
);

const BrandProfileSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    tagline: String,
    // brand owner contact
    ownerName: String,
    ownerPhone: String,
    ownerEmail: String,
    // business address and website
    address: String,
    website: String,
    // watermark image shown on public profile
    watermarkUrl: String,
    // background template image shown behind the public profile
    backgroundUrl: String,
    // payment data migrated from sellers
    paymentType: { type: String, enum: ["online", "cash"], default: "cash" },
    amount: { type: Number, default: 0 },
    headline: String,
    headlineAccent: String,
    subtext: String,
    logoUrl: String,
    // ⭐ ADD THIS
    googleReviewUrl: {
      type: String,
      default: "",
    },
    patPoojaUrl:{
      type: String,
      default: "",
    },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }, // reference
  aboutUs: String,
  contactNumber: String,
  privacyPolicy: String,
  termsConditions: String,
  
    links: [LinkSchema],
    categoryLinks: [LinkSchema],
    reviews: [ReviewSchema],
category: {
  type: String,
  default: "cafe",
},
    qrCodeUrl: String, // generated QR image
gallery: [
  {
    type: String,
  }
],
    theme: {
      accentColor: { type: String, default: "#B08D57" },
      // Appearance controls. Defaults match the original hard-coded styling so
      // brands saved before these existed render unchanged.
      logoSize: { type: Number, default: 112 },
      fontFamily: { type: String, default: "" },
      headingSize: { type: Number, default: 30 },
      headingColor: { type: String, default: "#111827" },
      taglineSize: { type: Number, default: 14 },
      taglineColor: { type: String, default: "#6b7280" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);