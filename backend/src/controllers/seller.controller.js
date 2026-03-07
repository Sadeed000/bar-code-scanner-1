const { z } = require("zod");
const { createSeller, updateSeller, getSeller, deleteSeller, listSellers } = require("../services/seller.service");

const SellerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  shopName: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

async function createSellerController(req, res) {
  try {
    const parsed = SellerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.format(),
      });
    }

    const doc = await createSeller(parsed.data);
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

async function listSellersController(req, res) {
  try {
    const docs = await listSellers();
    res.json(docs);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

async function getSellerController(req, res) {
  try {
    const doc = await getSeller(req.params.id);
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

async function updateSellerController(req, res) {
  try {
    const parsed = SellerSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.format(),
      });
    }

    const doc = await updateSeller(req.params.id, parsed.data);
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

async function deleteSellerController(req, res) {
  try {
    const doc = await deleteSeller(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

module.exports = {
  createSellerController,
  listSellersController,
  getSellerController,
  updateSellerController,
  deleteSellerController,
};
