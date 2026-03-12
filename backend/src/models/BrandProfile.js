const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    label: String,
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
    // watermark image shown on public profile
    watermarkUrl: String,
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
    reviews: [ReviewSchema],
category: {
  type: String,
  enum: ["cafe", "restaurant", "gym", "shop", "hotel"],
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
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);