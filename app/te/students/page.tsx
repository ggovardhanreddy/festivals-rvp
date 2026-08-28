import type { Metadata } from "next";
import { DirectoryHub } from "@/components/directory/DirectoryHub";
import { hubBySlug } from "@/lib/directory";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu students hub.
 *
 * The same curated directory as the English page. Every entry carries a
 * Telugu name and description, which is why "/students/" is marked
 * `hasTelugu` in the route registry — the page is genuinely translated, not
 * an English page behind a Telugu URL.
 */
export const metadata: Metadata = buildMetadata({
  path: "/students/",
  locale: "te",
  title: "విద్యార్థుల సేవలు",
  description: "స్కాలర్‌షిప్‌లు, మార్కుల మెమోలు, డిజిలాకర్, ప్రవేశ పరీక్షలు, ఉచిత కోర్సులు మరియు ప్రభుత్వ ఉద్యోగ వనరులు.",
});

export default function Page() {
  return <DirectoryHub hub={hubBySlug("students")!} />;
}
