"use server";

import { Prisma, PublishStatus } from "@/lib/generated/prisma";
import sanitizeHtml from "sanitize-html";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CMS_CACHE_TAGS } from "@/lib/cms/cache";
import { requireAdmin } from "@/lib/cms/session";
import { prisma } from "@/lib/db/prisma";
import { parseCanonicalUrl } from "@/lib/seo";

function value(formData: FormData, key: string, max = 5000) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim().slice(0, max) : "";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function parseKeywords(input: string) {
  return [...new Set(input.split(/[,，\n]/).map((keyword) => keyword.trim()).filter(Boolean))]
    .slice(0, 30)
    .map((keyword) => keyword.slice(0, 80));
}

function cleanContent(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [
      "p", "br", "strong", "em", "s", "blockquote", "h2", "h3",
      "ul", "ol", "li", "a", "img", "hr", "code", "pre",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
}

function editorPath(id: string, error: string) {
  return `/admin/articles/${id || "new"}?error=${error}`;
}

export async function saveDatabaseArticleAction(formData: FormData) {
  await requireAdmin();

  const id = value(formData, "id", 36);
  const title = value(formData, "title", 240);
  const slug = slugify(value(formData, "slug", 180) || title);
  if (!title) redirect(editorPath(id, "title"));
  if (!slug) redirect(editorPath(id, "slug-format"));

  const categoryId = value(formData, "categoryId", 36) || null;
  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, type: "ARTICLE" }, select: { id: true } });
    if (!category) redirect(editorPath(id, "category"));
  }

  const canonical = parseCanonicalUrl(value(formData, "canonicalUrl", 1000));
  if (!canonical.valid) redirect(editorPath(id, "canonical"));

  const requestedStatus = value(formData, "status", 20);
  const status = requestedStatus === "PUBLISHED"
    ? PublishStatus.PUBLISHED
    : requestedStatus === "ARCHIVED"
      ? PublishStatus.ARCHIVED
      : PublishStatus.DRAFT;
  const existing = id ? await prisma.article.findUnique({ where: { id }, select: { slug: true, publishedAt: true } }) : null;
  if (id && !existing) redirect("/admin/articles?error=not-found");

  const data = {
    title,
    slug,
    cover: value(formData, "cover", 1000) || null,
    coverMediaId: value(formData, "coverMediaId", 36) || null,
    description: value(formData, "description", 1000) || null,
    content: cleanContent(value(formData, "content", 250000)),
    keywords: parseKeywords(value(formData, "keywords", 3000)),
    status,
    seoTitle: value(formData, "seoTitle", 240) || null,
    seoDescription: value(formData, "seoDescription", 500) || null,
    canonicalUrl: canonical.value,
    categoryId,
    publishedAt: status === PublishStatus.PUBLISHED ? existing?.publishedAt || new Date() : existing?.publishedAt || null,
  };

  let savedId = id;
  let duplicateSlug = false;
  try {
    if (id) {
      await prisma.article.update({ where: { id }, data });
    } else {
      const created = await prisma.article.create({ data, select: { id: true } });
      savedId = created.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") duplicateSlug = true;
    else throw error;
  }
  if (duplicateSlug) redirect(editorPath(id, "slug-duplicate"));

  updateTag(CMS_CACHE_TAGS.articles);
  updateTag(CMS_CACHE_TAGS.categories);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  if (existing?.slug && existing.slug !== slug) revalidatePath(`/blog/${existing.slug}`);
  redirect(`/admin/articles/${savedId}?saved=1`);
}

export async function deleteDatabaseArticleAction(id: string) {
  await requireAdmin();
  const article = await prisma.article.findUnique({ where: { id }, select: { slug: true } });
  if (!article) return;
  await prisma.article.delete({ where: { id } });
  updateTag(CMS_CACHE_TAGS.articles);
  updateTag(CMS_CACHE_TAGS.categories);
  revalidatePath("/admin/articles");
  revalidatePath("/blog");
  revalidatePath(`/blog/${article.slug}`);
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  redirect("/admin/articles?deleted=1");
}
