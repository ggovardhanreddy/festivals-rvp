import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { Providers } from "@/components/Providers";
import { LoadingScreen } from "@/components/LoadingScreen";
import { basePath, withBase } from "@/lib/base";
import { SITE_NAME } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ggovardhanreddy.github.io/festivals-rvp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} | Festivals RVP`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "A premium private memory book for Sankranthi, Vinayaka Chavithi, and birthdays.",
  openGraph: { type: "website", siteName: SITE_NAME },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const sw = withBase("/sw.js");
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} ${poppins.variable}`}
    >
      <body>
        <Providers>
          <LoadingScreen />
          <div className="site-shell">
            <SiteHeader />
            {children}
          </div>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('${sw}',{scope:'${basePath || "/"}'}))`,
          }}
        />
      </body>
    </html>
  );
}
