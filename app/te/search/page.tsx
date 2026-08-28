import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchPage } from "@/components/search/SearchPage";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Telugu search.
 *
 * The matcher and the index are shared with `/search/` — the index carries
 * both scripts and lib/search/normalize.ts maps between them — so this is a
 * genuine Telugu entry point rather than an English page with a Telugu URL.
 */
export const metadata: Metadata = buildMetadata({
  path: "/search/",
  locale: "te",
  title: "వెతకండి",
  description:
    "రెడ్డివారిపల్లి — ప్రభుత్వ సేవలు, సభ్యులు, పండుగలు, ఫోటోలు, పత్రాలు మరియు గ్రామ సమాచారం కోసం వెతకండి.",
});

export default function Page() {
  return (
    <main className="page">
      <div className="section">
        <h1>వెతకండి</h1>
        <p className="lede">
          ప్రభుత్వ సేవలు, బ్యాంకులు, సభ్యులు, పండుగలు, ఫోటోలు, అభివృద్ధి పనులు,
          పత్రాలు — తెలుగులో లేదా ఇంగ్లీషులో వెతకవచ్చు.
        </p>
      </div>
      <div className="section">
        <Suspense fallback={<p className="muted">లోడ్ అవుతోంది…</p>}>
          <SearchPage />
        </Suspense>
      </div>
    </main>
  );
}
