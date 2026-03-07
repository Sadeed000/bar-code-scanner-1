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
    headline: String,
    headlineAccent: String,
    subtext: String,
    logoUrl: String,
    // ⭐ ADD THIS
    googleReviewUrl: {
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

    theme: {
      accentColor: { type: String, default: "#B08D57" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BrandProfile", BrandProfileSchema);