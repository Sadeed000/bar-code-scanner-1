const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Seller = require("../src/models/Seller");
const Brand = require("../src/models/BrandProfile");
const { requireAuth, requireBrandAccess } = require("../src/middleware/auth.middleware");
const { listBrands, listBrandsPaged } = require("../src/services/brand.service");
const { login } = require("../src/services/auth.service");

test("buyer lifecycle and API permissions enforce assigned brand access", async t => {
  process.env.JWT_SECRET = "buyer-test-secret";
  const brandId = "111111111111111111111111";
  const otherId = "222222222222222222222222";
  const buyerId = "333333333333333333333333";
  let user = { _id: buyerId, role: "BUYER", isActive: true, assignedBrands: [brandId], tokenVersion: 0 };
  t.mock.method(Seller, "findById", () => ({ select: async () => user }));
  t.mock.method(Brand, "findById", async id => ({ _id: id, createdBy: "another-seller" }));
  t.mock.method(Brand, "countDocuments", async () => 1);
  let written;
  t.mock.method(Seller, "create", async payload => { written = payload; return { toObject: () => ({ ...payload, _id: buyerId }) }; });
  t.mock.method(Seller, "findOneAndUpdate", (filter, update) => {
    assert.equal(filter.role, "BUYER"); written = update;
    return { select: async () => ({ _id: buyerId, ...update.$set, passwordHash: undefined }) };
  });
  const app = express();
  app.use(express.json());
  app.use("/buyers", require("../src/routes/buyer.routes"));
  app.use("/brands", require("../src/routes/brand.routes"));
  app.use("/sellers", require("../src/routes/seller.routes"));
  app.use("/reviews", require("../src/routes/review.routes"));
  app.put("/access/:id", requireAuth, requireBrandAccess, (req, res) => res.json({ ok: true }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise(resolve => server.once("listening", resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const token = jwt.sign({ sub: buyerId, role: "ADMIN", tokenVersion: 0 }, process.env.JWT_SECRET);
  const request = (url, method = "GET", body) => fetch(`http://127.0.0.1:${server.address().port}${url}`, {
    method, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  // The role in the database wins over stale token claims.
  assert.equal((await request("/buyers")).status, 403);
  assert.equal((await request("/buyers", "POST", {})).status, 403);
  assert.equal((await request("/sellers", "POST", {})).status, 403);
  assert.equal((await request("/brands", "POST", {})).status, 403);
  assert.equal((await request(`/brands/${brandId}`, "DELETE")).status, 403);
  assert.equal((await request("/brands/stats")).status, 403);
  assert.equal((await request("/reviews/category", "POST", {})).status, 403);
  assert.equal((await request(`/access/${brandId}`, "PUT")).status, 200);
  assert.equal((await request(`/access/${otherId}`, "PUT")).status, 403);
  assert.equal((await request(`/brands/${otherId}`, "PUT", { name: "Changed" })).status, 403);
  assert.equal((await request("/access/invalid", "PUT")).status, 400);
  let brandUpdate;
  t.mock.method(Brand, "findByIdAndUpdate", async (id, payload) => { brandUpdate = payload; return payload; });
  assert.equal((await request(`/brands/${brandId}`, "PUT", { name: "Updated brand", amount: 1, paymentType: "online", createdBy: buyerId })).status, 200);
  assert.equal(brandUpdate.name, "Updated brand");
  assert.equal(brandUpdate.amount, undefined);
  assert.equal(brandUpdate.paymentType, undefined);
  assert.equal(brandUpdate.createdBy, undefined);
  user.assignedBrands = [];
  assert.equal((await request(`/access/${brandId}`, "PUT")).status, 403);
  user.isActive = false;
  assert.equal((await request(`/access/${brandId}`, "PUT")).status, 401);
  user.isActive = true; user.tokenVersion = 1;
  assert.equal((await request(`/access/${brandId}`, "PUT")).status, 401);
  user = { ...user, role: "SELLER", tokenVersion: 0 };
  assert.equal((await request("/brands", "POST", {})).status, 403);
  user = { ...user, role: "ADMIN", tokenVersion: 0 };
  assert.equal((await request("/brands", "POST", {})).status, 400);
  assert.equal((await request(`/access/${otherId}`, "PUT")).status, 200);

  const payload = { name: "Buyer One", email: "Buyer@example.com", password: "abcd", assignedBrands: [brandId, brandId], isActive: true };
  let response = await request("/buyers", "POST", payload);
  assert.equal(response.status, 201);
  assert.equal((await response.json()).passwordHash, undefined);
  assert.equal(written.role, "BUYER");
  assert.equal(written.email, "buyer@example.com");
  assert.deepEqual(written.assignedBrands, [brandId]);
  assert.ok(await bcrypt.compare(payload.password, written.passwordHash));
  response = await request(`/buyers/${buyerId}`, "PUT", payload);
  assert.equal(response.status, 200);
  assert.equal(written.$inc.tokenVersion, 1);
  assert.equal((await request("/buyers", "POST", { ...payload, password: "abc" })).status, 400);
  assert.equal((await request("/buyers", "POST", { ...payload, assignedBrands: ["bad"] })).status, 400);
  t.mock.method(Brand, "countDocuments", async () => 0);
  assert.equal((await request("/buyers", "POST", payload)).status, 400);

  // Both list modes must filter by assignment, even when a buyer created a brand previously.
  const filters = [];
  t.mock.method(Brand, "find", filter => {
    filters.push(filter);
    const query = { populate: () => query, sort: () => query, skip: () => query, limit: async () => [] };
    return query;
  });
  await listBrands({ role: "BUYER", _id: buyerId, assignedBrands: [brandId] });
  await listBrandsPaged({ role: "BUYER", _id: buyerId, assignedBrands: [] });
  assert.deepEqual(filters[0], { _id: { $in: [brandId] } });
  assert.deepEqual(filters[1], { _id: { $in: [] } });

  const account = { ...user, role: "BUYER", email: payload.email, passwordHash: await bcrypt.hash(payload.password, 4) };
  account.toObject = () => ({ ...account });
  t.mock.method(Seller, "findOne", async () => account);
  const session = await login(payload);
  assert.equal(session.user.passwordHash, undefined);
  assert.equal(jwt.verify(session.token, process.env.JWT_SECRET).role, "BUYER");
  account.isActive = false;
  assert.equal(await login(payload), null);
});
