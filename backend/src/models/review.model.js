const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    reviews: [String],

    reviewCount: {
      type: Number,
      default: 0
    },

    uploadedBy: {
      type: String,
      default: "Admin"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);