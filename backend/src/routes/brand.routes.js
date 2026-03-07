const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const {
  createBrandController,
  updateBrandController,
  listBrandsController,
  getBrandPublicController,
  getStatsController,
  deleteBrandController,
} = require("../controllers/brand.controller");
const upload = require("../utils/upload");
const { trackQRScan } = require("../controllers/qr.controller");

// public
router.get("/public/:slug", getBrandPublicController);

// admin protected
router.get("/stats", requireAuth, getStatsController);
router.get("/", requireAuth, listBrandsController);
router.post("/", requireAuth, upload.single("logo"), createBrandController);
router.put("/:id", requireAuth, upload.single("logo"), updateBrandController);
router.delete("/:id", requireAuth, deleteBrandController);


// router.get("/r/:slug", trackQRScan);


module.exports = router;