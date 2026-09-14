const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

for (const base of ['..', '../src']) {
  function load(file, dependencies) {
    const filename = path.resolve(__dirname, base, file);
    const module = { exports: {} };
    vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
      module, exports: module.exports, process, console,
      require: name => name in dependencies ? dependencies[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })),
    }, { filename });
    return module.exports;
  }
  function setup(conflict = null) {
    const writes = [];
    const qr = [];
    const model = {
      findById: async () => ({ slug: "kulsum's-kaya-kalp" }),
      findOne: async () => conflict,
      findByIdAndUpdate: async (id, payload) => { writes.push(payload); return payload; },
      create: async payload => payload,
    };
    const service = load('services/brand.service.js', {
      '../models/BrandProfile': model,
      '../models/qrScan.model': {},
      qrcode: { toDataURL: async url => { qr.push(url); return 'qr-image'; } },
    });
    return { service, writes, qr, model };
  }
  test(`${base}: logo update preserves legacy slug and QR even when canonical slug is occupied`, async () => {
    const { service, writes, qr } = setup({ slug: 'kulsum-s-kaya-kalp' });
    const payload = { slug: "kulsum's-kaya-kalp", logoUrl: '/uploads/logos/new.png' };
    await service.updateBrand('brand-id', payload);
    assert.equal(writes[0].logoUrl, payload.logoUrl);
    assert.equal('slug' in writes[0], false);
    assert.equal('qrCodeUrl' in writes[0], false);
    assert.equal(qr.length, 0);
    assert.equal(payload.slug, "kulsum's-kaya-kalp");
  });
  test(`${base}: logo-only update does not write a slug`, async () => {
    const { service, writes } = setup();
    await service.updateBrand('brand-id', { logoUrl: '/uploads/logos/new.png' });
    assert.equal('slug' in writes[0], false);
  });
  test(`${base}: explicit slug collision rejected before write`, async () => {
    const { service, writes } = setup({});
    await assert.rejects(service.updateBrand('brand-id', { slug: 'kulsum-s-kaya-kalp' }), { status: 409 });
    assert.equal(writes.length, 0);
  });
  test(`${base}: create and explicit rename normalize consistently and generate QR`, async () => {
    const { service, writes, qr } = setup();
    const created = await service.createBrand({ name: "New Brand's Name" });
    await service.updateBrand('brand-id', { slug: "New Brand's Name" });
    assert.equal(created.slug, 'new-brand-s-name');
    assert.equal(writes[0].slug, created.slug);
    assert.equal(writes[0].qrCodeUrl, 'qr-image');
    assert.equal(qr[0], qr[1]);
  });
  test(`${base}: empty slug rejected`, async () => {
    const { service } = setup();
    await assert.rejects(service.updateBrand('brand-id', { slug: '!!!' }), { status: 400 });
    await assert.rejects(service.createBrand({ name: '!!!' }), { status: 400 });
  });
  test(`${base}: database duplicate races return HTTP 409 for create and update`, async () => {
    const duplicate = async () => { throw Object.assign(new Error('E11000'), { code: 11000 }); };
    const controller = load('controllers/brand.controller.js', {
      '../services/brand.service': { createBrand: duplicate, updateBrand: duplicate },
      '../models/BrandProfile': { findById: async () => ({ gallery: [] }) },
    });
    for (const action of ['createBrandController', 'updateBrandController']) {
      const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
      await controller[action]({ body: { name: 'Brand' }, user: { _id: 'user' }, params: { id: 'brand' } }, res);
      assert.equal(res.code, 409);
      assert.match(res.body.message, /different slug/);
    }
  });
}
