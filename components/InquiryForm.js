"use client";

import { useState } from "react";
import { sendFormSubmitInquiry } from "@/lib/formsubmit-client";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "",
  product: "",
  message: "",
  website: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[0-9\s().-]{7,25}$/;

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your work email.";
  else if (!emailPattern.test(values.email.trim())) errors.email = "Enter a valid email, for example name@company.com.";
  if (!values.phone.trim()) errors.phone = "Please enter your phone or WhatsApp number.";
  else if (!phonePattern.test(values.phone.trim())) errors.phone = "Use 7–25 digits and include the country code, for example +1 212 555 0198.";
  return errors;
}

function FieldError({ id, message }) {
  return message ? <span className="field-error" id={id} role="alert">{message}</span> : null;
}

export default function InquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", message: "" });

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
    if (status.type !== "idle") setStatus({ type: "idle", message: "" });
  }

  function validateField(event) {
    const field = event.target.name;
    if (!["name", "email", "phone"].includes(field)) return;
    const nextErrors = validate(values);
    setErrors((current) => ({ ...current, [field]: nextErrors[field] }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      setStatus({ type: "error", message: "Please complete the highlighted required fields." });
      const firstInvalid = ["name", "email", "phone"].find((field) => nextErrors[field]);
      event.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    setStatus({ type: "loading", message: "Sending your inquiry…" });
    try {
      await sendFormSubmitInquiry(values);

      setStatus({ type: "success", message: "Inquiry submitted successfully. Our team will reply within one business day." });
      setValues(initialValues);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Submission failed. Please try again or email us directly." });
    }
  }

  const busy = status.type === "loading";

  return (
    <form className="inquiry-form" id="inquiry-form" onSubmit={submit} noValidate>
      <div className="inquiry-form-head">
        <div><span>PROJECT INQUIRY</span><h2>Tell us what you need.</h2></div>
        <p><b>*</b> Required fields</p>
      </div>

      <div className="inquiry-fields">
        <label className={errors.name ? "has-error" : ""}>
          <span>Full name <b>*</b></span>
          <input name="name" value={values.name} onChange={update} onBlur={validateField} placeholder="Your full name" autoComplete="name" required aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
          <FieldError id="name-error" message={errors.name} />
        </label>

        <label className={errors.email ? "has-error" : ""}>
          <span>Work email <b>*</b></span>
          <input name="email" type="email" value={values.email} onChange={update} onBlur={validateField} placeholder="name@company.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          <FieldError id="email-error" message={errors.email} />
        </label>

        <label className={errors.phone ? "has-error" : ""}>
          <span>Phone / WhatsApp <b>*</b></span>
          <input name="phone" type="tel" inputMode="tel" value={values.phone} onChange={update} onBlur={validateField} placeholder="+1 212 555 0198" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "phone-error" : "phone-help"} />
          <small className="field-help" id="phone-help">Include your international country code.</small>
          <FieldError id="phone-error" message={errors.phone} />
        </label>

        <label>
          <span>Company name <em>Optional</em></span>
          <input name="company" value={values.company} onChange={update} placeholder="Your company or brand" autoComplete="organization" />
        </label>

        <label>
          <span>Country / region <em>Optional</em></span>
          <input name="country" value={values.country} onChange={update} placeholder="United States" autoComplete="country-name" />
        </label>

        <label>
          <span>Product requirement <em>Optional</em></span>
          <select name="product" value={values.product} onChange={update}>
            <option value="">Select packaging type</option>
            <option>Rigid gift boxes</option>
            <option>Folding cartons</option>
            <option>Display packaging</option>
            <option>Paper bags</option>
            <option>Food & beverage packaging</option>
            <option>Other custom packaging</option>
          </select>
        </label>

        <label className="inquiry-message">
          <span>Project details <em>Optional</em></span>
          <textarea name="message" value={values.message} onChange={update} placeholder="Tell us the size, quantity, material, printing, finishing and required delivery date…" maxLength={3000} />
          <small className="character-count">{values.message.length} / 3000</small>
        </label>

        <label className="inquiry-honeypot" aria-hidden="true">
          Website<input name="website" value={values.website} onChange={update} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="inquiry-submit-row">
        <button type="submit" disabled={busy}>
          {busy ? "Sending…" : status.type === "success" ? "Inquiry Sent ✓" : "Submit Inquiry"}
          {!busy && status.type !== "success" ? <span>→</span> : null}
        </button>
        <p>By submitting, you agree that DATANGXING may contact you about this packaging request.</p>
      </div>

      {status.message ? <div className={`inquiry-status ${status.type}`} role={status.type === "error" ? "alert" : "status"} aria-live="polite">{status.message}</div> : null}
    </form>
  );
}
