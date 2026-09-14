const Review = require("../models/review.model");

exports.createReviewCategory = async ({
  category,
  reviews,
  uploadedBy,
  overwriteExisting
}) => {

  const normalizedCategory = category.trim().toLowerCase();

  let updateQuery;

  // If overwriteExisting = true → replace reviews
  if (overwriteExisting) {

    updateQuery = {
      $set: {
        reviews: reviews,
        reviewCount: reviews.length,
        uploadedBy
      }
    };

  } else {

    // Existing logic (unchanged)
    updateQuery = {
      $push: { reviews: { $each: reviews } },
      $inc: { reviewCount: reviews.length },
      $set: { uploadedBy }
    };

  }

  const doc = await Review.findOneAndUpdate(
    { category: normalizedCategory },
    updateQuery,
    {
      returnDocument: "after",
      upsert: true
    }
  );

  return doc;
};

exports.getReviewSummary = async ({ page = 1, limit = 10, q = "" } = {}) => {
  const pageSize = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
  const requestedPage = Math.max(1, Math.floor(Number(page)) || 1);
  const filter = { reviewCount: { $gt: 0 } };
  const term = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (term) filter.$or = ["category", "uploadedBy"].map(field => ({ [field]: { $regex: term, $options: "i" } }));
  const total = await Review.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const items = await Review.find(filter)
    .select("category reviewCount uploadedBy createdAt")
    .sort({ createdAt: -1, _id: -1 })
    .skip((currentPage - 1) * pageSize)
    .limit(pageSize)
    .lean();
  return { items, total, page: currentPage, limit: pageSize, totalPages };
};
