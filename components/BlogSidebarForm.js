"use client";

import { useRef, useState } from "react";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,25}$/;

export default function BlogSidebarForm() {
  const [values, setValues] = useState({ name: "", email: "", phone: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const startedAt = useRef(Date.now());

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = "Enter your name.";
    if (!emailPattern.test(values.email.trim())) nextErrors.email = "Enter a valid email.";
    if (!phonePattern.test(values.phone.trim())) nextErrors.phone = "Include a valid country code.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: "Please complete the required fields." });
      event.currentTarget.elements[Object.keys(nextErrors)[0]]?.focus();
      return;
    }

    setStatus({ type: "loading", message: "Sending…" });
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, product: "Blog consultation", message: "Inquiry submitted from the blog article sidebar.", startedAt: startedAt.current }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed.");
      setStatus({ type: "success", message: "Thank you. We’ll reply within one business day." });
      setValues({ name: "", email: "", phone: "", website: "" });
      startedAt.current = Date.now();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Please try again or email us directly." });
    }
  }

  return (
    <form className="blog-lead-form" onSubmit={submit} noValidate>
      <span>DISCUSS YOUR PROJECT</span>
      <h3>Need packaging advice?</h3>
      <p>Share your contact details and our team will follow up.</p>
      <label><span>Name *</span><input name="name" value={values.name} onChange={update} placeholder="Your name" autoComplete="name" aria-invalid={Boolean(errors.name)} />{errors.name ? <small>{errors.name}</small> : null}</label>
      <label><span>Work email *</span><input name="email" type="email" value={values.email} onChange={update} placeholder="name@company.com" autoComplete="email" aria-invalid={Boolean(errors.email)} />{errors.email ? <small>{errors.email}</small> : null}</label>
      <label><span>Phone / WhatsApp *</span><input name="phone" type="tel" value={values.phone} onChange={update} placeholder="+1 212 555 0198" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />{errors.phone ? <small>{errors.phone}</small> : null}</label>
      <label className="blog-form-honeypot" aria-hidden="true">Website<input name="website" value={values.website} onChange={update} tabIndex={-1} autoComplete="off" /></label>
      <button type="submit" disabled={status.type === "loading"}>{status.type === "loading" ? "Sending…" : "Request Advice"}<b>→</b></button>
      {status.message ? <div className={`blog-form-status ${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</div> : null}
    </form>
  );
}
