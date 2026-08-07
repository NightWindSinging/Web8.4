const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/d250726a483bc7d236fa52601e012021";

export async function sendFormSubmitInquiry(values, options = {}) {
  if (values.website) return { success: true };

  const body = new URLSearchParams({
    _subject: options.subject || `[Website Inquiry] ${values.product || "Custom Packaging"} — ${values.company || values.name}`,
    _template: "table",
    _captcha: "false",
    _replyto: values.email,
    _honey: "",
    Name: values.name,
    Email: values.email,
    "Phone / WhatsApp": values.phone,
    Company: values.company || "—",
    "Country / region": values.country || "—",
    "Product requirement": values.product || "—",
    Message: values.message || "—",
    "Submitted from": typeof window === "undefined" ? "DATANGXING website" : window.location.href,
  });

  const response = await fetch(FORMSUBMIT_ENDPOINT, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const result = await response.json().catch(() => null);
  const succeeded = result?.success === true || result?.success === "true";
  if (!response.ok || !succeeded) throw new Error("We could not send your inquiry. Please try again or email us directly.");
  return result;
}
