"use client";

import { DEVAPATLAMMA_INSTAGRAM } from "@/lib/festivals";

function InstagramGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function InstagramFollow({
  className = "",
}: {
  className?: string;
}) {
  const url = DEVAPATLAMMA_INSTAGRAM.url;
  if (!url || !/^https:\/\/(www\.)?instagram\.com\//i.test(url)) {
    return null;
  }

  return (
    <div className={`instagram-follow ${className}`.trim()}>
      <a
        className="btn instagram-follow-btn"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${DEVAPATLAMMA_INSTAGRAM.label} — Devapatlamma Temple`}
      >
        <InstagramGlyph />
        <span>{DEVAPATLAMMA_INSTAGRAM.label}</span>
      </a>
      <p className="muted instagram-follow-handle">
        Devapatlamma Temple · {DEVAPATLAMMA_INSTAGRAM.handle}
      </p>
    </div>
  );
}
