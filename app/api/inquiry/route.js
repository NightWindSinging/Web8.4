const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,25}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

const rateLimitStore = globalThis.__inquiryRateLimit || new Map();
globalThis.__inquiryRateLimit = rateLimitStore;

function text(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
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

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL || "lynn05052002@gmail.com";
  const fromEmail = process.env.INQUIRY_FROM_EMAIL || "DATANGXING Website <onboarding@resend.dev>";

  if (!apiKey) {
    return Response.json({ error: "Email delivery is not configured yet. Please email lynn05052002@gmail.com directly." }, { status: 503 });
  }

  const rows = [
    ["Name", inquiry.name], ["Email", inquiry.email], ["Phone / WhatsApp", inquiry.phone],
    ["Company", inquiry.company || "—"], ["Country / region", inquiry.country || "—"],
    ["Product requirement", inquiry.product || "—"], ["Message", inquiry.message || "—"],
  ];
  const htmlRows = rows.map(([label, value]) => `<tr><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#766b62;font-size:12px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:10px 14px;border-bottom:1px solid #eee;color:#201b17;font-size:13px;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`).join("");
  const plainText = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: inquiry.email,
      subject: `[Website Inquiry] ${inquiry.product || "Custom Packaging"} — ${inquiry.company || inquiry.name}`,
      text: plainText,
      html: `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif"><h1 style="font-size:24px;color:#201b17">New B2B packaging inquiry</h1><table style="width:100%;border-collapse:collapse;border:1px solid #eee">${htmlRows}</table><p style="margin-top:20px;color:#847a72;font-size:11px">Submitted from the DATANGXING Packaging website.</p></div>`,
    }),
  });

  if (!emailResponse.ok) {
    return Response.json({ error: "We could not send your inquiry. Please try again or email us directly." }, { status: 502 });
  }

  const result = await emailResponse.json();
  return Response.json({ ok: true, id: result.id });
}
