const { uploadRoot } = require("../config/uploads");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

fs.mkdirSync(path.join(uploadRoot, "logos"), { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    // LOGO & WATERMARK
    if (file.fieldname === "logo" || file.fieldname === "watermark") {
      return cb(null, path.join(uploadRoot, "logos"));
    }

    // GALLERY
    if (file.fieldname === "gallery") {

      const brandName = req.body.name
        ? req.body.name.replace(/\s+/g, "-").toLowerCase()
        : "default";

      const folder = path.join(uploadRoot, brandName);

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      return cb(null, folder);
    }

    // REVIEW CSV FILE
    if (file.fieldname === "file") {

      const folder = path.join(uploadRoot, "reviews");

      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      return cb(null, folder);
    }

    cb(null, uploadRoot);
  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }

});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = { upload };