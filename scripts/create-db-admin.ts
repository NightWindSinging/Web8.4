import { randomBytes } from "node:crypto";
import { PrismaClient, UserRole } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function option(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1]?.trim() : undefined;
}

function validateUsername(username: string) {
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) {
    throw new Error("Username must be 3-80 characters and use only letters, numbers, dot, underscore or hyphen.");
  }
}

async function main() {
  const username = option("username") || "admin";
  const email = option("email") || null;
  const name = option("name") || null;
  const suppliedPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
  const generatedPassword = randomBytes(18).toString("base64url");
  const password = suppliedPassword || generatedPassword;

  validateUsername(username);
  if (password.length < 12) throw new Error("ADMIN_INITIAL_PASSWORD must contain at least 12 characters.");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { username },
    update: { email, name, passwordHash, role: UserRole.ADMIN, isActive: true },
    create: { username, email, name, passwordHash, role: UserRole.ADMIN },
    select: { id: true, username: true, email: true, role: true },
  });

  console.info("Administrator created or updated:");
  console.info(user);
  if (!suppliedPassword) {
    console.info("Generated one-time password (save it now; it will not be shown again):");
    console.info(generatedPassword);
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
