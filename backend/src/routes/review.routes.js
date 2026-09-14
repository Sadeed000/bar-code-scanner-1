const express = require("express");
const router = express.Router();

const { upload } = require("../utils/upload");

const {
  uploadReviews,
  getReviewSummary,
  getCategoryReviews,
  getCategories,
  createCategory
} = require("../controllers/review.controller");

const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");

router.post(
  "/upload",
  requireAuth, requireAdmin,
  upload.single("file"),
  uploadReviews
);

router.get("/category/:category", getCategoryReviews);

router.get("/categories", getCategories);
router.post("/category", requireAuth, requireAdmin, createCategory);

router.get("/summary", requireAuth, requireAdmin, getReviewSummary);

module.exports = router;