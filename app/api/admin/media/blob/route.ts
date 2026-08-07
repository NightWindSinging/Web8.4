import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/cms/session";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { MEDIA_ALLOWED_TYPES, MEDIA_MAX_BYTES, mediaStorageMode } from "@/lib/media/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as HandleUploadBody | null;
  if (!body) return NextResponse.json({ error: "无效的上传请求" }, { status: 400 });

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await getAdminSession())) throw new Error("请先登录后台");
        if (!isDatabaseConfigured()) throw new Error("尚未配置 DATABASE_URL");
        if (mediaStorageMode() !== "BLOB") throw new Error("尚未配置 Vercel Blob");
        if (!pathname.startsWith("media/") || pathname.length > 1000 || pathname.includes("..")) throw new Error("无效的存储路径");
        return {
          allowedContentTypes: [...MEDIA_ALLOWED_TYPES],
          maximumSizeInBytes: MEDIA_MAX_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
        };
      },
      onUploadCompleted: async () => undefined,
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vercel Blob 上传失败" }, { status: 400 });
  }
}
