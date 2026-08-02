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
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
  VILLAGE_COORDS,
} from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.reddivaripalli.com";

const seoTitle = `${VILLAGE_ALSO_KNOWN_AS} (${VILLAGE_NAME}) | ${SITE_NAME}`;
const seoDescription = `${VILLAGE_ALSO_KNOWN_AS} — also known as ${VILLAGE_NAME}, Annamayya District, Andhra Pradesh. Official ${SITE_NAME} digital village archive: festivals, gallery, members, and events. ${SITE_TAGLINE} ${VILLAGE_ADDRESS_LINE}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: `%s | ${VILLAGE_ALSO_KNOWN_AS} · ${SITE_NAME}`,
  },
  description: seoDescription,
  keywords: [
    "Reddivaripalli",
    "Kondreddigaripalli",
    "RVP Youth",
    "Annamayya",
    "Andhra Pradesh",
    "Sankranthi",
    "Vinayaka Chavithi",
    "Mathamma Jathara",
    "Devapatlamma Jathara",
    "Sri Rama Navami",
    "village festivals",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: `${SITE_NAME} · ${VILLAGE_ALSO_KNOWN_AS}`,
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: withBase("/logo/social-banner.png"),
        width: 1200,
        height: 630,
        alt: `${VILLAGE_ALSO_KNOWN_AS} — ${SITE_NAME}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description: seoDescription,
    images: [withBase("/logo/social-banner.png")],
  },
  icons: {
    icon: [
      { url: withBase("/logo/favicon.svg"), type: "image/svg+xml" },
      { url: withBase("/logo/favicon-32x32.png"), sizes: "32x32", type: "image/png" },
      { url: withBase("/logo/favicon-16x16.png"), sizes: "16x16", type: "image/png" },
      { url: withBase("/logo/android-icon.png"), sizes: "192x192", type: "image/png" },
      { url: withBase("/logo/app-icon.png"), sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: withBase("/logo/apple-touch-icon.png"), sizes: "180x180" }],
    shortcut: [withBase("/logo/favicon.ico")],
  },
  manifest: withBase("/manifest.webmanifest"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: `${SITE_NAME}`,
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#fafaf8",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  category: "community",
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE_NAME} — ${VILLAGE_ALSO_KNOWN_AS}`,
    alternateName: [
      VILLAGE_ALSO_KNOWN_AS,
      VILLAGE_NAME,
      "Reddivaripalli",
      "Kondreddigaripalli",
      SITE_NAME,
    ],
    url: siteUrl,
    description: seoDescription,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}${withBase("/logo/logo-master.png")}`,
    description: `${SITE_DESCRIPTOR} for ${VILLAGE_NAME} (${VILLAGE_ALSO_KNOWN_AS}).`,
    address: {
      "@type": "PostalAddress",
      addressLocality: VILLAGE_NAME,
      addressRegion: "Andhra Pradesh",
      postalCode: "516215",
      addressCountry: "IN",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${VILLAGE_NAME} (${VILLAGE_ALSO_KNOWN_AS})`,
    alternateName: [VILLAGE_ALSO_KNOWN_AS, "Reddivaripalli"],
    description: `Village of ${VILLAGE_NAME}, also known as ${VILLAGE_ALSO_KNOWN_AS}, in Annamayya District, Andhra Pradesh, India.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: VILLAGE_ADDRESS_LINE,
      addressLocality: VILLAGE_NAME,
      addressRegion: "Andhra Pradesh",
      postalCode: "516215",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: VILLAGE_COORDS.lat,
      longitude: VILLAGE_COORDS.lng,
    },
    url: siteUrl,
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${poppins.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("rvp-theme");var sys=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="light"||t==="dark"?t:sys;if(r==="dark")d.classList.add("dark");else d.classList.remove("dark");d.style.colorScheme=r;var mobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)||window.matchMedia("(max-width:820px)").matches;d.classList.remove("intro-pending","intro-active","intro-locked");if(mobile)d.classList.add("rvp-mobile");}catch(e){}})();`,
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
      </body>
    </html>
  );
}
