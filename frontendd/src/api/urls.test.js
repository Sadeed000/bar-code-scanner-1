import test from "node:test";
import assert from "node:assert/strict";
import { resolveApiBase, resolveAssetUrl } from "./urls.js";

test("same-origin API follows the deployed domain, with local and separate-host support", () => {
  assert.equal(resolveApiBase("/api", "https://demo.example.com"), "https://demo.example.com/api");
  assert.equal(resolveApiBase("", "http://localhost:5173"), "http://localhost:5173/api");
  assert.equal(resolveApiBase("https://api.example.com/api/", "https://demo.example.com"), "https://api.example.com/api");
});

test("all uploaded asset paths use the API host, including legacy local URLs", () => {
  const base = "https://api.example.com/api";
  for (const value of ["/uploads/logos/logo.png", "uploads/logos/logo.png", "http://localhost:9797/uploads/logos/logo.png", "http://127.0.0.1:9797/uploads/logos/logo.png"]) {
    assert.equal(resolveAssetUrl(value, base), "https://api.example.com/uploads/logos/logo.png");
  }
  assert.equal(resolveAssetUrl("/uploads/background image.png", base), "https://api.example.com/uploads/background%20image.png");
  assert.equal(resolveAssetUrl("/uploads/logo.png", "https://api.example.com/platform/api"), "https://api.example.com/platform/uploads/logo.png");
});

test("external images, QR data URLs, local previews, and missing images are preserved", () => {
  const base = "https://api.example.com/api";
  for (const value of ["https://cdn.example.com/logo.png", "data:image/png;base64,abc", "blob:https://demo.example.com/preview"]) assert.equal(resolveAssetUrl(value, base), value);
  assert.equal(resolveAssetUrl("//cdn.example.com/logo.png", base), "https://cdn.example.com/logo.png");
  assert.equal(resolveAssetUrl(undefined, base), "");
});
