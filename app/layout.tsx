import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LogoWatermark } from "@/components/LogoWatermark";
import { Providers } from "@/components/Providers";
import { LoadingScreen } from "@/components/LoadingScreen";
import { absoluteUrl, withBase } from "@/lib/base";
import {
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  OFFICIAL_TITLE,
  SITE_DESCRIPTOR,
  SITE_NAME,
  VILLAGE_ADDRESS,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_COORDS,
  VILLAGE_NAME,
  VILLAGE_NAME_VARIANTS,
  SITE_CONTACT_EMAIL,
} from "@/lib/site";
import { SITE_FAQS } from "@/lib/faq";
import { upcomingEvents } from "@/lib/events";

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

const seoTitle = SEO_TITLE;
const seoDescription = SEO_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: seoTitle,
    template: `%s | ${VILLAGE_ALSO_KNOWN_AS}`,
  },
  description: seoDescription,
  keywords: [...SEO_KEYWORDS],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: VILLAGE_ALSO_KNOWN_AS,
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: withBase("/logo/social-banner.png"),
        width: 1200,
        height: 630,
        alt: `${OFFICIAL_TITLE} — ${VILLAGE_ALSO_KNOWN_AS}`,
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
    title: SITE_NAME,
    startupImage: [
      {
        url: withBase("/logo/app-icon.png"),
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: withBase("/logo/app-icon.png"),
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": SITE_NAME,
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#fafaf8",
    "geo.region": "IN-AP",
    "geo.placename": `${VILLAGE_ALSO_KNOWN_AS}, ${VILLAGE_ADDRESS.mandal}`,
    "geo.position": `${VILLAGE_COORDS.lat};${VILLAGE_COORDS.lng}`,
    ICBM: `${VILLAGE_COORDS.lat}, ${VILLAGE_COORDS.lng}`,
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
    // Preferred Google site name (not the bare domain).
    name: VILLAGE_ALSO_KNOWN_AS,
    alternateName: [
      ...VILLAGE_NAME_VARIANTS,
      SITE_NAME,
      OFFICIAL_TITLE,
      "reddivaripalli.com",
      "www.reddivaripalli.com",
    ],
    url: siteUrl,
    description: seoDescription,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: OFFICIAL_TITLE,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo/logo-master.png", siteUrl),
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: OFFICIAL_TITLE,
    alternateName: [SITE_NAME, ...VILLAGE_NAME_VARIANTS],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo/logo-master.png", siteUrl),
      width: 512,
      height: 512,
    },
    description: `${SITE_DESCRIPTOR} for ${VILLAGE_ALSO_KNOWN_AS} (${VILLAGE_NAME}), ${VILLAGE_ADDRESS.gramPanchayat}, ${VILLAGE_ADDRESS.district}, ${VILLAGE_ADDRESS.state}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: VILLAGE_ALSO_KNOWN_AS,
      addressRegion: VILLAGE_ADDRESS.state,
      postalCode: VILLAGE_ADDRESS.pincode,
      addressCountry: "IN",
      streetAddress: VILLAGE_ADDRESS_LINE,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: VILLAGE_ADDRESS.district,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${VILLAGE_ALSO_KNOWN_AS} Village`,
    alternateName: [...VILLAGE_NAME_VARIANTS, VILLAGE_NAME],
    description: seoDescription,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: VILLAGE_ALSO_KNOWN_AS,
      addressRegion: VILLAGE_ADDRESS.state,
      postalCode: VILLAGE_ADDRESS.pincode,
      addressCountry: "IN",
      streetAddress: `${VILLAGE_ADDRESS.gramPanchayat}, ${VILLAGE_ADDRESS.mandal}`,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: VILLAGE_COORDS.lat,
      longitude: VILLAGE_COORDS.lng,
    },
    containedInPlace: [
      {
        "@type": "AdministrativeArea",
        name: VILLAGE_ADDRESS.gramPanchayat,
      },
      {
        "@type": "AdministrativeArea",
        name: VILLAGE_ADDRESS.mandal,
      },
      {
        "@type": "AdministrativeArea",
        name: "YSR Kadapa District",
      },
      {
        "@type": "AdministrativeArea",
        name: "Annamayya District",
      },
      {
        "@type": "State",
        name: "Andhra Pradesh",
      },
      {
        "@type": "Country",
        name: "India",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Members",
        item: `${siteUrl}/members/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Our Heritage",
        item: `${siteUrl}/about/`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Events & Birthdays",
        item: `${siteUrl}/events/`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Developments",
        item: `${siteUrl}/developments/`,
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "Gallery",
        item: `${siteUrl}/gallery/`,
      },
      {
        "@type": "ListItem",
        position: 7,
        name: "Contact",
        item: `${siteUrl}/contact/`,
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: absoluteUrl("/logo/social-banner.png", siteUrl),
    url: absoluteUrl("/logo/logo-master.png", siteUrl),
    name: `${VILLAGE_ALSO_KNOWN_AS} — ${SITE_NAME}`,
    description: `Official logo and social preview for ${VILLAGE_ALSO_KNOWN_AS} village digital archive.`,
    creditText: SITE_NAME,
    creator: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
      email: SITE_CONTACT_EMAIL,
    },
    copyrightNotice: `© ${OFFICIAL_TITLE}. All rights reserved. Stewarded by ${SITE_NAME}.`,
    license: `${siteUrl}/terms/`,
    acquireLicensePage: `${siteUrl}/contact/`,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SITE_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
  ...upcomingEvents(8).map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date,
    endDate: event.endDate || event.date,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: event.image
      ? absoluteUrl(event.image, siteUrl)
      : absoluteUrl("/logo/social-banner.png", siteUrl),
    location: {
      "@type": "Place",
      name: `${VILLAGE_ALSO_KNOWN_AS} Village`,
      address: {
        "@type": "PostalAddress",
        addressLocality: VILLAGE_ALSO_KNOWN_AS,
        addressRegion: VILLAGE_ADDRESS.state,
        postalCode: VILLAGE_ADDRESS.pincode,
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl,
    },
    url: event.slug ? `${siteUrl}/${event.slug}/` : `${siteUrl}/events/`,
  })),
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
            __html: `(function(){try{var d=document.documentElement;var t=localStorage.getItem("rvp-theme");var sys=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var r=t==="light"||t==="dark"?t:sys;if(r==="dark")d.classList.add("dark");else d.classList.remove("dark");d.style.colorScheme=r;var mobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)||window.matchMedia("(max-width:820px)").matches;d.classList.remove("intro-pending","intro-active","intro-locked");if(mobile)d.classList.add("rvp-mobile");window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__rvpDeferredInstall=e;window.dispatchEvent(new CustomEvent("rvp:install-ready"));});}catch(e){}})();`,
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Providers>
          <LoadingScreen />
          <div className="site-shell">
            <LogoWatermark />
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
