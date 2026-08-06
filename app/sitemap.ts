import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/cms/public-articles";
import { getPublicCategories } from "@/lib/cms/public-categories";
import { getPublishedProducts } from "@/lib/cms/public-products";
import { resolveCanonicalUrl } from "@/lib/seo";
import { absoluteUrl, siteOrigin } from "@/lib/site-url";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, products, categories] = await Promise.all([
    getPublishedArticles(),
    getPublishedProducts(),
    getPublicCategories(),
  ]);
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/category"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/inquiry"), changeFrequency: "monthly", priority: 0.6 },
  ];
  const origin = siteOrigin();
  const sameSiteCanonical = (customUrl: string | null, fallbackPath: string) => {
    const url = resolveCanonicalUrl(customUrl, fallbackPath);
    return url === origin || url.startsWith(`${origin}/`) ? url : null;
  };
  return [
    ...staticPages,
    ...products.flatMap((product) => {
      const url = sameSiteCanonical(product.canonicalUrl, `/products/${product.slug}`);
      return url ? [{ url, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }] : [];
    }),
    ...articles.flatMap((article) => {
      const url = sameSiteCanonical(article.canonicalUrl, `/blog/${article.slug}`);
      return url ? [{ url, lastModified: article.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }] : [];
    }),
    ...categories.map((category) => ({ url: absoluteUrl(`/category/${category.type === "ARTICLE" ? "articles" : "products"}/${category.slug}`), lastModified: category.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
