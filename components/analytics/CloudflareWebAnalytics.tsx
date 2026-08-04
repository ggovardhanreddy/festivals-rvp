"use client";

import Script from "next/script";

/**
 * Free Cloudflare Web Analytics beacon.
 * Set NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN from the CF dashboard
 * (Analytics & Logs → Web Analytics → Manage site → JS snippet token).
 */
const token = process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN?.trim();

export function CloudflareWebAnalytics() {
  if (!token) return null;
  return (
    <Script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
