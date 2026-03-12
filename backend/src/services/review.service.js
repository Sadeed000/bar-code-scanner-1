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

exports.getReviewSummary = async () => {
  return await Review.find().sort({ createdAt: -1 });
};