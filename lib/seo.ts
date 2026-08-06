import { absoluteUrl } from "@/lib/site-url";

export function parseCanonicalUrl(input: string) {
  const value = input.trim();
  if (!value) return { valid: true, value: null } as const;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return { valid: true, value: value.slice(0, 1000) } as const;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return { valid: false, value: null } as const;
    url.hash = "";
    return { valid: true, value: url.toString().slice(0, 1000) } as const;
  } catch {
    return { valid: false, value: null } as const;
  }
}

export function resolveCanonicalUrl(customUrl: string | null | undefined, fallbackPath: string) {
  const parsed = parseCanonicalUrl(customUrl || "");
  if (parsed.valid && parsed.value) {
    return /^https?:\/\//i.test(parsed.value) ? parsed.value : absoluteUrl(parsed.value);
  }
  return absoluteUrl(fallbackPath);
}
