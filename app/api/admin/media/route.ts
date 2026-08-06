import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { createMediaStorageKey, createR2Upload, mediaStorageMode, validateMediaMetadata } from "@/lib/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "请先登录后台" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "尚未配置 DATABASE_URL" }, { status: 503 });
  const input = await request.json().catch(() => null) as { name?: string; type?: string; size?: number } | null;
  const metadata = { name: String(input?.name || ""), type: String(input?.type || ""), size: Number(input?.size || 0) };
  const error = validateMediaMetadata(metadata);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const mode = mediaStorageMode();
  if (!mode) return NextResponse.json({ error: "生产环境尚未配置 Cloudflare R2，且本地存储未启用" }, { status: 503 });
  const storageKey = createMediaStorageKey(metadata.name, metadata.type);
  if (mode === "R2") {
    const signed = await createR2Upload(storageKey, metadata.type);
    return NextResponse.json({ mode, storageKey, ...signed });
  }
  return NextResponse.json({ mode, storageKey, uploadUrl: "/api/admin/media/local" });
}
