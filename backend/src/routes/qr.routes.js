const express = require("express");
const router = express.Router();

const {
  trackQRScan,
  getBrandScanCount,
  getAllBrandScanCounts,
  trackScanAPI,
} = require("../controllers/qr.controller");

router.get("/r/:slug", trackQRScan);

router.post("/scan/:slug", trackScanAPI);

router.get("/analytics/brand/:slug", getBrandScanCount);



router.get("/analytics/brands", getAllBrandScanCounts);

module.exports = router;