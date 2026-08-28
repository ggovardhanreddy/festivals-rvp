import type { Metadata } from "next";
import { DirectoryHub } from "@/components/directory/DirectoryHub";
import { hubBySlug } from "@/lib/directory";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu banking hub.
 *
 * The same curated directory as the English page. Every entry carries a
 * Telugu name and description, which is why "/banking/" is marked
 * `hasTelugu` in the route registry — the page is genuinely translated, not
 * an English page behind a Telugu URL.
 */
export const metadata: Metadata = buildMetadata({
  path: "/banking/",
  locale: "te",
  title: "బ్యాంకింగ్ & ఆర్థిక సేవలు",
  description: "ఆర్‌బీఐ జాబితా ఆధారంగా బ్యాంకుల అధికారిక వెబ్‌సైట్లు, నెట్ బ్యాంకింగ్, యూపీఐ, పింఛను మరియు బీమా సమాచారం.",
});

export default function Page() {
  return <DirectoryHub hub={hubBySlug("banking")!} />;
}
