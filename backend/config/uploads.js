const path = require("path");

// Use the same directory for uploads and static serving, regardless of cwd.
// Set UPLOAD_DIR to a persistent disk location on the deployment server.
const uploadRoot = path.resolve(__dirname, "..", process.env.UPLOAD_DIR || "uploads");
module.exports = { uploadRoot };
