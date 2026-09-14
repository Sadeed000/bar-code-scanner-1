const router = require("express").Router();
const { requireAuth, requireAdmin } = require("../middleware/auth.middleware");
const {
  createSellerController,
  listSellersController,
  getSellerController,
  updateSellerController,
  deleteSellerController,
} = require("../controllers/seller.controller");

router.use(requireAuth);
function adminOrSelf(req, res, next) {
  if (req.user.role === "ADMIN" || (req.user.role === "SELLER" && String(req.user._id) === req.params.id)) return next();
  return res.status(403).json({ message: "Access denied" });
}
// All seller routes require admin
router.get("/", requireAdmin, listSellersController);
router.post("/", requireAdmin, createSellerController);
router.get("/:id", adminOrSelf, getSellerController);
router.put("/:id", adminOrSelf, updateSellerController);
router.delete("/:id", requireAdmin, deleteSellerController);

module.exports = router;
