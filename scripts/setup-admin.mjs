import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";

const envPath = path.join(process.cwd(), ".env.local");
const usernameArg = process.argv.find((value) => value.startsWith("--username="));
const username = usernameArg?.split("=").slice(1).join("=").trim() || "admin";
const password = randomBytes(15).toString("base64url");
const passwordHash = (await bcrypt.hash(password, 12)).replaceAll("$", "\\$");
const sessionSecret = randomBytes(48).toString("base64url");
let source = "";
try { source = await readFile(envPath, "utf8"); } catch {}

for (const [key, value] of Object.entries({ ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: passwordHash, CMS_SESSION_SECRET: sessionSecret })) {
  const line = `${key}=${value}`;
  const expression = new RegExp(`^${key}=.*$`, "m");
  source = expression.test(source) ? source.replace(expression, line) : `${source.trimEnd()}${source.trim() ? "\n" : ""}${line}\n`;
}

await writeFile(envPath, source, { encoding: "utf8", mode: 0o600 });
console.log("Admin login created. Save this one-time password now:");
console.log(`Username: ${username}`);
console.log(`Password: ${password}`);
console.log("Restart Next.js, then open /admin/login.");
