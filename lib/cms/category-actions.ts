"use server";

import { CategoryNavigationGroup, CategoryType, Prisma } from "@/lib/generated/prisma";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CMS_CACHE_TAGS } from "@/lib/cms/cache";
import { requireAdmin } from "@/lib/cms/session";
import { prisma } from "@/lib/db/prisma";

function value(formData: FormData, key: string, max = 5000) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim().slice(0, max) : "";
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160);
}

function categoriesPath(error?: string) {
  return error ? `/admin/categories?error=${error}` : "/admin/categories";
}

function navigationOrder(formData: FormData) {
  const parsed = Number.parseInt(value(formData, "navigationOrder", 4), 10);
  return Number.isFinite(parsed) ? Math.min(999, Math.max(0, parsed)) : 0;
}

export async function saveDatabaseCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 36);
  const name = value(formData, "name", 160);
  const slug = slugify(value(formData, "slug", 160) || name);
  const type = value(formData, "type", 20) === "PRODUCT" ? CategoryType.PRODUCT : CategoryType.ARTICLE;
  const requestedNavigationGroup = value(formData, "navigationGroup", 30);
  const navigationGroup = type === CategoryType.PRODUCT
    ? requestedNavigationGroup === "INDUSTRY"
      ? CategoryNavigationGroup.INDUSTRY
      : requestedNavigationGroup === "PACKAGING_TYPE"
        ? CategoryNavigationGroup.PACKAGING_TYPE
        : null
    : null;
  const navigationData = {
    navigationGroup,
    navigationOrder: type === CategoryType.PRODUCT ? navigationOrder(formData) : 0,
    navigationImage: type === CategoryType.PRODUCT ? value(formData, "navigationImage", 1200) || null : null,
  };
  if (!name) redirect(categoriesPath("name"));
  if (!slug) redirect(categoriesPath("slug-format"));

  const existing = id ? await prisma.category.findUnique({ where: { id }, include: { _count: { select: { articles: true, products: true } } } }) : null;
  if (id && !existing) redirect(categoriesPath("not-found"));
  if (existing && existing.type !== type && existing._count.articles + existing._count.products > 0) {
    redirect(`/admin/categories?edit=${id}&error=type-in-use`);
  }

  let duplicateSlug = false;
  try {
    if (id) {
      await prisma.category.update({ where: { id }, data: { name, slug, description: value(formData, "description", 5000) || null, type, ...navigationData } });
    } else {
      await prisma.category.create({ data: { name, slug, description: value(formData, "description", 5000) || null, type, ...navigationData } });
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") duplicateSlug = true;
    else throw error;
  }
  if (duplicateSlug) redirect(`/admin/categories${id ? `?edit=${id}&` : "?"}error=slug-duplicate`);

  updateTag(CMS_CACHE_TAGS.categories);
  updateTag(CMS_CACHE_TAGS.articles);
  updateTag(CMS_CACHE_TAGS.products);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/articles");
  revalidatePath("/admin/products");
  revalidatePath("/blog");
  revalidatePath("/products");
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  redirect(`/admin/categories?saved=${id ? "updated" : "created"}`);
}

export async function deleteDatabaseCategoryAction(id: string) {
  await requireAdmin();
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { articles: true, products: true } } } });
  if (!category) redirect(categoriesPath("not-found"));
  if (category._count.articles + category._count.products > 0) redirect(categoriesPath("in-use"));

  let blockedByRelation = false;
  try {
    await prisma.category.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") blockedByRelation = true;
    else throw error;
  }
  if (blockedByRelation) redirect(categoriesPath("in-use"));
  updateTag(CMS_CACHE_TAGS.categories);
  updateTag(CMS_CACHE_TAGS.articles);
  updateTag(CMS_CACHE_TAGS.products);
  revalidatePath("/admin/categories");
  revalidatePath("/blog");
  revalidatePath("/products");
  revalidatePath("/category", "layout");
  revalidatePath("/sitemap.xml");
  redirect("/admin/categories?deleted=1");
}
