import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/components/Providers";
import { LoadingScreen } from "@/components/LoadingScreen";
import { basePath, withBase } from "@/lib/base";
import { SITE_NAME } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ggovardhanreddy.github.io/festivals-rvp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | Digital Village Experience`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "RVP Youth — an interactive digital heritage museum for Sankranthi, Vinayaka Chavithi, birthdays, and village journeys.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Digital Village Experience`,
    description:
      "Celebrate village culture, festivals, and memories through a premium interactive archive.",
    images: [{ url: withBase("/brand/og-banner.jpg"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Digital Village Experience`,
    description:
      "Celebrate village culture, festivals, and memories through a premium interactive archive.",
    images: [withBase("/brand/og-banner.jpg")],
  },
  icons: {
    icon: [
      { url: withBase("/brand/icon-192.png"), sizes: "192x192", type: "image/png" },
      { url: withBase("/brand/rvp-youth-mark.svg") },
    ],
    apple: [{ url: withBase("/brand/apple-touch-icon.png") }],
  },
  manifest: withBase("/manifest.webmanifest"),
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: siteUrl,
  description:
    "Interactive digital heritage museum celebrating village festivals and memories.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const sw = withBase("/sw.js");
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${poppins.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Providers>
          <LoadingScreen />
          <div className="site-shell">
            <SiteHeader />
            <div id="main-content">{children}</div>
            <SiteFooter />
          </div>
        </Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${sw}',{scope:'${basePath || "/"}'}))`,
          }}
        />
      </body>
    </html>
  );
}
