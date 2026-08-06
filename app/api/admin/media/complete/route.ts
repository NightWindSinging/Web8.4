import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { deleteStoredMedia, getR2PublicUrl, validateMediaMetadata, verifyR2Upload } from "@/lib/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "请先登录后台" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "尚未配置 DATABASE_URL" }, { status: 503 });
  const input = await request.json().catch(() => null) as { storageKey?: string; name?: string; type?: string; size?: number; alt?: string; width?: number; height?: number } | null;
  const metadata = { name: String(input?.name || ""), type: String(input?.type || ""), size: Number(input?.size || 0) };
  const error = validateMediaMetadata(metadata);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const storageKey = String(input?.storageKey || "");
  if (!storageKey.startsWith("media/") || storageKey.length > 1000 || storageKey.includes("..")) return NextResponse.json({ error: "无效的存储路径" }, { status: 400 });
  await verifyR2Upload(storageKey, metadata.type, metadata.size);
  let media;
  try {
    media = await prisma.media.create({
      data: {
        name: metadata.name.slice(0, 255),
        url: getR2PublicUrl(storageKey),
        storageKey,
        storageProvider: "R2",
        mimeType: metadata.type,
        size: metadata.size,
        width: Number.isInteger(input?.width) && Number(input?.width) > 0 ? Number(input?.width) : null,
        height: Number.isInteger(input?.height) && Number(input?.height) > 0 ? Number(input?.height) : null,
        alt: String(input?.alt || "").trim().slice(0, 300) || null,
      },
      select: { id: true, name: true, url: true, storageKey: true, storageProvider: true, mimeType: true, size: true, width: true, height: true, alt: true },
    });
  } catch (databaseError) {
    await deleteStoredMedia("R2", storageKey).catch(() => undefined);
    throw databaseError;
  }
  return NextResponse.json(media, { status: 201 });
}
