"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Mic } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { withBase } from "@/lib/base";
import { trackAnalyticsHit } from "@/lib/use-community";
import { search as runSearch, facetCounts, type SearchHit } from "@/lib/search/query";
import type { SearchDoc, SearchShard } from "@/lib/search/schema";
import { POPULAR_SEARCHES } from "@/lib/platform/doors";
import type { Album, MediaType, MediaWithAlbum } from "@/lib/types";
import { Gallery } from "@/components/Gallery";
import { isPublicMedia } from "@/lib/media-protection";
import { useMediaProtection } from "@/lib/use-media-protection";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/voice";
import { LOCALE_TAG } from "@/lib/i18n/config";

/**
 * The search page.
 *
 * Matching is lib/search/query.ts — a weighted scan with Telugu bigrams and a
 * hand-checked transliteration table, so "ramalayam" and "రామాలయం" find the
 * same records. It replaces a plain `haystack.includes(query)` filter that
 * could not match across scripts at all.
 *
 * The index is public and downloadable, so it contains only public documents;
 * gated and admin sections are dropped at build time by isIndexable().
 */

type Status = "loading" | "ready" | "error";

const SECTION_LABEL: Record<string, string> = {
  village: "nav.home",
  media: "nav.gallery",
  community: "nav.community",
  heritage: "nav.heritage",
  temples: "nav.temples",
  utility: "nav.settings",
  learn: "nav.learn",
  games: "nav.play",
  kids: "nav.kids",
  agriculture: "nav.agriculture",
  careers: "nav.careers",
  government: "nav.government",
  weather: "nav.weather",
};

const SECTION_ICON: Record<string, string> = {
  village: "explore",
  media: "gallery",
  community: "community",
  heritage: "heritage",
  temples: "temples",
  utility: "explore",
};

const RESULT_LIMIT = 200;
const TEXT_PAGE = 24;

function mediaFromDoc(doc: SearchDoc): MediaWithAlbum | null {
  if (!doc.media) return null;
  const album: Album = {
    year: doc.media.year,
    category: (doc.category as Album["category"]) || "Festivals",
    slug: doc.media.albumSlug,
    title: doc.media.album,
    description: "",
    published: true,
    order: 0,
    media: [],
    bucket: doc.media.bucket as Album["bucket"],
  };
  return {
    id: doc.id,
    file: doc.media.file,
    thumb: doc.media.thumb,
    poster: doc.media.poster,
    type: doc.media.type as MediaType,
    title: doc.title,
    date: doc.date || "",
    tags: doc.keywords,
    width: doc.media.width,
    height: doc.media.height,
    blurDataURL: doc.media.blurDataURL,
    album,
  };
}

export function SearchPage() {
  const { t, lang } = useUiLang();
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [deferred, setDeferred] = useState(initialQuery);
  const [section, setSection] = useState("all");
  const [shown, setShown] = useState(TEXT_PAGE);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const inputRef = useRef<HTMLInputElement>(null);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const { rules } = useMediaProtection();

  // Voice, feature-detected: no microphone button where the API is missing.
  useEffect(() => {
    setVoiceAvailable(getSpeechRecognition() !== null);
    return () => recognitionRef.current?.stop();
  }, []);

  // Load the index once.
  useEffect(() => {
    let cancelled = false;
    fetch(withBase("/search-index.json"))
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("index"))))
      .then((data: SearchShard) => {
        if (cancelled) return;
        setDocs(Array.isArray(data?.docs) ? data.docs : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce the typed query so a long index scan never runs per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setDeferred(query), 160);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => setShown(TEXT_PAGE), [deferred, section]);

  // Keep the URL shareable without pushing a history entry per keystroke.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (deferred) url.searchParams.set("q", deferred);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url.toString());
  }, [deferred]);

  useEffect(() => {
    const q = deferred.trim();
    if (q.length < 2) return;
    const id = window.setTimeout(() => {
      void trackAnalyticsHit({ path: "/search/", kind: "search", meta: q.slice(0, 80) });
    }, 900);
    return () => window.clearTimeout(id);
  }, [deferred]);

  const allHits = useMemo(
    () => (docs.length ? runSearch(docs, deferred, { limit: RESULT_LIMIT }) : []),
    [docs, deferred],
  );
  const counts = useMemo(() => facetCounts(allHits), [allHits]);

  const hits = useMemo(() => {
    const sectioned =
      section === "all"
        ? allHits
        : allHits.filter((h) => h.doc.section === section);
    return sectioned.filter((h) => {
      if (!h.doc.media) return true;
      const id = h.doc.id.startsWith("media:")
        ? h.doc.id.slice("media:".length)
        : h.doc.id;
      return isPublicMedia({ id, file: h.doc.media.file }, rules);
    });
  }, [allHits, section, rules]);

  const mediaHits = useMemo(
    () => hits.map((h) => mediaFromDoc(h.doc)).filter(Boolean) as MediaWithAlbum[],
    [hits],
  );
  const textHits = useMemo(() => hits.filter((h) => !h.doc.media), [hits]);

  const sections = useMemo(
    () =>
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([id, n]) => ({ id, n })),
    [counts],
  );

  const pick = useCallback((value: string) => {
    setQuery(value);
    setDeferred(value);
    inputRef.current?.focus();
  }, []);

  const toggleVoice = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = LOCALE_TAG[lang];
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) pick(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const trimmed = deferred.trim();
  const total = hits.length;

  return (
    <div className="searchpage">
      <form
        className="searchpage-form"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setDeferred(query);
        }}
      >
        <label className="sr-only" htmlFor="site-search">
          {t("search.label")}
        </label>
        <div className="searchpage-field">
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            className="searchpage-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            autoComplete="off"
            enterKeyHint="search"
          />
          {query ? (
            <button
              type="button"
              className="searchpage-clear"
              onClick={() => pick("")}
              aria-label={t("search.clear")}
            >
              ×
            </button>
          ) : null}
        </div>
        {voiceAvailable ? (
          <button
            type="button"
            className="searchpage-voice"
            data-listening={listening || undefined}
            onClick={toggleVoice}
            aria-label={t("search.voice")}
            aria-pressed={listening}
          >
            <Mic size={20} aria-hidden />
          </button>
        ) : null}
        <button type="submit" className="btn searchpage-submit">
          {t("search.submit")}
        </button>
      </form>

      {status === "error" ? (
        <div className="searchpage-state" role="alert">
          <p>{t("search.error")}</p>
          <p className="muted">{t("search.errorHint")}</p>
        </div>
      ) : null}

      {status === "loading" ? (
        <p className="muted searchpage-state">{t("search.loading")}</p>
      ) : null}

      {status === "ready" && sections.length > 1 ? (
        <div
          className="searchpage-facets"
          role="group"
          aria-label={t("search.filters")}
        >
          <button
            type="button"
            className={`filter-chip${section === "all" ? " is-active" : ""}`}
            aria-pressed={section === "all"}
            onClick={() => setSection("all")}
          >
            {t("search.allSections")} <span className="muted">{allHits.length}</span>
          </button>
          {sections.map(({ id, n }) => (
            <button
              key={id}
              type="button"
              className={`filter-chip${section === id ? " is-active" : ""}`}
              aria-pressed={section === id}
              onClick={() => setSection(id)}
            >
              {t(SECTION_LABEL[id] ?? "search.allSections")}{" "}
              <span className="muted">{n}</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="searchpage-count muted" role="status" aria-live="polite">
        {status !== "ready"
          ? ""
          : trimmed
            ? t("search.resultsFor", undefined, { count: total, query: trimmed })
            : t("search.results", undefined, { count: total })}
      </p>

      {status === "ready" && trimmed && total === 0 ? (
        <div className="searchpage-state searchpage-empty">
          <p className="searchpage-empty-title">
            {t("search.noResults", undefined, { query: trimmed })}
          </p>
          <p className="muted">{t("search.noResultsHint")}</p>
          <PopularSearches onPick={pick} label={t("search.popular")} t={t} />
        </div>
      ) : null}

      {status === "ready" && !trimmed ? (
        <div className="searchpage-state">
          <PopularSearches onPick={pick} label={t("search.popular")} t={t} />
        </div>
      ) : null}

      {textHits.length ? (
        <section className="searchpage-results">
          <ul className="searchpage-list">
            {textHits.slice(0, shown).map((hit) => (
              <ResultRow key={hit.doc.id} hit={hit} t={t} />
            ))}
          </ul>
          {textHits.length > shown ? (
            <button
              type="button"
              className="btn ghost searchpage-more"
              onClick={() => setShown((n) => n + TEXT_PAGE)}
            >
              {t("common.viewAll")} ({textHits.length - shown})
            </button>
          ) : null}
        </section>
      ) : null}

      {mediaHits.length ? (
        <section className="searchpage-media">
          <h2 className="searchpage-media-title">
            {t("nav.gallery")} <span className="muted">{mediaHits.length}</span>
          </h2>
          <Gallery items={mediaHits} />
        </section>
      ) : null}
    </div>
  );
}

function ResultRow({
  hit,
  t,
}: {
  hit: SearchHit;
  t: (key: string, fallback?: string) => string;
}) {
  const { doc } = hit;
  return (
    <li className="searchpage-item">
      <Link href={doc.url} className="searchpage-link">
        <span className="searchpage-item-icon" aria-hidden>
          <SectionIcon name={SECTION_ICON[doc.section] ?? "explore"} size={18} />
        </span>
        <span className="searchpage-item-text">
          <span className="eyebrow">
            {t(SECTION_LABEL[doc.section] ?? "search.allSections")}
            {doc.category ? ` · ${doc.category}` : ""}
          </span>
          <strong>{doc.title}</strong>
          {doc.description ? (
            <span className="muted">{doc.description}</span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

function PopularSearches({
  onPick,
  label,
  t,
}: {
  onPick: (q: string) => void;
  label: string;
  t: (key: string, fallback?: string) => string;
}) {
  return (
    <div className="searchpage-popular">
      <h2 className="searchpage-popular-title">{label}</h2>
      <div className="searchpage-popular-chips">
        {POPULAR_SEARCHES.map((p) => (
          <button
            key={p.key}
            type="button"
            className="filter-chip"
            onClick={() => onPick(p.query)}
          >
            {t(p.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
