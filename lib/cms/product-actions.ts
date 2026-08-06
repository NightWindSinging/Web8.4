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
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 180);
}

function parseKeywords(input: string) {
  return [...new Set(input.split(/[,，\n]/).map((keyword) => keyword.trim()).filter(Boolean))]
    .slice(0, 30)
    .map((keyword) => keyword.slice(0, 80));
}

function stringArray(input: string, max = 40) {
  try {
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? [...new Set(parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim().slice(0, 1200)))].slice(0, max) : [];
  } catch {
    return [];
  }
}

function specifications(input: string): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) return Prisma.JsonNull;
    const rows = parsed
      .filter((row) => row && typeof row === "object")
      .map((row) => ({ name: String(row.name || "").trim().slice(0, 160), value: String(row.value || "").trim().slice(0, 1000) }))
      .filter((row) => row.name && row.value)
      .slice(0, 80);
    return rows.length ? rows : Prisma.JsonNull;
  } catch {
    return Prisma.JsonNull;
  }
}

function cleanDescription(description: string) {
  return sanitizeHtml(description, {
    allowedTags: ["p", "br", "strong", "em", "s", "blockquote", "h2", "h3", "ul", "ol", "li", "a", "img", "hr", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "title"], code: ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: { a: (_tagName, attribs) => ({ tagName: "a", attribs: { ...attribs, rel: "noopener noreferrer" } }) },
  });
}

function editorPath(id: string, error: string) {
  return `/admin/products/${id || "new"}?error=${error}`;
}

export async function saveDatabaseProductAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 36);
  const name = value(formData, "name", 240);
  const slug = slugify(value(formData, "slug", 180) || name);
  if (!name) redirect(editorPath(id, "name"));
  if (!slug) redirect(editorPath(id, "slug-format"));

  const categoryId = value(formData, "categoryId", 36) || null;
  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, type: "PRODUCT" }, select: { id: true } });
    if (!category) redirect(editorPath(id, "category"));
  }

  const canonical = parseCanonicalUrl(value(formData, "canonicalUrl", 1000));
  if (!canonical.valid) redirect(editorPath(id, "canonical"));

  const requestedStatus = value(formData, "status", 20);
  const status = requestedStatus === "PUBLISHED" ? PublishStatus.PUBLISHED : requestedStatus === "ARCHIVED" ? PublishStatus.ARCHIVED : PublishStatus.DRAFT;
  const gallery = stringArray(value(formData, "gallery", 50000));
  const requestedMediaIds = stringArray(value(formData, "galleryMediaIds", 50000));
  const validMedia = requestedMediaIds.length ? await prisma.media.findMany({ where: { id: { in: requestedMediaIds } }, select: { id: true } }) : [];
  const validMediaIds = validMedia.map((media) => media.id);
  const requestedMainImageId = value(formData, "mainImageId", 36) || null;
  const mainImageId = requestedMainImageId && validMediaIds.includes(requestedMainImageId) ? requestedMainImageId : null;
  const existing = id ? await prisma.product.findUnique({ where: { id }, select: { slug: true } }) : null;
  if (id && !existing) redirect("/admin/products?error=not-found");

  const scalarData = {
    name,
    slug,
    mainImage: value(formData, "mainImage", 1200) || null,
    gallery,
    description: cleanDescription(value(formData, "description", 250000)) || null,
    specifications: specifications(value(formData, "specifications", 100000)),
    seoTitle: value(formData, "seoTitle", 240) || null,
    seoDescription: value(formData, "seoDescription", 500) || null,
    canonicalUrl: canonical.value,
    keywords: parseKeywords(value(formData, "keywords", 3000)),
    status,
  };

  let savedId = id;
  let duplicateSlug = false;
  try {
    if (id) {
      await prisma.product.update({
        where: { id },
        data: {
          ...scalarData,
          category: categoryId ? { connect: { id: categoryId } } : { disconnect: true },
          mainImageMedia: mainImageId ? { connect: { id: mainImageId } } : { disconnect: true },
          galleryMedia: { set: validMediaIds.map((mediaId) => ({ id: mediaId })) },
        },
      });
    } else {
      const created = await prisma.product.create({
        data: {
          ...scalarData,
          ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          ...(mainImageId ? { mainImageMedia: { connect: { id: mainImageId } } } : {}),
          galleryMedia: { connect: validMediaIds.map((mediaId) => ({ id: mediaId })) },
        },
        select: { id: true },
      });
      savedId = created.id;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") duplicateSlug = true;
    else throw error;
  }
  if (duplicateSlug) redirect(editorPath(id, "slug-duplicate"));

  updateTag(CMS_CACHE_TAGS.products);
  updateTag(CMS_CACHE_TAGS.categories);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  if (existing?.slug && existing.slug !== slug) revalidatePath(`/products/${existing.slug}`);
  redirect(`/admin/products/${savedId}?saved=1`);
}

export async function deleteDatabaseProductAction(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!product) return;
  await prisma.product.delete({ where: { id } });
  updateTag(CMS_CACHE_TAGS.products);
  updateTag(CMS_CACHE_TAGS.categories);
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  redirect("/admin/products?deleted=1");
}
