import { PrismaClient, CategoryType, UserRole } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = [
    {
      name: "Packaging Guide",
      slug: "packaging-guide",
      type: CategoryType.ARTICLE,
      description: "Buyer guides, material knowledge and custom packaging insights.",
    },
    {
      name: "Premium Packaging",
      slug: "premium-packaging",
      type: CategoryType.PRODUCT,
      description: "Premium rigid boxes and custom presentation packaging.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug_type: { slug: category.slug, type: category.type } },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }
}

async function seedOptionalAdmin() {
  const password = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (!password) {
    console.info("No SEED_ADMIN_PASSWORD provided; administrator creation skipped.");
    console.info("Run `pnpm db:admin` to create an administrator securely.");
    return;
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must contain at least 12 characters.");
  }

  const username = process.env.SEED_ADMIN_USERNAME?.trim() || "admin";
  const email = process.env.SEED_ADMIN_EMAIL?.trim() || null;
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { username },
    update: { email, passwordHash, role: UserRole.ADMIN, isActive: true },
    create: { username, email, passwordHash, role: UserRole.ADMIN },
  });
  console.info(`Administrator '${username}' is ready.`);
}

async function main() {
  await seedCategories();
  await seedOptionalAdmin();
  console.info("Database seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
