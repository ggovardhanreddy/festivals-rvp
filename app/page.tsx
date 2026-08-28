import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { buildMetadata } from "@/lib/seo/metadata";
import { SEO_DESCRIPTION, SEO_TITLE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  path: "/",
  locale: "en",
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
});

export default function Page() {
  return <HomePage />;
}
