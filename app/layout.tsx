import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Providers } from "@/components/Providers";
import { LoadingScreen } from "@/components/LoadingScreen";
import { basePath, withBase } from "@/lib/base";
import {
  SITE_DESCRIPTOR,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TAGLINE_HERITAGE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_NAME,
} from "@/lib/site";

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
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_NAME} — ${SITE_TAGLINE} ${SITE_TAGLINE_HERITAGE} ${SITE_DESCRIPTOR} for ${VILLAGE_NAME}. Sankranthi, Vinayaka Chavithi, birthdays, and journeys. ${VILLAGE_ADDRESS_LINE}.`,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${VILLAGE_NAME}`,
    description: `${SITE_TAGLINE} ${SITE_TAGLINE_HERITAGE}`,
    images: [{ url: withBase("/logo/social-banner.png"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${VILLAGE_NAME}`,
    description: `${SITE_TAGLINE} ${SITE_TAGLINE_HERITAGE}`,
    images: [withBase("/logo/social-banner.png")],
  },
  icons: {
    icon: [
      { url: withBase("/logo/favicon.svg"), type: "image/svg+xml" },
      { url: withBase("/logo/favicon-32x32.png"), sizes: "32x32", type: "image/png" },
      { url: withBase("/logo/android-icon.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: withBase("/logo/apple-touch-icon.png"), sizes: "180x180" }],
  },
  manifest: withBase("/manifest.webmanifest"),
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: siteUrl,
  description: `${SITE_TAGLINE} ${SITE_DESCRIPTOR} for ${VILLAGE_NAME} — festivals, traditions, and memories.`,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var base=${JSON.stringify(basePath || "")}.replace(/\\/$/,"");var path=location.pathname.replace(/\\/$/,"")||"/";var home=base||"/";if(path===home)document.documentElement.classList.add("intro-pending");}catch(e){}})();`,
          }}
        />
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
