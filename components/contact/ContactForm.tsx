"use client";

import { FormEvent, useState } from "react";
import { SITE_NAME, VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

const STORAGE_KEY = "rvp-contact-messages";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim() || name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!message.trim() || message.trim().length < 10) {
    errors.message = "Please write a short message (at least 10 characters).";
  }
  return errors;
}

function persistMessage(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    const next = Array.isArray(list) ? list : [];
    next.unshift({
      ...payload,
      id: `c-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      site: SITE_NAME,
      village: VILLAGE_ALSO_KNOWN_AS,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 40)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length) return;

    persistMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    setSent(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  if (sent) {
    return (
      <div className="contact-card contact-form-card" role="status">
        <h2>Thank you</h2>
        <p className="lede">
          Your message was recorded. The {SITE_NAME} team will follow up when
          possible.
        </p>
        <button
          type="button"
          className="btn ghost"
          style={{ marginTop: "0.5rem" }}
          onClick={() => setSent(false)}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="contact-card contact-form-card"
      onSubmit={onSubmit}
      noValidate
    >
      <h2>Send a message</h2>
      <p className="muted contact-form-hint">
        Questions about festivals, membership, or village developments — we read
        every note.
      </p>

      <label className="contact-field">
        <span>Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          required
        />
        {errors.name ? <em className="contact-field-error">{errors.name}</em> : null}
      </label>

      <label className="contact-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
          required
        />
        {errors.email ? (
          <em className="contact-field-error">{errors.email}</em>
        ) : null}
      </label>

      <label className="contact-field">
        <span>Phone (optional)</span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </label>

      <label className="contact-field">
        <span>Message</span>
        <textarea
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          required
        />
        {errors.message ? (
          <em className="contact-field-error">{errors.message}</em>
        ) : null}
      </label>

      <button type="submit" className="btn contact-submit">
        Submit
      </button>
    </form>
  );
}
