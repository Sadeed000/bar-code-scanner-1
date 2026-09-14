const test = require("node:test");
const assert = require("node:assert/strict");
const Review = require("../src/models/review.model");
const { getReviewSummary } = require("../src/services/review.service");

test("review summary pages in the database and searches literal category/uploader text", async t => {
  let filter, offset, limit, projection;
  t.mock.method(Review, "countDocuments", async value => { filter = value; return 25; });
  t.mock.method(Review, "find", value => {
    assert.deepEqual(value, filter);
    const query = {
      select(value) { projection = value; return query; },
      sort(value) { assert.deepEqual(value, { createdAt: -1, _id: -1 }); return query; },
      skip(value) { offset = value; return query; },
      limit(value) { limit = value; return query; },
      lean: async () => [{ category: "cafe", reviewCount: 5 }],
    };
    return query;
  });
  const result = await getReviewSummary({ page: "2", limit: "10", q: "cafe (new)" });
  assert.equal(offset, 10);
  assert.equal(limit, 10);
  assert.equal(result.total, 25);
  assert.equal(result.totalPages, 3);
  assert.equal(result.page, 2);
  assert.equal(projection, "category reviewCount uploadedBy createdAt");
  assert.deepEqual(filter.reviewCount, { $gt: 0 });
  assert.equal(filter.$or[0].category.$regex, "cafe \\(new\\)");
  assert.equal(filter.$or[1].uploadedBy.$options, "i");
  assert.equal((await getReviewSummary({ page: 99 })).page, 3);
  assert.equal(offset, 20);
  t.mock.method(Review, "countDocuments", async () => 0);
  const empty = await getReviewSummary({ page: -1, limit: 500 });
  assert.equal(empty.page, 1);
  assert.equal(empty.limit, 100);
  assert.equal(empty.total, 0);
});
