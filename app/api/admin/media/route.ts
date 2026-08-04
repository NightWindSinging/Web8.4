import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/session";
import { updateDatabase } from "@/lib/cms/storage";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maximumSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  const alt = typeof formData.get("alt") === "string" ? String(formData.get("alt")).trim().slice(0, 240) : "";
  if (!(file instanceof File) || !allowedTypes.has(file.type) || file.size <= 0 || file.size > maximumSize) {
    return NextResponse.redirect(new URL("/admin/media?error=file", request.url), 303);
  }

  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>)[file.type];
  const stem = path.basename(file.name, path.extname(file.name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
  const fileName = `${Date.now()}-${stem}-${randomUUID().slice(0, 8)}.${extension}`;
  const uploadsDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.join(uploadsDirectory, fileName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  await updateDatabase((database) => {
    database.media.unshift({ id: randomUUID(), name: file.name.slice(0, 240), url: `/uploads/${fileName}`, mimeType: file.type, size: file.size, alt, createdAt: new Date().toISOString() });
  });
  return NextResponse.redirect(new URL("/admin/media?uploaded=1", request.url), 303);
}
