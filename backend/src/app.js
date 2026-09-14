const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { uploadRoot } = require("../config/uploads");
const { resolveFrontendDist } = require("../config/frontend");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const brandRoutes = require("./routes/brand.routes");
const sellerRoutes = require("./routes/seller.routes");
const qrRoutes = require("./routes/qr.routes");
const reviewRoutes = require("./routes/review.routes");
function createApp() {
  const app = express();

app.use(
  cors({
    origin: true,   // allow all origins
    credentials: true,
  })
);
  app.use(express.json({ limit: "1mb" }));

  // Serve uploaded files
  app.use("/uploads", express.static(uploadRoot));
  app.use("/uploads", (req, res) => res.status(404).json({ message: "Uploaded file not found" }));

  // ===============================
  // 🔥 React Build Path
  // ===============================
  const distPath = resolveFrontendDist();

  console.log("Serving React build from:", distPath);

  if (!fs.existsSync(distPath)) {
    console.log("⚠️ dist folder not found");
  } else {
    console.log("✅ dist folder found");
  }

  // ===============================
  // API Routes
  // ===============================
  app.get("/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/buyers", require("./routes/buyer.routes"));
  app.use("/api/brands", brandRoutes);
  app.use("/api/sellers", sellerRoutes);
  app.use("/api/qr-code", qrRoutes);
app.use("/api/reviews", reviewRoutes);
  // ===============================
  // Serve React Static
  // ===============================
  app.use("/api", (req, res) => res.status(404).json({ message: "API route not found" }));
  app.use(express.static(distPath));

  // React Router fallback (IMPORTANT FIX)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // Upload errors are thrown by multer before any controller runs, so without
  // this they surface as an opaque 500 with no message.
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      console.error("Upload error:", err.code, err.field);

      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: `"${err.field}" is too large. Maximum size is 10MB.`,
        });
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          message: `Unexpected upload field "${err.field}".`,
        });
      }

      return res.status(400).json({ message: err.message });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  });

  return app;
}

async function bootstrap() {
  await connectDB(process.env.MONGO_URI);
  const app = createApp();
  const port = process.env.PORT || 9798;
  return app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`)
  );
}

if (require.main === module) {
  bootstrap().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { createApp, bootstrap };