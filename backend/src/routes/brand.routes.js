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
const { upload, } = require("../utils/upload");
const { trackQRScan } = require("../controllers/qr.controller");

// public
router.get("/public/:slug", getBrandPublicController);

// admin protected
router.get("/stats", requireAuth, getStatsController);
router.get("/", requireAuth, listBrandsController);
router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "watermark", maxCount: 1 },
      { name: "gallery", maxCount: 6 },

  ]),
  createBrandController
);
router.put(
  "/:id",
  requireAuth,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "watermark", maxCount: 1 },
      { name: "gallery", maxCount: 6 },

  ]),
  updateBrandController
);
router.delete("/:id", requireAuth, deleteBrandController);


// router.get("/r/:slug", trackQRScan);


module.exports = router;