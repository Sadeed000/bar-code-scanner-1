const { z } = require("zod");
const { createBrand, updateBrand, getBrandBySlug, listBrands } = require("../services/brand.service");

const ReviewSchema = z.object({
  name: z.string().min(1),
rating: z.coerce.number().min(1).max(5),
  message: z.string().optional(),
  date: z.string().optional(),
});

const LinkSchema = z.object({
  label: z.string().min(1),
  url: z.string().url().or(z.literal("")).optional(),
  icon: z.string().optional(),
  bgColor: z.string().optional(),
});

const BrandSchema = z.object({
  name: z.string().min(2),

  slug: z.string().optional(),
  tagline: z.string().optional(),
  headline: z.string().optional(),
  headlineAccent: z.string().optional(),
  subtext: z.string().optional(),
  logoUrl: z.string().optional(),

    // ⭐ ADD THIS
googleReviewUrl: z.string().url().or(z.literal("")).optional(),
aboutUs: z.string().optional(),
contactNumber: z.string().optional(),
privacyPolicy: z.string().optional(),
termsConditions: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  reviews: z.array(ReviewSchema).optional(),
category: z
  .enum(["cafe", "restaurant", "gym", "shop", "hotel"])
  .optional(),
  theme: z.object({
    accentColor: z.string().optional(),
  }).optional(),
});

async function createBrandController(req, res) {
  try {
    // Parse JSON strings from FormData back to objects
    const body = { ...req.body };
    if (body.links && typeof body.links === "string") {
      body.links = JSON.parse(body.links);
    }
    if (body.reviews && typeof body.reviews === "string") {
      body.reviews = JSON.parse(body.reviews);
    }
    if (body.theme && typeof body.theme === "string") {
      body.theme = JSON.parse(body.theme);
    }

    const parsed = BrandSchema.safeParse(body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.format(),
      });
    }

    const payload = { ...parsed.data };
    payload.createdBy = req.user._id;

    // ⭐ handle uploaded logo
    if (req.file) {
      payload.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    const doc = await createBrand(payload);

    res.status(201).json(doc);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}


async function updateBrandController(req, res) {
  try {
    // Parse JSON strings from FormData back to objects
    const body = { ...req.body };
    if (body.links && typeof body.links === "string") {
      body.links = JSON.parse(body.links);
    }
    if (body.reviews && typeof body.reviews === "string") {
      body.reviews = JSON.parse(body.reviews);
    }
    if (body.theme && typeof body.theme === "string") {
      body.theme = JSON.parse(body.theme);
    }

    const parsed = BrandSchema.partial().safeParse(body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.format(),
      });
    }

    const payload = { ...parsed.data };

    // ⭐ handle uploaded logo
    if (req.file) {
      payload.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    const doc = await updateBrand(req.params.id, payload);

    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(doc);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}


async function listBrandsController(req, res) {
  const docs = await listBrands(req.user);
  res.json(docs);
}

async function getBrandPublicController(req, res) {
  const doc = await getBrandBySlug(req.params.slug);
  if (!doc) return res.status(404).json({ message: "Not found" });
  res.json(doc);
}

async function getStatsController(req, res) {
  try {
    const { getBrandStats } = require("../services/brand.service");
    const { getSellerStats } = require("../services/seller.service");
    
    const brandStats = await getBrandStats();
    const sellerStats = await getSellerStats();
    
    res.json({
      totalBrands: brandStats.totalBrands,
      qrScans: brandStats.qrScans || 0,
      totalSellers: sellerStats.totalSellers,
      activeSellers: sellerStats.activeSellers,
      pendingSellers: sellerStats.pendingSellers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

async function deleteBrandController(req, res) {
  try {
    const { deleteBrand } = require("../services/brand.service");
    const doc = await deleteBrand(req.params.id);
    
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }
    
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = {
  createBrandController,
  updateBrandController,
  listBrandsController,
  getBrandPublicController,
  getStatsController,
  deleteBrandController,
};