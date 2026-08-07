"use client";

import { useState } from "react";
import { sendFormSubmitInquiry } from "@/lib/formsubmit-client";

const initialValues = { name: "", email: "", phone: "", country: "", product: "", message: "", website: "" };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,25}$/;

export default function QuoteFormClient({ compact = false, dark = false }) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState({ type: "idle", message: "" });

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (status.type !== "idle") setStatus({ type: "idle", message: "" });
  }

  async function submit(event) {
    event.preventDefault();
    if (!values.name.trim() || !emailPattern.test(values.email.trim()) || !phonePattern.test(values.phone.trim())) {
      setStatus({ type: "error", message: "Please enter your name, a valid email and an international phone number." });
      return;
    }

    setStatus({ type: "loading", message: "Sending your inquiry…" });
    try {
      await sendFormSubmitInquiry(values, { subject: `[Website Contact] ${values.product || "Custom Packaging"} — ${values.name}` });
      setStatus({ type: "success", message: "Inquiry sent. We’ll reply within one business day." });
      setValues(initialValues);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Please try again or email us directly." });
    }
  }

  return (
    <form className={`quote-form ${compact ? "compact" : ""} ${dark ? "dark" : ""}`} onSubmit={submit} id="quote" noValidate>
      <div className="form-head"><span>Start your project</span><strong>Get a response within 24 hours</strong></div>
      <div className="form-grid">
        <label><span>Name *</span><input name="name" value={values.name} onChange={update} placeholder="Your name" autoComplete="name" required /></label>
        <label><span>Work email *</span><input name="email" type="email" value={values.email} onChange={update} placeholder="name@company.com" autoComplete="email" required /></label>
        <label><span>Phone / WhatsApp *</span><input name="phone" type="tel" value={values.phone} onChange={update} placeholder="+1 212 555 0198" autoComplete="tel" required /></label>
        <label><span>Country</span><input name="country" value={values.country} onChange={update} placeholder="Your market" autoComplete="country-name" /></label>
        <label><span>Packaging type</span><select name="product" value={values.product} onChange={update}><option value="">Select product</option><option>Rigid gift box</option><option>Folding carton</option><option>Display box</option><option>Paper bag</option></select></label>
      </div>
      {!compact && <label className="wide"><span>Project details</span><textarea name="message" value={values.message} onChange={update} placeholder="Size, quantity, material, printing and deadline..." /></label>}
      <label className="inquiry-honeypot" aria-hidden="true">Website<input name="website" value={values.website} onChange={update} tabIndex={-1} autoComplete="off" /></label>
      <button type="submit" disabled={status.type === "loading"}>{status.type === "loading" ? "Sending…" : "Request a Custom Quote"}<span>→</span></button>
      <small>By submitting, you agree to be contacted about your packaging request.</small>
      {status.message ? <div className={`inquiry-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</div> : null}
    </form>
  );
}
