import "server-only";

import { unstable_cache } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { CMS_CACHE_TAGS, CMS_REVALIDATE_SECONDS } from "@/lib/cms/cache";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

function plainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

function headingId(label: string, index: number) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return slug || `section-${index + 1}`;
}

export function prepareArticleContent(html: string) {
  const toc: Array<{ id: string; label: string }> = [];
  const used = new Set<string>();
  const content = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/gi, (_match, level: string, inner: string) => {
    const label = plainText(inner) || `Section ${toc.length + 1}`;
    const base = headingId(label, toc.length);
    let id = base;
    let suffix = 2;
    while (used.has(id)) id = `${base}-${suffix++}`;
    used.add(id);
    toc.push({ id, label });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { content, toc };
}

export function estimateReadingTime(content: string) {
  const text = plainText(content);
  const latinWords = text.match(/[a-zA-Z0-9]+/g)?.length || 0;
  const cjkCharacters = text.match(/[\u3400-\u9fff]/g)?.length || 0;
  return Math.max(1, Math.ceil((latinWords + cjkCharacters / 2) / 200));
}

export function cmsDate(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : new Date(value || 0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

const getPublishedArticlesCached = unstable_cache(async () => {
  try {
    return await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("Unable to load published articles", error);
    return [];
  }
}, ["cms-published-articles-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.articles, CMS_CACHE_TAGS.categories],
});

export async function getPublishedArticles() {
  if (!isDatabaseConfigured()) return [];
  return getPublishedArticlesCached();
}

const getPublishedArticleCached = unstable_cache(async (slug: string) => {
  try {
    return await prisma.article.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { category: { select: { name: true, slug: true } } },
    });
  } catch (error) {
    console.error(`Unable to load article '${slug}'`, error);
    return null;
  }
}, ["cms-published-article-v1"], {
  revalidate: CMS_REVALIDATE_SECONDS,
  tags: [CMS_CACHE_TAGS.articles, CMS_CACHE_TAGS.categories],
});

export async function getPublishedArticle(slug: string) {
  if (!isDatabaseConfigured()) return null;
  return getPublishedArticleCached(slug);
}

export function articleExcerpt(description: string | null, content: string) {
  return description?.trim() || `${plainText(content).slice(0, 180)}${plainText(content).length > 180 ? "…" : ""}`;
}
