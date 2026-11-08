import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.reddivaripalli.com";
  const pages = ["", "village", "heritage", "temples", "festivals", "people", "development", "gallery", "news", "contact"];
  const lastModified = new Date("2026-01-01T00:00:00.000Z");

  return pages.map((page) => ({
    url: `${base}/production${page ? `/${page}` : ""}`,
    lastModified,
    changeFrequency: "weekly",
    priority: page === "" ? 1 : 0.7,
  }));
}
