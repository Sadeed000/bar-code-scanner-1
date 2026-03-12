const mongoose = require("mongoose");

const reviewCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

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

module.exports = mongoose.model("ReviewCategory", reviewCategorySchema);