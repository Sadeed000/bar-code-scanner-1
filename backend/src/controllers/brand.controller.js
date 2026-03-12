const { z } = require("zod");
const {
  createBrand,
  updateBrand,
  getBrandBySlug,
  listBrands,
  listBrandsPaged,
} = require("../services/brand.service");
const BrandProfile = require("../models/BrandProfile");

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
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  // payment info added per new requirement
  paymentType: z.enum(["online", "cash"]).optional(),
  amount: z.coerce.number().nonnegative().optional(),
  headline: z.string().optional(),
  headlineAccent: z.string().optional(),
  subtext: z.string().optional(),
  logoUrl: z.string().optional(),
  // ⭐ ADD THIS
  googleReviewUrl: z.string().url().or(z.literal("")).optional(),
  patPoojaUrl: z.string().url().or(z.literal("")).optional(),
  aboutUs: z.string().optional(),
  contactNumber: z.string().optional(),
  privacyPolicy: z.string().optional(),
  termsConditions: z.string().optional(),
  links: z.array(LinkSchema).optional(),
  reviews: z.array(ReviewSchema).optional(),
  category: z
    .enum(["cafe", "restaurant", "gym", "shop", "hotel"])
    .optional(),
  gallery: z.array(z.string()).optional(),
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

    // ⭐ handle uploaded logo and watermark
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        payload.logoUrl = `/uploads/logos/${req.files.logo[0].filename}`;
      }
      if (req.files.watermark && req.files.watermark[0]) {
        payload.watermarkUrl = `/uploads/logos/${req.files.watermark[0].filename}`;
      }
    }

 // Handle gallery uploads    
if (req.files && req.files.gallery) {
  const brandFolder = payload.name.replace(/\s+/g, "-").toLowerCase();

  payload.gallery = req.files.gallery.map(file => 
    `/uploads/${brandFolder}/${file.filename}`
  );
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

    /* HANDLE LOGO + WATERMARK */
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        payload.logoUrl = `/uploads/logos/${req.files.logo[0].filename}`;
      }

      if (req.files.watermark && req.files.watermark[0]) {
        payload.watermarkUrl = `/uploads/logos/${req.files.watermark[0].filename}`;
      }
    }

    /* 🔹 FETCH EXISTING BRAND FROM DB */
    const existingBrand = await BrandProfile.findById(req.params.id);

    console.log("Existing brand:", existingBrand);
    if (!existingBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    let gallery = existingBrand.gallery || [];

    /* HANDLE NEW GALLERY UPLOADS */
    if (req.files && req.files.gallery) {

      const brandFolder = (payload.name || existingBrand.name)
        .replace(/\s+/g, "-")
        .toLowerCase();

      const newImages = req.files.gallery.map(file =>
        `/uploads/${brandFolder}/${file.filename}`
      );

      gallery = [...gallery, ...newImages];
    }

    payload.gallery = gallery;

    const doc = await updateBrand(req.params.id, payload);

    res.json(doc);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
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

      // payments now tracked on brands
      totalPayments: brandStats.totalPayments || 0,
      totalAmount: brandStats.totalAmount || 0
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


async function listBrandsController(req, res) {
  const { page, limit, q, startDate, endDate } = req.query || {};

  // Backwards compatible:
  // - If no pagination / filter params provided, return the original array shape.
  const wantsPaged =
    page !== undefined ||
    limit !== undefined ||
    (q && String(q).trim()) ||
    startDate !== undefined ||
    endDate !== undefined;

  if (!wantsPaged) {
    const docs = await listBrands(req.user);
    return res.json(docs);
  }

  const result = await listBrandsPaged(req.user, {
    page,
    limit,
    q,
    startDate,
    endDate,
  });

  return res.json(result);
}

module.exports = {
  createBrandController,
  updateBrandController,
  listBrandsController,
  getBrandPublicController,
  getStatsController,
  deleteBrandController,
};