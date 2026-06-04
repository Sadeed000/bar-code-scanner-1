const fs = require("fs");
const csv = require("csv-parser");

const reviewService = require("../services/review.service");

exports.uploadReviews = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        message: "CSV file is required"
      });
    }

    const { category, overwriteExisting } = req.body;

    if (!category) {
      return res.status(400).json({
        message: "Category is required"
      });
    }

    const uploadedBy = req.user?.name || "Admin";

    const reviews = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv()) // safer than forcing headers
      .on("data", (row) => {

        if (row.review && row.review.trim()) {
          reviews.push(row.review.trim());
        }

      })
      .on("end", async () => {

        if (reviews.length === 0) {
          return res.status(400).json({
            message: "No valid reviews found in CSV"
          });
        }

        const overwrite =
          overwriteExisting === "true" ||
          overwriteExisting === "1" ||
          overwriteExisting === true;

        await reviewService.createReviewCategory({
          category,
          reviews,
          uploadedBy,
          overwriteExisting: overwrite,
        });

        fs.unlink(filePath, () => {});

        res.json({
          success: true,
          message: "Reviews uploaded successfully",
          count: reviews.length
        });

      });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Upload failed"
    });

  }
};

exports.getReviewSummary = async (req, res) => {

  try {

    const data = await reviewService.getReviewSummary();

    res.json(data);

  } catch (err) {

    res.status(500).json({
      message: "Failed to fetch reviews"
    });

  }

};


exports.getCategoryReviews = async (req, res) => {
  try {

    const category = req.params.category.trim().toLowerCase();
    const skip = parseInt(req.query.skip) || 0;
    const limit = 10;

    const doc = await Review.findOne({ category });

    if (!doc) {
      return res.json([]);
    }

    const reviews = doc.reviews.slice(skip, skip + limit);

    res.json(reviews);

  } catch (err) {

    console.log(err);
    res.status(500).json({ message: "Error fetching reviews" });

  }
};




const Review = require("../models/review.model");


// GET ALL CATEGORIES
exports.getCategories = async (req, res) => {

  try {

    const categories = await Review.find({}, { category: 1, _id: 0 })
      .sort({ category: 1 });

    res.json(categories.map(c => c.category));

  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }

};


// CREATE NEW CATEGORY
exports.createCategory = async (req, res) => {

  try {

    const { category } = req.body;

    const normalized = category.trim().toLowerCase();

    const exists = await Review.findOne({ category: normalized });

    if (exists) {
      return res.status(400).json({
        message: "Category already exists"
      });
    }

    const doc = await Review.create({
      category: normalized,
      reviews: [],
      reviewCount: 0
    });

    res.json(doc);

  } catch (err) {
    res.status(500).json({ message: "Error creating category" });
  }

};