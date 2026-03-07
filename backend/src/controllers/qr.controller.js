const QRScan = require("../models/qrScan.model");
const Brand = require("../models/BrandProfile.js");



// TRACK QR SCAN
exports.trackQRScan = async (req, res) => {
  try {
    const { slug } = req.params;

    const brand = await Brand.findOne({ slug });

    if (!brand) {
      return res.status(404).send("Brand not found");
    }

    const userAgent = req.headers["user-agent"] || "";

    let device = "desktop";

    if (/mobile/i.test(userAgent)) device = "mobile";
    if (/tablet/i.test(userAgent)) device = "tablet";

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    await QRScan.create({
      brandId: brand._id,
      slug,
      ip,
      userAgent,
      device,
    });

    // redirect visitor to the public profile page on the front-end
    const clientBase = process.env.CLIENT_URL || "";
    return res.redirect(`${clientBase}/p/${slug}`);

  } catch (error) {
    console.error(error);

    // fall back to client URL on error
    const clientBase = process.env.CLIENT_URL || "";
    res.redirect(`${clientBase}/p/${req.params.slug}`);
  }
};



/*
GET SCAN COUNT OF SPECIFIC BRAND
*/
exports.getBrandScanCount = async (req, res) => {
  try {

    const { slug } = req.params;

    const count = await QRScan.countDocuments({ slug });

    res.json({
      brand: slug,
      scans: count,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching scan count",
    });
  }
};




exports.trackScanAPI = async (req, res) => {
  try {
    const { slug } = req.params;

    const brand = await Brand.findOne({ slug });

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const userAgent = req.headers["user-agent"] || "";

    let device = "desktop";

    if (/mobile/i.test(userAgent)) device = "mobile";
    if (/tablet/i.test(userAgent)) device = "tablet";

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress ||
      "";

    await QRScan.create({
      brandId: brand._id,
      slug,
      ip,
      userAgent,
      device,
    });

    res.json({ success: true });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to track scan" });
  }
};

/*
GET ALL BRAND SCAN COUNTS
*/
exports.getAllBrandScanCounts = async (req, res) => {
  try {

    const result = await QRScan.aggregate([
      {
        $group: {
          _id: "$slug",
          scans: { $sum: 1 },
        },
      },
      {
        $sort: { scans: -1 },
      },
    ]);

    res.json(result);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching analytics",
    });
  }
};