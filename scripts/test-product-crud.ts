import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL?.trim()) throw new Error("DATABASE_URL is required for the product CRUD integration test.");
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let categoryId = "";
  let productId = "";
  const mediaIds: string[] = [];
  try {
    const category = await prisma.category.create({ data: { name: "Product CRUD Test", slug: `product-crud-${nonce}`, type: "PRODUCT" } });
    categoryId = category.id;
    const media = await Promise.all([1, 2, 3].map((index) => prisma.media.create({
      data: { name: `test-${index}.jpg`, url: `https://example.com/product-crud-${nonce}-${index}.jpg`, storageKey: `tests/${nonce}-${index}.jpg`, mimeType: "image/jpeg", size: 1024 },
    })));
    mediaIds.push(...media.map((item) => item.id));

    const created = await prisma.product.create({
      data: {
        name: "Product CRUD Test",
        slug: `product-crud-test-${nonce}`,
        category: { connect: { id: categoryId } },
        mainImage: media[0].url,
        mainImageMedia: { connect: { id: media[0].id } },
        gallery: media.map((item) => item.url),
        galleryMedia: { connect: media.map((item) => ({ id: item.id })) },
        description: "<h2>Test product</h2><p>Create verification.</p>",
        specifications: [{ name: "Material", value: "Paperboard" }],
        keywords: ["product", "crud"],
        status: "DRAFT",
      },
      include: { galleryMedia: true },
    });
    productId = created.id;
    if (created.galleryMedia.length !== 3 || created.mainImage !== media[0].url) throw new Error("CREATE or multi-image verification failed.");
    console.info("✓ CREATE product with multiple images");

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: "Product CRUD Test Updated",
        status: "PUBLISHED",
        mainImage: media[1].url,
        mainImageMedia: { connect: { id: media[1].id } },
        gallery: media.slice(1).map((item) => item.url),
        galleryMedia: { set: media.slice(1).map((item) => ({ id: item.id })) },
        specifications: [{ name: "Material", value: "Rigid board" }, { name: "MOQ", value: "500 pcs" }],
      },
    });
    const updated = await prisma.product.findUnique({ where: { id: productId }, include: { galleryMedia: true } });
    if (!updated || updated.name !== "Product CRUD Test Updated" || updated.galleryMedia.length !== 2 || updated.mainImageId !== media[1].id) throw new Error("UPDATE verification failed.");
    console.info("✓ UPDATE product, parameters and gallery");

    await prisma.product.delete({ where: { id: productId } });
    productId = "";
    if (await prisma.product.findUnique({ where: { id: created.id } })) throw new Error("DELETE verification failed.");
    console.info("✓ DELETE product");
    console.info("Product CRUD integration test passed.");
  } finally {
    if (productId) await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
    if (mediaIds.length) await prisma.media.deleteMany({ where: { id: { in: mediaIds } } }).catch(() => undefined);
    if (categoryId) await prisma.category.delete({ where: { id: categoryId } }).catch(() => undefined);
  }
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
