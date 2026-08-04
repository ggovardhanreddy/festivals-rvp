"use client";

import { FormEvent, useState } from "react";
import {
  SITE_CONTACT_EMAIL,
  SITE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
} from "@/lib/site";

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

function buildMailto(payload: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const subject = encodeURIComponent(
    `${SITE_NAME} contact — ${payload.name} (${VILLAGE_ALSO_KNOWN_AS})`,
  );
  const body = encodeURIComponent(
    [
      payload.message,
      "",
      "—",
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.phone ? `Phone: ${payload.phone}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const inboxReady = Boolean(SITE_CONTACT_EMAIL);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = validate(name, email, message);
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    };

    if (!inboxReady) {
      setErrors({
        message:
          "Online inbox is not configured yet. Please use the village address or Google Maps link beside this form.",
      });
      return;
    }

    window.location.href = buildMailto(payload);
    setSent(true);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  if (sent) {
    return (
      <div className="contact-card contact-form-card" role="status">
        <h2>Email app opened</h2>
        <p className="lede">
          Your message was prepared in your email app addressed to the{" "}
          {SITE_NAME} team. Send it from there to complete delivery.
        </p>
        <button
          type="button"
          className="btn ghost"
          style={{ marginTop: "0.5rem" }}
          onClick={() => setSent(false)}
        >
          Write another message
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
        {inboxReady
          ? "Questions about festivals, membership, or village developments — Submit opens your email app with the message ready to send."
          : "Questions about festivals, membership, or village developments — use the address and map beside this form until the contact inbox is configured."}
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

      <button type="submit" className="btn contact-submit" disabled={!inboxReady}>
        {inboxReady ? "Open email to send" : "Inbox not configured"}
      </button>
    </form>
  );
}
