import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu homepage.
 *
 * Same implementation as `/`; the shell renders its chrome in Telugu because
 * LanguageProvider derives the locale from the URL. This is a genuinely
 * Telugu-language entry point, not a placeholder — which is why "/" is the one
 * route currently marked `hasTelugu` in the registry and the only one that
 * emits an hreflang pair.
 */
export const metadata: Metadata = buildMetadata({
  path: "/",
  locale: "te",
  title: "రెడ్డివారిపల్లి — మన గ్రామం",
  description:
    "రెడ్డివారిపల్లి (కొండారెడ్డిగారిపల్లి) గ్రామ పంచాయతీ — వారసత్వం, పండుగలు, దేవాలయాలు, సభ్యులు, గ్యాలరీ మరియు గ్రామ సమాచారం.",
});

export default function Page() {
  return <HomePage />;
}
