import { Prisma, PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function expectRestrictedDelete(categoryId: string, label: string) {
  let restricted = false;
  try {
    await prisma.category.delete({ where: { id: categoryId } });
  } catch (error) {
    restricted = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
  }
  if (!restricted) throw new Error(`${label} category deletion was not blocked by a foreign key.`);
  console.info(`✓ RESTRICT ${label} category with associated content`);
}

async function main() {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required for the category CRUD integration test.");
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let articleCategoryId = "";
  let productCategoryId = "";
  let emptyCategoryId = "";
  let articleId = "";
  let productId = "";
  try {
    const articleCategory = await prisma.category.create({ data: { name: "Article Category Test", slug: `article-category-${nonce}`, type: "ARTICLE", description: "Created" } });
    articleCategoryId = articleCategory.id;
    const updated = await prisma.category.update({ where: { id: articleCategoryId }, data: { name: "Article Category Updated", description: "Updated" } });
    if (updated.name !== "Article Category Updated" || updated.description !== "Updated") throw new Error("Category UPDATE verification failed.");
    console.info("✓ CREATE and UPDATE category");

    const productCategory = await prisma.category.create({ data: { name: "Product Category Test", slug: `product-category-${nonce}`, type: "PRODUCT" } });
    productCategoryId = productCategory.id;
    const article = await prisma.article.create({ data: { title: "Category relation test", slug: `category-article-${nonce}`, content: "<p>Test</p>", categoryId: articleCategoryId } });
    articleId = article.id;
    const product = await prisma.product.create({ data: { name: "Category relation test", slug: `category-product-${nonce}`, categoryId: productCategoryId } });
    productId = product.id;

    await expectRestrictedDelete(articleCategoryId, "article");
    await expectRestrictedDelete(productCategoryId, "product");

    const emptyCategory = await prisma.category.create({ data: { name: "Empty Category Test", slug: `empty-category-${nonce}`, type: "ARTICLE" } });
    emptyCategoryId = emptyCategory.id;
    await prisma.category.delete({ where: { id: emptyCategoryId } });
    emptyCategoryId = "";
    if (await prisma.category.findUnique({ where: { id: emptyCategory.id } })) throw new Error("Empty category DELETE verification failed.");
    console.info("✓ DELETE category without associated content");

    await prisma.article.delete({ where: { id: articleId } });
    articleId = "";
    await prisma.product.delete({ where: { id: productId } });
    productId = "";
    await prisma.category.deleteMany({ where: { id: { in: [articleCategoryId, productCategoryId] } } });
    articleCategoryId = "";
    productCategoryId = "";
    console.info("Category CRUD and orphan protection test passed.");
  } finally {
    if (articleId) await prisma.article.delete({ where: { id: articleId } }).catch(() => undefined);
    if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
    const categoryIds = [articleCategoryId, productCategoryId, emptyCategoryId].filter(Boolean);
    if (categoryIds.length) await prisma.category.deleteMany({ where: { id: { in: categoryIds } } }).catch(() => undefined);
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
