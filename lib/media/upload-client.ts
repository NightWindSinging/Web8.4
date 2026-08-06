export const MEDIA_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp";

export type UploadedMedia = {
  id: string;
  name: string;
  url: string;
  storageKey: string;
  storageProvider: "R2" | "LOCAL";
  mimeType: string;
  size: number | null;
  width: number | null;
  height: number | null;
  alt: string | null;
};

function validate(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("仅支持 JPG、JPEG、PNG 和 WebP 图片");
  if (file.size <= 0 || file.size > MEDIA_UPLOAD_MAX_BYTES) throw new Error("单张图片不能超过 10MB");
}

async function dimensions(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const result = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return result;
  } catch {
    return { width: 0, height: 0 };
  }
}

async function jsonResponse(response: Response) {
  const result = await response.json().catch(() => ({ error: "上传服务返回了无效响应" }));
  if (!response.ok) throw new Error(result.error || "图片上传失败");
  return result;
}

export async function uploadMediaFile(file: File, alt = ""): Promise<UploadedMedia> {
  validate(file);
  const imageSize = await dimensions(file);
  const initiation = await jsonResponse(await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
  })) as { mode: "R2" | "LOCAL"; storageKey: string; uploadUrl: string };

  if (initiation.mode === "R2") {
    const uploadResponse = await fetch(initiation.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!uploadResponse.ok) throw new Error("Cloudflare R2 上传失败，请检查 Bucket CORS 配置");
    return jsonResponse(await fetch("/api/admin/media/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storageKey: initiation.storageKey, name: file.name, type: file.type, size: file.size, alt, ...imageSize }),
    })) as Promise<UploadedMedia>;
  }

  const formData = new FormData();
  formData.set("file", file);
  formData.set("storageKey", initiation.storageKey);
  formData.set("alt", alt);
  formData.set("width", String(imageSize.width));
  formData.set("height", String(imageSize.height));
  return jsonResponse(await fetch(initiation.uploadUrl, { method: "POST", body: formData })) as Promise<UploadedMedia>;
}
