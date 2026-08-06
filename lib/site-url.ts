export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") || "http://localhost:3100";
}

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteOrigin();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
