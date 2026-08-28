import type { Metadata } from "next";
import { DirectoryHub } from "@/components/directory/DirectoryHub";
import { hubBySlug } from "@/lib/directory";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu farmers hub.
 *
 * The same curated directory as the English page. Every entry carries a
 * Telugu name and description, which is why "/farmers/" is marked
 * `hasTelugu` in the route registry — the page is genuinely translated, not
 * an English page behind a Telugu URL.
 */
export const metadata: Metadata = buildMetadata({
  path: "/farmers/",
  locale: "te",
  title: "రైతుల సేవలు",
  description: "పీఎం-కిసాన్, పంట బీమా, ఈ-పంట, అడంగల్, భూసార కార్డు, మార్కెట్ ధరలు మరియు వ్యవసాయ శాఖ వనరులు.",
});

export default function Page() {
  return <DirectoryHub hub={hubBySlug("farmers")!} />;
}
