"use client";

/**
 * 🌿 Telugu Culture, and its sub-pages.
 *
 * One component covers the hub and the four literature views, because they
 * differ only in which authors they show. Splitting them into five files would
 * be five places for the same list to drift.
 *
 * The authors list is the part with teeth: it renders each author's public
 * domain status from their year of death, and it shows the three modern names
 * that are *not* free with the date they become so. A reader — or a future
 * maintainer — can see at a glance why Potana has a "read the text" link and
 * Viswanatha Satyanarayana does not.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { SourceList } from "./SourceList";
import { AUTHORS, type Author } from "@/lib/dharma";
import { CULTURE_NAV } from "@/lib/site";

export type CultureView = "hub" | "literature" | "poetry" | "stories" | "spiritual";

/**
 * Which authors belong on which view.
 *
 * A judgement, not a taxonomy: Potana wrote devotional narrative in verse, so
 * he appears under poetry, stories and spiritual literature alike. Repeating
 * an author is more honest than forcing each into one box.
 */
const VIEW_AUTHORS: Record<Exclude<CultureView, "hub">, string[]> = {
  literature: AUTHORS.map((a) => a.slug),
  poetry: ["annamayya", "potana", "kavitrayam", "molla", "vemana", "thyagaraja", "ramadasu", "jashuva", "krishnasastri"],
  stories: ["kavitrayam", "molla", "potana", "gurajada", "veeresalingam", "viswanatha"],
  spiritual: ["annamayya", "potana", "ramadasu", "thyagaraja", "molla", "kavitrayam"],
};

const VIEW_COPY: Record<CultureView, { title: string; titleTe: string; lede: string; ledeTe: string }> = {
  hub: {
    title: "Telugu Culture",
    titleTe: "తెలుగు సంస్కృతి",
    lede: "The traditions, festivals, songs, sayings and literature of this language — and of this village in particular.",
    ledeTe: "ఈ భాష యొక్క సంప్రదాయాలు, పండుగలు, పాటలు, సామెతలు మరియు సాహిత్యం.",
  },
  literature: {
    title: "Telugu Literature",
    titleTe: "తెలుగు సాహిత్యం",
    lede: "A thousand years of it, from Nannayya to the present — and a clear note on which of it we may publish.",
    ledeTe: "నన్నయ్య నుండి నేటి వరకు వేయి సంవత్సరాల సాహిత్యం.",
  },
  poetry: {
    title: "Telugu Poetry",
    titleTe: "తెలుగు కవిత్వం",
    lede: "From the padams of Annamayya to the free verse of the twentieth century.",
    ledeTe: "అన్నమయ్య పదాల నుండి ఇరవయ్యవ శతాబ్ది వచన కవిత్వం వరకు.",
  },
  stories: {
    title: "Telugu Stories",
    titleTe: "తెలుగు కథలు",
    lede: "The epics retold in Telugu, the first Telugu novels, and the plays that changed what could be said.",
    ledeTe: "తెలుగులో ఇతిహాసాలు, మొదటి నవలలు, మరియు నాటకాలు.",
  },
  spiritual: {
    title: "Telugu Spiritual Literature",
    titleTe: "తెలుగు ఆధ్యాత్మిక సాహిత్యం",
    lede: "The devotional writing that carried this tradition to people who had no Sanskrit.",
    ledeTe: "సంస్కృతం తెలియని వారికి ఈ సంప్రదాయాన్ని అందించిన భక్తి సాహిత్యం.",
  },
};

export function CultureHub({ view }: { view: CultureView }) {
  const { lang } = useUiLang();
  const te = lang === "te";
  const copy = VIEW_COPY[view];
  const authors =
    view === "hub" ? [] : AUTHORS.filter((a) => VIEW_AUTHORS[view].includes(a.slug));

  return (
    <main className="page dharma-page culture-page">
      <div className="section">
        <p className="eyebrow">
          {view === "hub" ? (
            te ? "సంస్కృతి" : "Culture"
          ) : (
            <Link href={navHref("/telugu-culture/", lang)}>{te ? "తెలుగు సంస్కృతి" : "Telugu Culture"}</Link>
          )}
        </p>
        <h1>
          {view === "hub" ? "🌿 " : ""}
          {te ? copy.titleTe : copy.title}
        </h1>
        <p className="lede">{te ? copy.ledeTe : copy.lede}</p>
      </div>

      {view === "hub" ? (
        <>
          <section className="section dharma-prose">
            <p>
              Telugu has been written for a thousand years and sung for longer. Its literature begins with
              three poets rendering the Mahabharata across three centuries, turns devotional with Annamayya
              and Potana, turns social with Gurajada and Veeresalingam, and turns modern with Sri Sri. Its
              culture is the part that never needed writing down at all: the festivals, the harvest songs,
              the proverbs an aunt uses to end an argument.
            </p>
            <p>
              These pages introduce that, name who wrote what, and say plainly which of it this site may
              publish and which of it is still someone&rsquo;s property. Where the village has its own version
              of something — a jathara song, a way of telling a story — that belongs in the heritage section,
              because it is ours and nobody else has it.
            </p>
          </section>

          <section className="section">
            <h2>{te ? "విభాగాలు" : "In this section"}</h2>
            <ul className="dharma-cards">
              {CULTURE_NAV.filter((i) => i.href !== "/telugu-culture/").map((item) => (
                <li key={item.href}>
                  <Link className="dharma-card" href={navHref(item.href, lang)}>
                    <span className="dharma-card-icon" aria-hidden>
                      {item.href.includes("sri-sri") ? "✍️" : "📚"}
                    </span>
                    <span className="dharma-card-title">{te ? item.labelTe : item.label}</span>
                    <span className="dharma-card-desc">
                      {item.href.includes("sri-sri")
                        ? te
                          ? "శ్రీరంగం శ్రీనివాసరావు, 1910–1983."
                          : "Srirangam Srinivasa Rao, 1910–1983 — life, works and awards."
                        : te
                          ? VIEW_COPY[item.href.replace(/\/$/, "").split("/").pop() as Exclude<CultureView, "hub">]?.ledeTe
                          : VIEW_COPY[item.href.replace(/\/$/, "").split("/").pop() as Exclude<CultureView, "hub">]?.lede}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="section">
            <h2>{te ? "పండుగలు మరియు సంప్రదాయాలు" : "Festivals and traditions"}</h2>
            <p className="muted">
              {te
                ? "సంక్రాంతి, ఉగాది, దసరా, వినాయక చవితి, జాతరలు — గ్రామ క్యాలెండర్‌లో ఉన్నాయి."
                : "Sankranthi, Ugadi, Dasara, Vinayaka Chavithi and the village jatharas are kept in the events calendar, with photographs going back years."}
            </p>
            <p>
              <Link className="btn" href={navHref("/events/", lang)}>
                {te ? "పండుగల క్యాలెండర్" : "Festival calendar →"}
              </Link>
              {" "}
              <Link className="btn" href={navHref("/gallery/", lang)}>
                {te ? "గ్యాలరీ" : "Gallery →"}
              </Link>
            </p>
          </section>
        </>
      ) : (
        <section className="section">
          <h2>{te ? "రచయితలు" : "Writers"}</h2>
          <ul className="culture-authors">
            {authors.map((a) => (
              <AuthorCard key={a.slug} author={a} te={te} />
            ))}
          </ul>
        </section>
      )}

      {view === "literature" ? (
        <section className="section">
          <h2>{te ? "కాపీరైట్ గురించి" : "About copyright"}</h2>
          <p>
            India protects a published literary work for the author&rsquo;s lifetime plus sixty years from the
            end of the year they died, and there is no renewal system — so the year of death is the whole
            test. An author who died in 1965 or earlier is in the public domain today, and their work can be
            published here in full. Anyone who died later is not, however old the book feels.
          </p>
          <p>
            That is why this page can link to Potana&rsquo;s Bhagavatam and cannot carry a line of Sri Sri.
            It is also why a site hosting something is no evidence that it is free: Telugu Wikisource
            currently carries Sri Sri&rsquo;s Maha Prasthanam in full, which it is not entitled to do.
          </p>
        </section>
      ) : null}
    </main>
  );
}

function AuthorCard({ author, te }: { author: Author; te: boolean }) {
  return (
    <li className={`culture-author${author.publicDomain ? "" : " is-restricted"}`}>
      <div className="culture-author-head">
        <strong lang="te">{author.nameTe}</strong>
        <span className="culture-author-name">{author.name}</span>
        <span className="culture-author-years">{author.lived}</span>
      </div>
      <p className="culture-author-known">{author.known}</p>
      <ul className="culture-author-works">
        {author.works.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      {author.publicDomain ? (
        <p className="culture-author-status culture-author-status--free">
          {te ? "పబ్లిక్ డొమైన్ — పూర్తిగా ప్రచురించవచ్చు" : "Public domain in India — free to publish in full"}
        </p>
      ) : (
        <p className="culture-author-status culture-author-status--held">
          {te
            ? `కాపీరైట్‌లో ఉంది — ${author.publicDomainFrom} నుండి స్వేచ్ఛ`
            : `Still in copyright — public domain from ${author.publicDomainFrom}. This site carries facts about the work, not the work.`}
        </p>
      )}
      {author.sources.length > 0 ? <SourceList sources={author.sources} /> : null}
    </li>
  );
}
