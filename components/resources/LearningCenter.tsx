"use client";

/**
 * §21's Learning Center — the hub.
 *
 * Written so it reads honestly at zero resources, which is the state it will
 * be in the day it ships (§23 holds everything for review). An empty hub that
 * says "nothing collected yet, here are the official portals" is useful; one
 * that shows ten empty category cards and a "0" is not. So the category grid
 * only lists sections that have something in them, and the official-sources
 * list is always there — for most of these portals a link IS the resource.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { LEARN_AREAS } from "@/lib/learn-areas";
import { ResourceCard } from "./ResourceCard";
import { VideoEmbed } from "./VideoEmbed";
import {
  CATEGORY_TREE,
  categoryCounts,
  latest,
  playableVideos,
  publicResources,
  type Resource,
  type Source,
} from "@/lib/resources";

type Course = {
  id: string;
  title: { en: string; te?: string };
  summary?: { en: string; te?: string };
};

export function LearningCenter({
  resources,
  sources,
  courses = [],
}: {
  resources: Resource[];
  sources: Source[];
  courses?: Course[];
}) {
  const { t, lang } = useUiLang();
  const live = publicResources(resources);
  const counts = categoryCounts(live);
  const sourceName = new Map(sources.map((s) => [s.id, s.name]));
  const withItems = CATEGORY_TREE.filter((c) => (counts[c.key] ?? 0) > 0);
  const videos = latest(playableVideos(live), 3);
  const newest = latest(
    live.filter((r) => r.resourceType !== "video"),
    6,
  );

  return (
    <main className="page resource-center">
      <div className="section">
        <span className="kids-intro-icon" aria-hidden>
          <SectionIcon name="learn" size={34} />
        </span>
        <p className="eyebrow">{lang === "te" ? "అందరికీ ఉచితం" : "Free for everyone"}</p>
        <h1>📚 {lang === "te" ? "లెర్నింగ్ సెంటర్" : "Learning Center"}</h1>
        <p className="lede">
          {lang === "te"
            ? "పాఠశాల, ఇంటర్, ప్రవేశ మరియు పోటీ పరీక్షలు, వ్యవసాయం, ఉద్యోగాలు మరియు ఉపకార వేతనాల కోసం అధికారిక వనరులు — ఒకే చోట."
            : "Official study material, question papers, notifications and scholarships for Reddivaripalli students and farmers, gathered in one place."}
        </p>
      </div>

      {newest.length > 0 ? (
        <section className="section">
          <h2>{lang === "te" ? "తాజా వనరులు" : "Latest Resources"}</h2>
          <div className="resource-grid">
            {newest.map((r) => (
              <ResourceCard key={r.id} resource={r} sourceName={sourceName.get(r.sourceId)} />
            ))}
          </div>
        </section>
      ) : null}

      {videos.length > 0 ? (
        <section className="section">
          <h2>{lang === "te" ? "తాజా వీడియోలు" : "Latest Videos"}</h2>
          <div className="resource-grid resource-grid--videos">
            {videos.map((r) => (
              <div key={r.id} className="resource-video-card">
                <VideoEmbed resource={r} />
                <h3>{(lang === "te" && r.titleTe) || r.title}</h3>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {withItems.length > 0 ? (
        <section className="section">
          <h2>{lang === "te" ? "విభాగాలు" : "Browse by section"}</h2>
          <ul className="kids-grid">
            {withItems.map((cat) => (
              <li key={cat.key}>
                <Link className="kids-card" href={navHref(`/learn/${cat.key}/`, lang)}>
                  <span className="kids-card-icon" aria-hidden>
                    <SectionIcon name={cat.icon} size={26} />
                  </span>
                  <span className="kids-card-title">{lang === "te" ? cat.labelTe : cat.label}</span>
                  <span className="kids-card-desc">{cat.blurb}</span>
                  <span className="resource-count">
                    {counts[cat.key]} {lang === "te" ? "వనరులు" : counts[cat.key] === 1 ? "resource" : "resources"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <h2>{lang === "te" ? "సేకరణ ఇంకా ప్రారంభం కాలేదు" : "Collection has not started yet"}</h2>
          <p className="muted">
            {lang === "te"
              ? "అధికారిక వనరుల సేకరణ ఏర్పాటు చేయబడింది కానీ ఇంకా ఏదీ ప్రచురించబడలేదు. అప్పటి వరకు కింది అధికారిక పోర్టళ్లను నేరుగా ఉపయోగించండి."
              : "The collector is set up but nothing has been published yet — every resource is reviewed before it appears here. In the meantime, the official portals below are the place to look."}
          </p>
        </section>
      )}

      {courses.length > 0 ? (
        <section className="section">
          <h2>{t("learn.courses")}</h2>
          <ul className="agri-list">
            {courses.map((c) => (
              <li key={c.id} className="agri-card">
                <strong>{(lang === "te" && c.title.te) || c.title.en}</strong>
                {c.summary ? (
                  <span className="muted">
                    {(lang === "te" && c.summary.te) || c.summary.en}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* The village's own practice material, which predates the collector and
          is not going anywhere. /learn/ is now the single door to both. */}
      <section className="section">
        <h2>{lang === "te" ? "సాధన మరియు కార్యకలాపాలు" : "Practice & Activities"}</h2>
        <ul className="kids-grid">
          {LEARN_AREAS.filter((a) => a.ready).map((a) => (
            <li key={a.id}>
              <Link className="kids-card" href={navHref(a.href, lang)}>
                <span className="kids-card-icon" aria-hidden>
                  <SectionIcon name={a.icon} size={26} />
                </span>
                <span className="kids-card-title">{t(a.labelKey)}</span>
                <span className="kids-card-desc">{t(a.descKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Always shown. For most sources in the registry a link is the resource:
          their terms permit linking and nothing more. */}
      <section className="section">
        <h2>{lang === "te" ? "అధికారిక పోర్టళ్లు" : "Official portals"}</h2>
        <p className="muted">
          {lang === "te"
            ? "ఇవి ప్రభుత్వ అధికారిక వెబ్‌సైట్లు. ఏ సమాచారమైనా చివరకు ఇక్కడే నిర్ధారించుకోండి."
            : "These are the official government sites. Always confirm anything important against the source itself."}
        </p>
        <ul className="resource-source-list">
          {sources
            .filter((s) => s.active)
            .map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
                <span className="muted">
                  {s.categories
                    .map((c) => {
                      const cat = CATEGORY_TREE.find((x) => x.key === c);
                      return cat ? (lang === "te" ? cat.labelTe : cat.label) : c;
                    })
                    .join(" · ")}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
