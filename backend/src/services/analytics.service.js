const Brand = require("../models/BrandProfile");
const Seller = require("../models/Seller");
const QRScan = require("../models/qrScan.model");

exports.getAnalytics = async ({ page = 1, limit = 10, q = "" } = {}) => {
  const size = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10)) : 10;
  const requested = Number.isFinite(Number(page)) ? Math.max(1, Math.floor(Number(page)) || 1) : 1;
  const term = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = term ? { $or: ["name", "slug", "createdBy.name"].map(field => ({ [field]: { $regex: term, $options: "i" } })) } : {};
  const creator = [
    { $lookup: { from: Seller.collection.name, localField: "createdBy", foreignField: "_id", pipeline: [{ $project: { name: 1 } }], as: "createdBy" } },
    { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
  ];
  const scanCount = [
    { $lookup: { from: QRScan.collection.name, localField: "_id", foreignField: "brandId", pipeline: [{ $count: "count" }], as: "scanCounts" } },
    { $set: { scanCount: { $ifNull: [{ $arrayElemAt: ["$scanCounts.count", 0] }, 0] } } },
  ];
  const [metadata] = await Brand.aggregate([{ $facet: {
    totals: [...scanCount, { $group: { _id: null, totalBrands: { $sum: 1 }, totalScans: { $sum: "$scanCount" } } }],
    matched: [...creator, { $match: match }, { $count: "count" }],
  } }]);
  const total = metadata.matched[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(requested, totalPages);
  const items = await Brand.aggregate([
    ...creator, { $match: match }, { $sort: { createdAt: -1, _id: -1 } },
    { $skip: (current - 1) * size }, { $limit: size }, ...scanCount,
    { $project: { name: 1, slug: 1, createdBy: 1, scanCount: 1 } },
  ]);
  const totals = metadata.totals[0] || { totalBrands: 0, totalScans: 0 };
  return { items, total, page: current, limit: size, totalPages, totals: { totalBrands: totals.totalBrands, totalScans: totals.totalScans } };
};
