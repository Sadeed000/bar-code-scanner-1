const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const {
  createSellerController,
  listSellersController,
  getSellerController,
  updateSellerController,
  deleteSellerController,
} = require("../controllers/seller.controller");

// All seller routes require auth
router.get("/", requireAuth, listSellersController);
router.post("/", requireAuth, createSellerController);
router.get("/:id", requireAuth, getSellerController);
router.put("/:id", requireAuth, updateSellerController);
router.delete("/:id", requireAuth, deleteSellerController);

module.exports = router;
