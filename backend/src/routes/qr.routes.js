const express = require("express");
const router = express.Router();
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

const {
  trackQRScan,
  getBrandScanCount,
  getAllBrandScanCounts,
  trackScanAPI,
} = require("../controllers/qr.controller");

router.get("/r/:slug", trackQRScan);

router.post("/scan/:slug", trackScanAPI);

router.get("/analytics/brand/:slug", requireAuth, getBrandScanCount);



router.get("/analytics/summary", requireAuth, requireAdmin, async (req, res) => {
  res.json(await require("../services/analytics.service").getAnalytics(req.query));
});

router.get("/analytics/brands", requireAuth, getAllBrandScanCounts);

module.exports = router;