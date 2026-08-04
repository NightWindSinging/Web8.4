"use server";

import { randomUUID } from "node:crypto";
import { lstat, unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminSession, destroyAdminSession, isAuthConfigured, requireAdmin, verifyCredentials } from "./session";
import { updateDatabase } from "./storage";
import type { PublishStatus } from "./types";

function value(formData: FormData, key: string, max = 5000) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim().slice(0, max) : "";
}

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

function status(formData: FormData): PublishStatus {
  return value(formData, "status") === "published" ? "published" : "draft";
}

export async function loginAction(formData: FormData) {
  if (!isAuthConfigured()) redirect("/admin/login?error=config");
  const username = value(formData, "username", 120);
  const password = value(formData, "password", 200);
  if (!(await verifyCredentials(username, password))) redirect("/admin/login?error=credentials");
  await createAdminSession(username);
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveArticleAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120) || randomUUID();
  const title = value(formData, "title", 240);
  if (!title) throw new Error("Article title is required.");
  const timestamp = new Date().toISOString();
  await updateDatabase((database) => {
    const existing = database.articles.find((article) => article.id === id);
    const article = {
      id,
      title,
      slug: slugify(value(formData, "slug", 120) || title),
      excerpt: value(formData, "excerpt", 600),
      content: value(formData, "content", 50000),
      categoryId: value(formData, "categoryId", 120),
      status: status(formData),
      seoTitle: value(formData, "seoTitle", 240),
      seoDescription: value(formData, "seoDescription", 320),
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    if (existing) Object.assign(existing, article);
    else database.articles.unshift(article);
  });
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?saved=1");
}

export async function deleteArticleAction(id: string) {
  await requireAdmin();
  await updateDatabase((database) => { database.articles = database.articles.filter((article) => article.id !== id); });
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const id = value(formData, "id", 120) || randomUUID();
  const name = value(formData, "name", 240);
  if (!name) throw new Error("Product name is required.");
  const timestamp = new Date().toISOString();
  await updateDatabase((database) => {
    const existing = database.products.find((product) => product.id === id);
    const product = {
      id,
      name,
      slug: slugify(value(formData, "slug", 120) || name),
      summary: value(formData, "summary", 600),
      description: value(formData, "description", 50000),
      categoryId: value(formData, "categoryId", 120),
      image: value(formData, "image", 500),
      status: status(formData),
      seoTitle: value(formData, "seoTitle", 240),
      seoDescription: value(formData, "seoDescription", 320),
      createdAt: existing?.createdAt || timestamp,
      updatedAt: timestamp,
    };
    if (existing) Object.assign(existing, product);
    else database.products.unshift(product);
  });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=1");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await updateDatabase((database) => { database.products = database.products.filter((product) => product.id !== id); });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = value(formData, "name", 160);
  if (!name) return;
  const type = value(formData, "type") === "product" ? "product" : "article";
  await updateDatabase((database) => {
    database.categories.push({ id: randomUUID(), name, slug: slugify(value(formData, "slug", 120) || name), type, createdAt: new Date().toISOString() });
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await updateDatabase((database) => {
    const inUse = database.articles.some((article) => article.categoryId === id) || database.products.some((product) => product.categoryId === id);
    if (!inUse) database.categories = database.categories.filter((category) => category.id !== id);
  });
  revalidatePath("/admin/categories");
}

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  await updateDatabase((database) => {
    database.settings = {
      siteTitle: value(formData, "siteTitle", 200),
      siteDescription: value(formData, "siteDescription", 320),
      companyName: value(formData, "companyName", 240),
      contactEmail: value(formData, "contactEmail", 200),
      contactPhone: value(formData, "contactPhone", 80),
      address: value(formData, "address", 1000),
    };
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}

export async function deleteMediaAction(id: string) {
  await requireAdmin();
  let mediaUrl = "";
  await updateDatabase((database) => {
    const media = database.media.find((item) => item.id === id);
    mediaUrl = media?.url || "";
    database.media = database.media.filter((item) => item.id !== id);
  });
  if (mediaUrl.startsWith("/uploads/")) {
    const uploadsDirectory = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(process.cwd(), "public", mediaUrl.slice(1));
    if (filePath.startsWith(`${uploadsDirectory}${path.sep}`)) {
      try {
        const stat = await lstat(filePath);
        if (stat.isFile() && !stat.isSymbolicLink()) await unlink(filePath);
      } catch {}
    }
  }
  revalidatePath("/admin/media");
}
