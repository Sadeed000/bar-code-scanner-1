const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");

test("uploaded images and production routes are served without a database connection", async () => {
  const parent = fs.realpathSync(os.tmpdir());
  const temp = fs.mkdtempSync(path.join(parent, "sparrownix-deployment-"));
  process.env.UPLOAD_DIR = path.join(temp, "uploads");
  process.env.FRONTEND_DIST = path.join(temp, "dist");
  process.env.JWT_SECRET = "isolated-upload-test-key";
  fs.mkdirSync(process.env.FRONTEND_DIST);
  fs.writeFileSync(path.join(process.env.FRONTEND_DIST, "index.html"), "<!doctype html><title>Deployment fixture</title>");
  const { createApp } = require("../src/app");
  const { upload } = require("../src/utils/upload");
  const jwt = require("jsonwebtoken");
  const Seller = require("../src/models/Seller");
  const originalFindById = Seller.findById;
  Seller.findById = () => ({ select: async () => ({ _id: "test-user", role: "ADMIN" }) });
  const app = createApp();
  // Exercise the real multipart storage used by brand forms, without writing database records.
  app.post("/test-brand-files", upload.fields([{ name: "logo" }, { name: "watermark" }, { name: "background" }, { name: "gallery" }]), (req, res) => {
    res.json(Object.values(req.files).flat().map(file => "/uploads/" + path.relative(process.env.UPLOAD_DIR, file.path).split(path.sep).join("/")));
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6VnAAAAAASUVORK5CYII=", "base64");
  try {
    // A mounted upload route must reject unauthenticated requests with 401,
    // rather than falling through to Express's "Cannot POST" 404 response.
    for (const method of ["GET", "POST"]) {
      const buyersResponse = await fetch(base + "/api/buyers", { method });
      assert.equal(buyersResponse.status, 401, "Buyer routes must be mounted in the app");
    }
    const unauthenticatedIcon = await fetch(base + "/api/brands/icon", { method: "POST" });
    assert.equal(unauthenticatedIcon.status, 401);
    assert.match(unauthenticatedIcon.headers.get("content-type"), /application\/json/);
    const form = new FormData();
    form.append("name", "Test Brand");
    for (const field of ["logo", "watermark", "background", "gallery"]) form.append(field, new Blob([image], { type: "image/png" }), field + ".png");
    const uploaded = await fetch(base + "/test-brand-files", { method: "POST", body: form });
    assert.equal(uploaded.status, 200);
    const paths = await uploaded.json();
    assert.equal(paths.length, 4);
    const icon = new FormData();
    icon.append("icon", new Blob([image], { type: "image/png" }), "icon.png");
    const iconResponse = await fetch(base + "/api/brands/icon", { method: "POST", body: icon, headers: { Authorization: "Bearer " + jwt.sign({ sub: "test-user", role: "ADMIN" }, process.env.JWT_SECRET) } });
    assert.equal(iconResponse.status, 200);
    paths.push((await iconResponse.json()).url);
    for (const url of paths) {
      const response = await fetch(base + url);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /image\/png/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), image);
    }
    assert.equal((await fetch(base + "/api/brands")).status, 401);
    for (const url of ["/api/missing", "/uploads/missing.png"]) {
      const response = await fetch(base + url);
      assert.equal(response.status, 404);
      assert.match(response.headers.get("content-type"), /application\/json/);
    }
    assert.match(await (await fetch(base + "/admin/brands")).text(), /Deployment fixture/);
  } finally {
    Seller.findById = originalFindById;
    await new Promise(resolve => server.close(resolve));
    // Remove only this test's freshly created temporary directory.
    const resolved = fs.realpathSync(temp);
    assert.equal(path.dirname(resolved), parent);
    assert.ok(path.basename(resolved).startsWith("sparrownix-deployment-"));
    fs.rmSync(resolved, { recursive: true, force: true });
  }
});
