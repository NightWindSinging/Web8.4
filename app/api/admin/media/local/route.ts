import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/session";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { deleteStoredMedia, mediaStorageMode, validateMediaMetadata, writeLocalMedia } from "@/lib/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "请先登录后台" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "尚未配置 DATABASE_URL" }, { status: 503 });
  if (mediaStorageMode() !== "LOCAL") return NextResponse.json({ error: "本地存储当前未启用" }, { status: 403 });
  const formData = await request.formData();
  const file = formData.get("file");
  const storageKey = String(formData.get("storageKey") || "");
  if (!(file instanceof File)) return NextResponse.json({ error: "请选择图片" }, { status: 400 });
  const error = validateMediaMetadata({ name: file.name, type: file.type, size: file.size });
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!storageKey.startsWith("media/") || storageKey.length > 1000 || storageKey.includes("..")) return NextResponse.json({ error: "无效的存储路径" }, { status: 400 });
  const url = await writeLocalMedia(storageKey, Buffer.from(await file.arrayBuffer()));
  const width = Number(formData.get("width") || 0);
  const height = Number(formData.get("height") || 0);
  let media;
  try {
    media = await prisma.media.create({
      data: {
        name: file.name.slice(0, 255), url, storageKey, storageProvider: "LOCAL", mimeType: file.type, size: file.size,
        width: Number.isInteger(width) && width > 0 ? width : null,
        height: Number.isInteger(height) && height > 0 ? height : null,
        alt: String(formData.get("alt") || "").trim().slice(0, 300) || null,
      },
      select: { id: true, name: true, url: true, storageKey: true, storageProvider: true, mimeType: true, size: true, width: true, height: true, alt: true },
    });
  } catch (databaseError) {
    await deleteStoredMedia("LOCAL", storageKey).catch(() => undefined);
    throw databaseError;
  }
  return NextResponse.json(media, { status: 201 });
}
