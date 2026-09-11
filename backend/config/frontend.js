const path = require("path");
const fs = require("fs");

function resolveFrontendDist() {
  const backendRoot = path.resolve(__dirname, "..");
  if (process.env.FRONTEND_DIST) return path.resolve(backendRoot, process.env.FRONTEND_DIST);
  // Support both existing deployment layouts and the normal Vite build output.
  const candidates = [
    path.join(backendRoot, "dist"),
    path.join(backendRoot, "src", "dist"),
    path.resolve(backendRoot, "../frontendd/dist"),
  ];
  return candidates.find(folder => fs.existsSync(path.join(folder, "index.html"))) || candidates[0];
}

module.exports = { resolveFrontendDist };
