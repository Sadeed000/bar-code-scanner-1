// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const { connectDB } = require("./config/db");
// // const { ensureSeedAdmin } = require("./services/auth.service");

// const authRoutes = require("./routes/auth.routes");
// const brandRoutes = require("./routes/brand.routes");
// const sellerRoutes = require("./routes/seller.routes");
// const qrRoutes = require("./routes/qr.routes");

// async function bootstrap() {
//   await connectDB(process.env.MONGO_URI);

//   // await ensureSeedAdmin({
//   //   email: process.env.ADMIN_EMAIL,
//   //   password: process.env.ADMIN_PASSWORD,
//   // });

//   const app = express();
//   app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
//   app.use(express.json({ limit: "1mb" }));
  
//   // Serve uploaded files as static assets
//   app.use("/uploads", express.static("uploads"));

//   app.get("/health", (req, res) => res.json({ ok: true }));

//   app.use("/api/auth", authRoutes);
//   app.use("/api/brands", brandRoutes);
//   app.use("/api/sellers", sellerRoutes);
//     app.use("/api/qr-code", qrRoutes);


//   const port = process.env.PORT || 5000;
//   app.listen(port, () => console.log(`✅ API running on http://localhost:${port}`));
// }

// bootstrap().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { connectDB } = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const brandRoutes = require("./routes/brand.routes");
const sellerRoutes = require("./routes/seller.routes");
const qrRoutes = require("./routes/qr.routes");
const reviewRoutes = require("./routes/review.routes");
async function bootstrap() {
  await connectDB(process.env.MONGO_URI);

  const app = express();

app.use(
  cors({
    origin: true,   // allow all origins
    credentials: true,
  })
);
  app.use(express.json({ limit: "1mb" }));

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  // ===============================
  // 🔥 React Build Path
  // ===============================
  const distPath = path.join(__dirname, "dist");

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
  app.use("/api/brands", brandRoutes);
  app.use("/api/sellers", sellerRoutes);
  app.use("/api/qr-code", qrRoutes);
app.use("/api/reviews", reviewRoutes);
  // ===============================
  // Serve React Static
  // ===============================
  app.use(express.static(distPath));

  // React Router fallback (IMPORTANT FIX)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  const port = process.env.PORT || 5000;

  app.listen(port, () =>
    console.log(`🚀 Server running on http://localhost:${port}`)
  );
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});