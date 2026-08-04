import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "dtx_admin_session";
const SESSION_SECONDS = 8 * 60 * 60;
type SessionPayload = { username: string; role: "admin"; expiresAt: number };

function encode(value: string) { return Buffer.from(value).toString("base64url"); }
function decode(value: string) { return Buffer.from(value, "base64url").toString("utf8"); }
function sessionSecret() { return process.env.CMS_SESSION_SECRET?.trim() || ""; }
function signature(payload: string) { return createHmac("sha256", sessionSecret()).update(payload).digest("base64url"); }

export function isAuthConfigured() {
  return Boolean(process.env.ADMIN_USERNAME?.trim() && process.env.ADMIN_PASSWORD_HASH?.trim() && sessionSecret().length >= 32);
}

export async function verifyCredentials(username: string, password: string) {
  if (!isAuthConfigured()) return false;
  const userMatches = username.trim() === process.env.ADMIN_USERNAME!.trim();
  const passwordMatches = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  return userMatches && passwordMatches;
}

export async function createAdminSession(username: string) {
  const payload: SessionPayload = { username, role: "admin", expiresAt: Date.now() + SESSION_SECONDS * 1000 };
  const encoded = encode(JSON.stringify(payload));
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${encoded}.${signature(encoded)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
}

export async function destroyAdminSession() { (await cookies()).delete(COOKIE_NAME); }

export async function getAdminSession(): Promise<SessionPayload | null> {
  if (!isAuthConfigured()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [encoded, suppliedSignature] = token.split(".");
  if (!encoded || !suppliedSignature) return null;
  const expectedSignature = signature(encoded);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    if (payload.role !== "admin" || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch { return null; }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
