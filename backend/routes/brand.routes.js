const { uploadRoot } = require("../config/uploads");
const path = require("path");
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

// Authenticated image uploads for category and social tiles.
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const iconUpload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const folder = path.join(uploadRoot, "icons");
      fs.mkdir(folder, { recursive: true }, error => cb(error, folder));
    },
    filename(req, file, cb) {
      const extensions = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif" };
      cb(null, crypto.randomUUID() + extensions[file.mimetype]);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(req, file, cb) {
    cb(null, ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.mimetype));
  }
}).single("icon");
router.post("/icon", requireAuth, (req, res) => {
  iconUpload(req, res, error => {
    if (error || !req.file) return res.status(400).json({ message: "Choose a PNG, JPG, WebP or GIF image up to 5 MB" });
    res.json({ url: "/uploads/icons/" + req.file.filename });
  });
});

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