import { useState } from "react";

export interface ContactValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpaConsent: boolean;
}

interface Props {
  submitting: boolean;
  onSubmit: (values: ContactValues) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Requires the +91 country code, e.g. +91 98765 43210, +919876543210, +91-98765-43210
const PHONE_RE = /^\+91[\s-]?\d{5}[\s-]?\d{5}$/;

export default function ContactStep({ submitting, onSubmit }: Props) {
  const [values, setValues] = useState<ContactValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcpaConsent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});

  function validate(): boolean {
    const next: Partial<Record<keyof ContactValues, string>> = {};
    if (!values.firstName.trim()) next.firstName = "Required";
    if (!values.lastName.trim()) next.lastName = "Required";
    if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email";
    if (!PHONE_RE.test(values.phone)) next.phone = "Enter a valid phone number";
    if (!values.tcpaConsent) next.tcpaConsent = "Consent is required to continue";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSubmit(values);
  }

  return (
    <form className="step" onSubmit={handleSubmit} noValidate>
      <p className="step-eyebrow">Last step</p>
      <h1 className="step-question">Where should we send your results?</h1>

      <div className="field-row">
        <div className="field">
          <label htmlFor="firstName">First name</label>
          <input
            id="firstName"
            value={values.firstName}
            onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
          />
          {errors.firstName && <span className="field-error">{errors.firstName}</span>}
        </div>
        <div className="field">
          <label htmlFor="lastName">Last name</label>
          <input
            id="lastName"
            value={values.lastName}
            onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
          />
          {errors.lastName && <span className="field-error">{errors.lastName}</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {errors.email && <span className="field-error">{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          placeholder="+91 98765 43210"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
        />
        {errors.phone && <span className="field-error">{errors.phone}</span>}
      </div>

      <label className="consent-row">
        <input
          type="checkbox"
          checked={values.tcpaConsent}
          onChange={(e) => setValues((v) => ({ ...v, tcpaConsent: e.target.checked }))}
        />
        <span>
          By checking this box, I agree to be contacted by phone, text, or email about my
          eligibility, including by automated means, and understand consent is not a condition
          of any service.
        </span>
      </label>
      {errors.tcpaConsent && <span className="field-error">{errors.tcpaConsent}</span>}

      <button className="primary-btn" type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Get my results"}
      </button>
    </form>
  );
}
