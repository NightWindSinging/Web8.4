import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const segments = (await params).path;
  if (!segments.length || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, ...segments);
  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return new NextResponse("Not found", { status: 404 });
  const contentType = contentTypes[path.extname(filePath).toLowerCase()];
  if (!contentType) return new NextResponse("Not found", { status: 404 });
  try {
    const stat = await lstat(filePath);
    if (!stat.isFile() || stat.isSymbolicLink()) return new NextResponse("Not found", { status: 404 });
    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": stat.mtime.toUTCString(),
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
