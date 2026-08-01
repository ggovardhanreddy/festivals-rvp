import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { basePath, withBase } from "@/lib/base";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ggovardhanreddy.github.io/festivals-rvp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Festivals RVP | RVP Memories", template: "%s | RVP Memories" },
  description:
    "A private family archive of festivals, journeys, and everyday moments.",
  openGraph: { type: "website", siteName: "RVP Memories" },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const sw = withBase("/sw.js");
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteHeader />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${sw}',{scope:'${basePath || "/"}'}))`,
          }}
        />
      </body>
    </html>
  );
}
