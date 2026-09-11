// Pure helpers shared by the API client, image previews, and public profiles.
export function resolveApiBase(configured, siteOrigin) {
  return new URL(configured?.trim() || "/api", siteOrigin).href.replace(/\/+$/, "");
}

export function resolveAssetUrl(value, apiBase) {
  if (!value || typeof value !== "string") return "";
  if (/^(data:|blob:)/i.test(value)) return value;
  const base = new URL(apiBase);
  base.pathname = base.pathname.replace(/\/api\/?$/, "").replace(/\/+$/, "") + "/";
  base.search = "";
  base.hash = "";
  // Existing external/CDN URLs remain intact. Old local upload URLs follow
  // the current backend when a database is moved to a deployed server.
  if (/^(https?:)?\/\//i.test(value)) {
    const absolute = new URL(value, base);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(absolute.hostname);
    if (!local || !absolute.pathname.startsWith("/uploads/")) return absolute.href;
    value = absolute.pathname + absolute.search + absolute.hash;
  }
  return new URL(value.replace(/^\/+/, ""), base).href;
}
