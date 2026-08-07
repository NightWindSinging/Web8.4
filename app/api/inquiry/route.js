const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,25}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

const rateLimitStore = globalThis.__inquiryRateLimit || new Map();
globalThis.__inquiryRateLimit = rateLimitStore;

function text(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function checkRateLimit(request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const key = forwarded || request.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (rateLimitStore.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return false;
  recent.push(now);
  rateLimitStore.set(key, recent);
  return true;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  if (text(body.website, 200)) return Response.json({ ok: true });
  if (!checkRateLimit(request)) return Response.json({ error: "Too many requests. Please wait a few minutes and try again." }, { status: 429 });

  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1500) {
    return Response.json({ error: "Please review the form and try again." }, { status: 400 });
  }

  const inquiry = {
    name: text(body.name, 120),
    email: text(body.email, 200),
    phone: text(body.phone, 40),
    company: text(body.company, 200),
    country: text(body.country, 120),
    product: text(body.product, 160),
    message: text(body.message, 3000),
  };

  if (!inquiry.name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_PATTERN.test(inquiry.email)) return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!PHONE_PATTERN.test(inquiry.phone)) return Response.json({ error: "Please enter a valid international phone number." }, { status: 400 });

  const toEmail = process.env.INQUIRY_TO_EMAIL || "lynn05052002@gmail.com";
  const formData = new URLSearchParams({
    _subject: `[Website Inquiry] ${inquiry.product || "Custom Packaging"} — ${inquiry.company || inquiry.name}`,
    _template: "table",
    _captcha: "false",
    _replyto: inquiry.email,
    Name: inquiry.name,
    Email: inquiry.email,
    "Phone / WhatsApp": inquiry.phone,
    Company: inquiry.company || "—",
    "Country / region": inquiry.country || "—",
    "Product requirement": inquiry.product || "—",
    Message: inquiry.message || "—",
    "Submitted from": request.headers.get("referer") || "DATANGXING website",
  });

  const emailResponse = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(toEmail)}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
    cache: "no-store",
  });

  const result = await emailResponse.json().catch(() => null);
  if (!emailResponse.ok) {
    return Response.json({ error: "We could not send your inquiry. Please try again or email us directly." }, { status: 502 });
  }

  return Response.json({ ok: true, message: result?.message || "Inquiry accepted." });
}
