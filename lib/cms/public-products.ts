import "server-only";

import { unstable_cache } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { CMS_CACHE_TAGS, CMS_REVALIDATE_SECONDS } from "@/lib/cms/cache";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const productInclude = {
  category: { select: { name: true, slug: true } },
  mainImageMedia: { select: { url: true, alt: true } },
  galleryMedia: { select: { url: true, alt: true }, orderBy: { createdAt: "asc" as const } },
};

const getPublishedProductsCached = unstable_cache(async () => {
  try {
    return await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: productInclude,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Unable to load published products", error);
    return [];
  }
}, ["cms-published-products-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.products, CMS_CACHE_TAGS.categories],
});

export async function getPublishedProducts() {
  if (!isDatabaseConfigured()) return [];
  return getPublishedProductsCached();
}

const getPublishedProductCached = unstable_cache(async (slug: string) => {
  try {
    return await prisma.product.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: productInclude,
    });
  } catch (error) {
    console.error(`Unable to load product '${slug}'`, error);
    return null;
  }
}, ["cms-published-product-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.products, CMS_CACHE_TAGS.categories],
});

export async function getPublishedProduct(slug: string) {
  if (!isDatabaseConfigured()) return null;
  return getPublishedProductCached(slug);
}

export function productExcerpt(description: string | null) {
  const text = sanitizeHtml(description || "", { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
  return text.length > 190 ? `${text.slice(0, 190)}…` : text;
}

export function productImages(product: {
  name: string;
  mainImage: string | null;
  gallery: string[];
  mainImageMedia: { url: string; alt: string | null } | null;
  galleryMedia: Array<{ url: string; alt: string | null }>;
}) {
  const main = product.mainImageMedia?.url || product.mainImage || product.galleryMedia[0]?.url || product.gallery[0] || "/assets/luxury-gift-box-square.jpg";
  const candidates = [
    ...product.galleryMedia.map((media) => ({ url: media.url, alt: media.alt || product.name })),
    ...product.gallery.map((url) => ({ url, alt: product.name })),
  ];
  const seen = new Set<string>([main]);
  const gallery = candidates.filter(({ url }) => url && !seen.has(url) && seen.add(url)).slice(0, 8);
  return { main, gallery };
}

export type ProductSpecification = { name: string; value: string };

export function productSpecifications(value: unknown): ProductSpecification[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({ name: String(row.name || "").trim(), value: String(row.value || "").trim() }))
    .filter((row) => row.name && row.value)
    .slice(0, 80);
}
