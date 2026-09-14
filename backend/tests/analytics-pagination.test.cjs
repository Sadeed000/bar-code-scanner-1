const test = require("node:test");
const assert = require("node:assert/strict");
const Brand = require("../src/models/BrandProfile");
const { getAnalytics } = require("../src/services/analytics.service");

test("analytics pages and searches in MongoDB while keeping global totals", async t => {
  const pipelines = [];
  t.mock.method(Brand, "aggregate", async pipeline => {
    pipelines.push(pipeline);
    return pipeline[0].$facet
      ? [{ totals: [{ totalBrands: 128, totalScans: 14332 }], matched: [{ count: 23 }] }]
      : [{ name: "Cafe", scanCount: 0 }];
  });
  const result = await getAnalytics({ page: 2, limit: 10, q: "Cafe (new)" });
  assert.equal(result.total, 23);
  assert.equal(result.page, 2);
  assert.equal(result.totalPages, 3);
  assert.deepEqual(result.totals, { totalBrands: 128, totalScans: 14332 });
  assert.equal(pipelines[1].find(stage => stage.$skip !== undefined).$skip, 10);
  assert.equal(pipelines[1].find(stage => stage.$limit).$limit, 10);
  const search = pipelines[1].find(stage => stage.$match).$match;
  assert.equal(search.$or[2]["createdBy.name"].$regex, "Cafe \\(new\\)");
  assert.equal((await getAnalytics({ page: 100 })).page, 3);
  t.mock.method(Brand, "aggregate", async pipeline => pipeline[0].$facet ? [{ totals: [], matched: [] }] : []);
  const empty = await getAnalytics();
  assert.equal(empty.total, 0);
  assert.equal(empty.page, 1);
  assert.deepEqual(empty.totals, { totalBrands: 0, totalScans: 0 });
});
