/**
 * Metadata builder — one place that knows how a page describes itself.
 *
 * hreflang is emitted ONLY between pages that genuinely exist in both
 * languages, driven by `hasTelugu` in the route registry. Advertising a
 * Telugu alternate for a page that has not been translated tells Google
 * something untrue and gets the pair demoted.
 */
import type { Metadata } from "next";
import { withBase } from "@/lib/base";
import { DEFAULT_LOCALE, LOCALE_TAG, type Locale } from "@/lib/i18n/config";
import { findRoute } from "@/lib/routes/registry";
import { VILLAGE_ALSO_KNOWN_AS } from "@/lib/site";

const OG_LOCALE: Record<Locale, string> = { en: "en_IN", te: "te_IN" };

export type PageMetaInput = {
  /** Canonical English-space path, e.g. "/about/". */
  path: string;
  locale?: Locale;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
  keywords?: string[];
};

export function buildMetadata(input: PageMetaInput): Metadata {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const entry = findRoute(input.path);
  const canonicalPath =
    locale === DEFAULT_LOCALE ? input.path : `/te${input.path === "/" ? "/" : input.path}`;
  const image = input.image || "/logo/social-banner.png";
  const noindex = input.noindex ?? entry?.noindex ?? false;

  // Only pair languages when both sides really exist.
  const languages: Record<string, string> | undefined = entry?.hasTelugu
    ? {
        en: input.path,
        te: `/te${input.path === "/" ? "/" : input.path}`,
        "x-default": input.path,
      }
    : undefined;

  const socialTitle = `${input.title} | ${VILLAGE_ALSO_KNOWN_AS}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: canonicalPath, languages },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      title: socialTitle,
      description: input.description,
      url: canonicalPath,
      images: [{ url: withBase(image), alt: socialTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: input.description,
      images: [withBase(image)],
    },
    other: { "content-language": LOCALE_TAG[locale] },
  };
}
