import "server-only";

import { randomUUID } from "node:crypto";
import { lstat, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { MediaStorageProvider } from "@/lib/generated/prisma";

export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
export const MEDIA_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type R2Config = {
  bucket: string;
  endpoint: string;
  publicBaseUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function r2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null;
  return { bucket, publicBaseUrl, accessKeyId, secretAccessKey, endpoint: `https://${accountId}.r2.cloudflarestorage.com` };
}

function r2Client(config: R2Config) {
  return new S3Client({ region: "auto", endpoint: config.endpoint, credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey } });
}

export function mediaStorageMode(): MediaStorageProvider | null {
  if (r2Config()) return "R2";
  if (process.env.NODE_ENV !== "production" || process.env.MEDIA_LOCAL_STORAGE === "true") return "LOCAL";
  return null;
}

export function validateMediaMetadata(input: { name: string; type: string; size: number }) {
  if (!MEDIA_ALLOWED_TYPES.has(input.type)) return "仅支持 JPG、JPEG、PNG 和 WebP 图片";
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MEDIA_MAX_BYTES) return "图片大小必须在 10MB 以内";
  if (!input.name.trim()) return "文件名不能为空";
  return null;
}

export function createMediaStorageKey(name: string, type: string) {
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>)[type];
  const stem = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
  const now = new Date();
  return `media/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${stem}.${extension}`;
}

export async function createR2Upload(key: string, type: string) {
  const config = r2Config();
  if (!config) throw new Error("R2 is not configured.");
  const uploadUrl = await getSignedUrl(r2Client(config), new PutObjectCommand({ Bucket: config.bucket, Key: key, ContentType: type }), { expiresIn: 10 * 60 });
  return { uploadUrl, publicUrl: `${config.publicBaseUrl}/${key}` };
}

export function getR2PublicUrl(key: string) {
  const config = r2Config();
  if (!config) throw new Error("R2 is not configured.");
  return `${config.publicBaseUrl}/${key}`;
}

export async function verifyR2Upload(key: string, expectedType: string, expectedSize: number) {
  const config = r2Config();
  if (!config) throw new Error("R2 is not configured.");
  const object = await r2Client(config).send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
  if (object.ContentLength !== expectedSize || object.ContentType !== expectedType) throw new Error("R2 object metadata does not match the requested upload.");
}

function safeLocalPath(key: string) {
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
  const filePath = path.resolve(uploadsRoot, key);
  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("Invalid local media path.");
  return { uploadsRoot, filePath };
}

export async function writeLocalMedia(key: string, bytes: Buffer) {
  const { filePath } = safeLocalPath(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" });
  return `/uploads/${key}`;
}

export async function deleteStoredMedia(provider: MediaStorageProvider, key: string | null) {
  if (!key) return;
  if (provider === "R2") {
    const config = r2Config();
    if (!config) throw new Error("R2 credentials are required to delete this object.");
    await r2Client(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    return;
  }
  const { filePath } = safeLocalPath(key);
  try {
    const stat = await lstat(filePath);
    if (stat.isFile() && !stat.isSymbolicLink()) await unlink(filePath);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") throw error;
  }
}
