"use client";

/**
 * 🏡 Reddivaripalli Spiritual Heritage — §15.
 *
 * The one section in this redesign whose content nobody else on the internet
 * has. Everything under /dharma/ can be read at Tirumala or on Wikisource;
 * this cannot. The Sri Ramalayam, the jatharas, the elders who remember when
 * the temple was rebuilt — that is the village's own, and it is the reason
 * this section leads with what already exists in the archive rather than with
 * an empty "contribute" form.
 *
 * Reads from the material the site already has: the festival records, the
 * album gallery, and the heritage archive. Nothing is invented, and where the
 * village has not recorded something yet the page says so and asks.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { CULTURE_FESTIVALS } from "@/lib/festivals";
import { albumHref } from "@/lib/site";
import type { Album } from "@/lib/types";

/** Festivals with a devotional character, in the order of the village year. */
const TEMPLE_FESTIVALS = [
  "sri-rama-navami",
  "vinayaka-chavithi",
  "varalakshmi-vratam",
  "dasara",
  "deepavali",
  "ugadi",
  "mathamma-jathara",
  "devapatlamma-jathara",
];

export function SpiritualHeritagePage({ albums }: { albums: Album[] }) {
  const { lang } = useUiLang();
  const te = lang === "te";

  const festivals = TEMPLE_FESTIVALS.map((slug) =>
    CULTURE_FESTIVALS.find((f) => f.slug === slug),
  ).filter(Boolean);

  const withMedia = albums.filter((a) => (a.media?.length ?? 0) > 0);
  const byBucket = new Map<string, Album[]>();
  for (const a of withMedia) {
    // Album.bucket is optional in the type; skip the ones without one rather
    // than inventing a key, so a malformed album cannot land in the wrong pile.
    if (!a.bucket) continue;
    const list = byBucket.get(a.bucket) ?? [];
    list.push(a);
    byBucket.set(a.bucket, list);
  }

  return (
    <main className="page dharma-page">
      <div className="section">
        <p className="eyebrow">{te ? "మన వారసత్వం" : "Our own heritage"}</p>
        <h1>🏡 {te ? "రెడ్డివారిపల్లె ఆధ్యాత్మిక వారసత్వం" : "Reddivaripalli Spiritual Heritage"}</h1>
        <p className="lede">
          {te
            ? "శ్రీ రామాలయం, ఆలయ చరిత్ర, జాతరలు, స్థానిక భజనలు మరియు పెద్దల జ్ఞాపకాలు."
            : "The Sri Ramalayam, the jatharas, the songs sung here, and what the elders remember. This is the part of the tradition that exists nowhere else."}
        </p>
      </div>

      <section className="section dharma-prose">
        <p>
          {te
            ? "శ్రీ రామాలయం ఈ గ్రామ ఆధ్యాత్మిక జీవితానికి కేంద్రం. రామాయణం ఇక్కడ దూరపు గ్రంథం కాదు — గర్భగుడిలోని దేవుడు, క్యాలెండర్‌లోని పండుగలు, మరియు ఎంతోమంది పేర్లు దాని నుండే వచ్చాయి."
            : "The Sri Ramalayam is the centre of this village's spiritual life. That makes the Ramayana not a distant classic here but the text behind the deity in the sanctum, the festivals in the calendar, and a good many of the names in the members directory."}
        </p>
        <p>
          {te
            ? "ఈ పేజీ గ్రామం ఇప్పటికే భద్రపరచిన వాటితో ప్రారంభమవుతుంది — పండుగల ఫోటోలు, ఆల్బమ్‌లు, వారసత్వ సేకరణ. ఇంకా నమోదు కాని వాటిని నమోదు చేయడం మనందరి పని."
            : "This page starts with what the village has already kept — the festival photographs, the albums, the heritage archive. What is not yet recorded is work still to do, and the elders who could tell it are not getting younger."}
        </p>
      </section>

      <section className="section">
        <h2>{te ? "ఆలయ పండుగలు" : "Temple festivals kept here"}</h2>
        <ul className="dharma-cards">
          {festivals.map((f) => {
            if (!f) return null;
            const count = (byBucket.get(f.folder) ?? []).reduce(
              (n, a) => n + (a.media?.length ?? 0),
              0,
            );
            return (
              <li key={f.slug}>
                <Link className="dharma-card" href={navHref(`/${f.slug}/`, lang)}>
                  <span className="dharma-card-icon" aria-hidden>
                    🪔
                  </span>
                  <span className="dharma-card-title">{f.title}</span>
                  <span className="dharma-card-desc">{f.blurb}</span>
                  {count > 0 ? (
                    <span className="dharma-card-meta">
                      {count} {te ? "ఫోటోలు" : count === 1 ? "photograph" : "photographs"}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {withMedia.length > 0 ? (
        <section className="section">
          <h2>{te ? "జాతర మరియు పండుగ ఆల్బమ్‌లు" : "Jathara and festival albums"}</h2>
          <ul className="dharma-album-list">
            {withMedia.slice(0, 12).map((a) => (
              <li key={`${a.bucket}-${a.year}-${a.slug}`}>
                <Link href={navHref(albumHref(a), lang)}>
                  {a.title} · {a.year}
                </Link>
                <span className="muted">
                  {a.media?.length ?? 0} {te ? "అంశాలు" : "items"}
                </span>
              </li>
            ))}
          </ul>
          <p>
            <Link className="btn" href={navHref("/gallery/", lang)}>
              {te ? "పూర్తి గ్యాలరీ" : "All albums →"}
            </Link>
          </p>
        </section>
      ) : null}

      <section className="section">
        <h2>{te ? "ఇంకా నమోదు కావాల్సినవి" : "Still to be recorded"}</h2>
        <p className="muted">
          {te
            ? "ఆలయ నిర్మాణ చరిత్ర, పాత ఉత్సవ పత్రాలు, స్థానిక భజన పాటలు, పెద్దల మౌఖిక చరిత్ర. మీ దగ్గర ఫోటోలు, పత్రాలు లేదా జ్ఞాపకాలు ఉంటే పంచుకోండి."
            : "The temple's building history, older festival documents, the local bhajan repertoire, and the elders' oral history. None of it is written down yet. If you hold a photograph, a document, or a memory of how something used to be done, it belongs here."}
        </p>
        <p className="dharma-note">
          <strong>{te ? "ఒక ఆలోచన" : "One idea worth acting on"}:</strong>{" "}
          {te
            ? "అన్నమయ్య, రామదాసు, త్యాగరాజు రచనలు పబ్లిక్ డొమైన్‌లో ఉన్నాయి — కానీ వాటి రికార్డింగ్‌లు కాదు. గ్రామ గాయకులు ఈ కీర్తనలు పాడి రికార్డ్ చేస్తే, ఆ రికార్డింగ్ మనదే అవుతుంది మరియు స్వేచ్ఛగా పంచుకోవచ్చు."
            : "Annamayya, Ramadasu and Thyagaraja are public domain, but almost every recording of them is not. If the village's own singers record these keerthanas, that recording is ours — free to share, and a genuine contribution to a repertoire that has almost nothing openly licensed in it."}
        </p>
        <p>
          <Link className="btn btn-primary" href={navHref("/contact/", lang)}>
            {te ? "సంప్రదించండి" : "Get in touch"}
          </Link>
          {" "}
          <Link className="btn" href={navHref("/heritage/", lang)}>
            {te ? "వారసత్వ సేకరణ" : "Heritage archive →"}
          </Link>
        </p>
      </section>
    </main>
  );
}
