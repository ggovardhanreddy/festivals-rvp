import type { Metadata } from "next";
import { DirectoryHub } from "@/components/directory/DirectoryHub";
import { hubBySlug } from "@/lib/directory";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu government hub.
 *
 * The same curated directory as the English page. Every entry carries a
 * Telugu name and description, which is why "/government/" is marked
 * `hasTelugu` in the route registry — the page is genuinely translated, not
 * an English page behind a Telugu URL.
 */
export const metadata: Metadata = buildMetadata({
  path: "/government/",
  locale: "te",
  title: "ప్రభుత్వ సేవలు",
  description: "రెడ్డివారిపల్లి — ఆధార్, పాన్, మీసేవ, డిజిలాకర్, భూమి రికార్డులు, పింఛన్లు మరియు ఇతర అధికారిక ప్రభుత్వ సేవలకు నేరుగా లింకులు.",
});

export default function Page() {
  return <DirectoryHub hub={hubBySlug("government")!} />;
}
