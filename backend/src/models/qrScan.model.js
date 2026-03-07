const mongoose = require("mongoose");

const qrScanSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      index: true,
    },

    ip: String,

    userAgent: String,

    device: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QRScan", qrScanSchema);