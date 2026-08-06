import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required for the article CRUD integration test.");
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const categorySlug = `crud-test-category-${nonce}`;
  const articleSlug = `crud-test-article-${nonce}`;
  let categoryId = "";
  let articleId = "";

  try {
    const category = await prisma.category.create({
      data: { name: "CRUD Test Category", slug: categorySlug, type: "ARTICLE" },
    });
    categoryId = category.id;

    const created = await prisma.article.create({
      data: {
        title: "CRUD Test Article",
        slug: articleSlug,
        content: "<h2>Created</h2><p>Article creation test.</p>",
        keywords: ["crud", "article"],
        status: "DRAFT",
        categoryId,
      },
    });
    articleId = created.id;
    const createVerified = await prisma.article.findUnique({ where: { id: articleId } });
    if (!createVerified || createVerified.title !== "CRUD Test Article") throw new Error("CREATE verification failed.");
    console.info("✓ CREATE article");

    await prisma.article.update({
      where: { id: articleId },
      data: { title: "CRUD Test Article Updated", status: "PUBLISHED", publishedAt: new Date() },
    });
    const updateVerified = await prisma.article.findUnique({ where: { id: articleId } });
    if (!updateVerified || updateVerified.title !== "CRUD Test Article Updated" || updateVerified.status !== "PUBLISHED") {
      throw new Error("UPDATE verification failed.");
    }
    console.info("✓ UPDATE article");

    await prisma.article.delete({ where: { id: articleId } });
    articleId = "";
    const deleteVerified = await prisma.article.findUnique({ where: { id: created.id } });
    if (deleteVerified) throw new Error("DELETE verification failed.");
    console.info("✓ DELETE article");
    console.info("Article CRUD integration test passed.");
  } finally {
    if (articleId) await prisma.article.delete({ where: { id: articleId } }).catch(() => undefined);
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } }).catch(() => undefined);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
