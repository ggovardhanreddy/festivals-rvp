"use client";

import Script from "next/script";

const envDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const domain =
  envDomain === ""
    ? null
    : envDomain?.trim() || "www.reddivaripalli.com";

/** Plausible analytics — set NEXT_PUBLIC_PLAUSIBLE_DOMAIN="" to disable. */
export function PlausibleScript() {
  if (!domain) return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
