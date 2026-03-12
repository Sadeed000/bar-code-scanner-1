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

const { requireAuth } = require("../middleware/auth.middleware");

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  uploadReviews
);

router.get("/category/:category", getCategoryReviews);

router.get("/categories", getCategories);
router.post("/category", createCategory);

router.get("/summary", getReviewSummary);

module.exports = router;