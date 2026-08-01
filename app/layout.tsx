import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Festivals RVP", template: "%s · Festivals RVP" },
  description: "A private family archive of celebrations, journeys and memories.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://festivals-rvp.pages.dev"),
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
