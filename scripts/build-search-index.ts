/**
 * Builds the universal search index.
 *
 * Everything searchable on the site becomes a SearchDoc here — pages, gallery
 * media, members, the directory, events, developments, documents and heritage
 * records — so that adding a section later means emitting SearchDocs rather
 * than rewriting search.
 *
 * Two rules this file exists to enforce:
 *
 *  1. Nothing private is ever indexed. The index is a public, downloadable
 *     JSON file; `isIndexable()` drops gated and admin sections, and
 *     fun-trips media is filtered before it gets that far.
 *  2. No invented content. Every document is derived from something already
 *     in the repository. Telugu keywords come only from the reviewed
 *     catalogue and the hand-checked transliteration table.
 */
import fs from "node:fs";
import path from "node:path";
import { allMedia } from "../lib/content";
import { albumHref } from "../lib/site";
import { loadMembers } from "../lib/members";
import { loadEvents } from "../lib/events";
import { loadDevelopments } from "../lib/developments";
import {
  loadDirectorySeed,
  loadHeritageSeed,
  loadPanchayatDocsSeed,
} from "../lib/community";
import { loadVillageHeritage } from "../lib/village-heritage";
import { LIVE_ROUTES, type SectionId } from "../lib/routes/registry";
import {
  AUTHORS,
  DHARMA_ABOUT,
  DHARMA_CONCEPTS,
  DHARMA_PAGES,
  GITA,
  SRI_SRI_PAGE,
} from "../lib/dharma";
import { isIndexable, type SearchDoc, type SearchShard } from "../lib/search/schema";
import { TRANSLITERATIONS } from "../lib/search/normalize";
import { translate } from "../lib/i18n";
import { DIRECTORY, HELPLINES, HUBS } from "../lib/directory";
import { LOCALES } from "../lib/i18n/config";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const root = process.cwd();

/**
 * Relevance multipliers. A person outranks a photograph of that person, and a
 * section landing page outranks an individual record inside it, because
 * someone typing "members" almost always wants the page.
 */
const WEIGHT: Record<string, number> = {
  // An official service outranks everything: someone typing "aadhaar" wants
  // the government link, not a photograph tagged with the word.
  official: 3.6,
  page: 3.2,
  member: 2.6,
  directory: 2.4,
  heritage: 2.2,
  event: 2.0,
  document: 1.8,
  development: 1.8,
  media: 1.0,
};

/** Telugu spellings for a title, taken only from the hand-checked table. */
function teluguKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  for (const [latin, telugu] of TRANSLITERATIONS) {
    if (lower.includes(latin)) out.push(telugu);
  }
  return out;
}

function clean(text: string | undefined | null, max = 300): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

function pageDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const route of LIVE_ROUTES) {
    if (route.private) continue;
    for (const locale of LOCALES) {
      // A Telugu page document is only emitted when a Telugu page genuinely
      // exists. `hasTelugu` is the registry's honest switch; emitting /te/x/
      // for an untranslated route would put a 404 in the search results.
      if (locale !== "en" && !route.hasTelugu) continue;
      const label = translate(locale, route.labelKey);
      const english = translate("en", route.labelKey);

      docs.push({
        id: `page:${locale}:${route.path}`,
        title: label,
        description: translate(locale, `${route.labelKey}.blurb`, ""),
        url: locale === "en" ? `${base}${route.path}` : `${base}/te${route.path}`,
        section: route.section,
        language: locale,
        keywords: [label, english, ...teluguKeywords(english)].filter(Boolean),
        content: "",
        weight: WEIGHT.page,
      });
    }
  }
  return docs;
}

/**
 * Official resources.
 *
 * Emitted twice where a Telugu name exists — once per language — so that
 * typing "ఆధార్" and typing "aadhaar" both land on Aadhaar. The English doc
 * also carries the Telugu name as a keyword, which covers the mixed-script
 * queries people actually type.
 *
 * The `url` is the Reddivaripalli hub page, not the government site: search
 * results stay inside the site, and the hub is where the safety banner and
 * the provenance line live. Sending someone straight from a search box to an
 * external login page is exactly the pattern the scams imitate.
 */
function directoryDocs(): SearchDoc[] {
  const hubFor = new Map<string, string>();
  for (const hub of HUBS) {
    const path = hub.slug === "documents" ? "/government/documents/" : `/${hub.slug}/`;
    for (const group of hub.groups) {
      for (const id of group.ids ?? []) {
        if (!hubFor.has(id)) hubFor.set(id, path);
      }
    }
  }

  const docs: SearchDoc[] = [];
  for (const item of DIRECTORY) {
    const hubPath =
      hubFor.get(item.id) ??
      // /students/ and /farmers/ were retired in the 2026 redesign; their
      // citizen-service links live under /government/ now.
      (item.category === "banking" || item.category === "payments"
        ? "/banking/"
        : "/government/");

    const shared = {
      section: "government" as SectionId,
      keywords: [
        ...(item.keywords ?? []),
        item.officialDomain,
        item.department,
        item.name,
        ...(item.nameTe ? [item.nameTe] : []),
      ],
      source: item.source,
      lastVerified: item.lastVerified,
      weight: WEIGHT.official,
    };

    docs.push({
      id: `gov:en:${item.id}`,
      title: item.name,
      description: item.description,
      url: `${base}${hubPath}`,
      language: "en",
      content: clean(`${item.name} ${item.description} ${item.department}`),
      ...shared,
    });

    if (item.nameTe) {
      docs.push({
        id: `gov:te:${item.id}`,
        title: item.nameTe,
        description: item.descriptionTe ?? item.description,
        url: `${base}/te${hubPath}`,
        language: "te",
        content: clean(`${item.nameTe} ${item.descriptionTe ?? ""}`),
        ...shared,
      });
    }
  }

  for (const h of HELPLINES) {
    docs.push({
      id: `helpline:${h.id}`,
      title: `${h.number} — ${h.name}`,
      description: h.description,
      url: `${base}/emergency/`,
      section: "utility",
      language: "en",
      keywords: [h.number, h.name, h.nameTe ?? "", "emergency", "helpline", "అత్యవసరం"].filter(Boolean),
      content: clean(`${h.number} ${h.name} ${h.description}`),
      source: h.source,
      lastVerified: h.lastVerified,
      weight: WEIGHT.official,
    });
  }

  return docs;
}

/**
 * The children's library.
 *
 * Only published items are indexed. An item still waiting on permission or a
 * teacher's review has a page that says so, but putting it in search would
 * promise a reader something the page cannot deliver.
 */
/**
 * The children's library is gone (2026 redesign), so there is nothing to
 * index here. Kept as an empty producer rather than deleted so the document
 * pipeline in buildSearchIndex reads the same and the next content type has an
 * obvious place to slot in.
 */
function libraryDocs(): SearchDoc[] {
  return [];
}

function mediaDocs(): SearchDoc[] {
  return allMedia()
    .filter((item) => item.album.bucket !== "fun-trips")
    .map((item): SearchDoc => {
      const title = clean(item.title) || item.album.title;
      return {
        id: `media:${item.id}`,
        title,
        description: `${item.album.title} · ${item.album.year}`,
        url: `${base}${albumHref(item.album)}`,
        section: "media",
        language: "en",
        keywords: [
          ...(item.tags || []),
          item.album.title,
          item.album.year,
          item.album.bucket || "",
          ...teluguKeywords(`${title} ${item.album.title}`),
        ].filter(Boolean) as string[],
        // No `content`: for a photograph the title, album and tags are the
        // whole of the searchable text and they are already above. Repeating
        // them tripled the index for no extra recall.
        content: "",
        date: item.date,
        category: item.album.category,
        weight: WEIGHT.media,
        media: {
          file: item.file,
          thumb: item.thumb || item.file,
          poster: item.poster,
          type: item.type,
          width: item.width,
          height: item.height,
          blurDataURL: item.blurDataURL,
          album: item.album.title,
          albumSlug: item.album.slug,
          bucket: item.album.bucket,
          year: item.album.year,
        },
      };
    });
}

function communityDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const m of loadMembers()) {
    docs.push({
      id: `member:${m.id ?? m.name}`,
      title: m.name,
      description: clean(m.designation) || "Village member",
      url: `${base}/members/`,
      section: "community",
      language: "en",
      keywords: [m.designation, m.group, "member", "members"].filter(Boolean) as string[],
      content: clean(`${m.name} ${m.designation ?? ""} ${m.group ?? ""}`),
      weight: WEIGHT.member,
    });
  }

  for (const d of loadDirectorySeed()) {
    docs.push({
      id: `directory:${d.name}:${d.profession ?? ""}`,
      title: d.name,
      description: clean(
        `${d.profession ?? ""}${d.designation ? ` · ${d.designation}` : ""}`,
      ),
      url: `${base}/directory/`,
      section: "community",
      language: "en",
      keywords: [d.category, d.profession, d.designation, "directory"].filter(
        Boolean,
      ) as string[],
      content: clean(`${d.name} ${d.profession ?? ""} ${d.category ?? ""}`),
      category: d.category,
      weight: WEIGHT.directory,
    });
  }

  for (const e of loadEvents()) {
    docs.push({
      id: `event:${e.slug || e.title}:${e.date ?? ""}`,
      title: e.title,
      description: clean(e.description),
      url: `${base}${e.slug ? `/${e.slug}/` : "/events/"}`,
      section: "community",
      language: "en",
      keywords: [e.category, e.slug, "event", ...teluguKeywords(e.title)].filter(
        Boolean,
      ) as string[],
      content: clean(`${e.title} ${e.description ?? ""}`),
      date: e.date,
      category: e.category,
      weight: WEIGHT.event,
    });
  }

  for (const d of loadDevelopments()) {
    docs.push({
      id: `development:${d.title}`,
      title: d.title,
      description: clean(d.description, 200),
      url: `${base}/developments/`,
      section: "community",
      language: "en",
      keywords: [d.status, "development", "works"].filter(Boolean) as string[],
      content: clean(`${d.title} ${d.description ?? ""}`, 600),
      category: d.status,
      weight: WEIGHT.development,
    });
  }

  for (const d of loadPanchayatDocsSeed()) {
    docs.push({
      id: `document:${d.title}`,
      title: d.title,
      description: clean(d.description) || d.category,
      url: `${base}/documents/`,
      section: "community",
      language: "en",
      keywords: [d.category, "panchayat", "document"].filter(Boolean) as string[],
      content: clean(`${d.title} ${d.description ?? ""}`),
      date: d.date,
      category: d.category,
      weight: WEIGHT.document,
    });
  }

  for (const h of loadHeritageSeed()) {
    if (h.status && h.status !== "approved") continue;
    docs.push({
      id: `heritage:${h.title}`,
      title: h.title,
      description: clean(h.description),
      url: `${base}/heritage/`,
      section: "heritage",
      language: "en",
      keywords: [h.category, "heritage", ...teluguKeywords(h.title)].filter(
        Boolean,
      ) as string[],
      content: clean(`${h.title} ${h.description ?? ""}`, 600),
      date: h.date,
      category: h.category,
      weight: WEIGHT.heritage,
    });
  }

  const vh = loadVillageHeritage();
  const heritageSections: Array<{
    title: string;
    body: string;
    hash: string;
    tags: string[];
  }> = [
    { title: vh.title, body: vh.lede, hash: "", tags: ["Our Heritage", "History"] },
    {
      title: "Festivals of Reddivaripalli",
      body: vh.festivals.items.map((f) => f.name).join(", "),
      hash: "#festivals",
      tags: ["Festivals"],
    },
    {
      title: "Sacred Temples of Reddivaripalli",
      body: vh.temples.items.map((t) => t.name).join(", "),
      hash: "#temples",
      tags: ["Temples"],
    },
    {
      title: "In Loving Memory",
      body: [...(vh.memorial.legends || []), ...vh.memorial.foreverRemembered].join("; "),
      hash: "#memorial",
      tags: ["Memorial", "Legends"],
    },
    {
      title: "Farmers — The Backbone of Reddivaripalli",
      body: vh.farmers.names.join(", "),
      hash: "#farmers",
      tags: ["Farmers"],
    },
  ];
  for (const s of heritageSections) {
    docs.push({
      id: `heritage-page:${s.hash || "root"}`,
      title: s.title,
      description: clean(s.body, 200),
      url: `${base}/about/${s.hash}`,
      section: "heritage",
      language: "en",
      keywords: [...s.tags, ...teluguKeywords(s.title)],
      content: clean(s.body, 800),
      weight: WEIGHT.heritage,
    });
  }

  return docs;
}

/**
 * §15: one global search across documents, videos, courses, question papers,
 * scholarships, careers and agriculture.
 *
 * Published resources only — the same gate the pages use. An unreviewed
 * document must not be findable, and the search index is the one place where
 * that would otherwise leak: it is a public JSON file.
 *
 * `content` carries the extracted PDF text, because the brief asks for it to
 * be searchable and it is the difference between finding "the paper about
 * quadratic equations" and having to already know its title.
 */
function resourceDocs(): SearchDoc[] {
  let resources: Array<Record<string, unknown>> = [];
  let sources: Array<Record<string, unknown>> = [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "generated", "resources.json"), "utf8"),
    ) as { resources?: Array<Record<string, unknown>> };
    resources = Array.isArray(raw.resources) ? raw.resources : [];
  } catch {
    return [];
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(root, "content", "resources", "sources.json"), "utf8"),
    ) as { sources?: Array<Record<string, unknown>> };
    sources = Array.isArray(raw.sources) ? raw.sources : [];
  } catch {
    sources = [];
  }
  const sourceName = new Map(sources.map((x) => [String(x.id), String(x.name ?? x.id)]));

  const slugOf = (r: Record<string, unknown>) => {
    const title = String(r.title ?? "");
    const stem = title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const id = String(r.id ?? "");
    return `${stem || "resource"}-${id.split("-").pop() ?? ""}`;
  };

  const docs: SearchDoc[] = [];
  for (const r of resources) {
    if (r.status !== "published") continue;
    const title = String(r.title ?? "").trim();
    if (!title) continue;
    const keywords = [
      ...(Array.isArray(r.tags) ? r.tags.map(String) : []),
      String(r.exam ?? ""),
      String(r.subject ?? ""),
      String(r.classLevel ?? ""),
      String(r.category ?? ""),
      String(r.subcategory ?? ""),
      String(r.resourceType ?? ""),
      sourceName.get(String(r.sourceId)) ?? "",
      String(r.titleTe ?? ""),
    ].filter(Boolean);
    docs.push({
      id: `resource:${String(r.id)}`,
      title,
      description: String(r.description ?? "").slice(0, 300),
      url: `${base}/learn/resource/${slugOf(r)}/`,
      section: "dharma",
      language: r.language === "te" ? "te" : "en",
      keywords,
      content: [title, String(r.description ?? ""), String(r.textExcerpt ?? "")]
        .filter(Boolean)
        .join(" ")
        .slice(0, 4000),
      category: String(r.category ?? ""),
      weight: r.resourceType === "notification" ? 3 : 2,
    });
  }
  return docs;
}

/**
 * §24: one search across the curated knowledge library.
 *
 * These documents come from lib/dharma, which is written content compiled into
 * the bundle, so they are indexed whether or not the collector has ever run —
 * unlike resourceDocs below, which indexes what the collector found.
 *
 * Telugu names are indexed as keywords so a search in Telugu script finds the
 * page. That matters more here than anywhere else on the site: someone looking
 * for భగవద్గీత should not have to know to type "Bhagavad Gita".
 */
function dharmaDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  const push = (
    url: string,
    title: string,
    description: string,
    keywords: string[],
    content: string,
    weight = 2,
  ) => {
    docs.push({
      id: `dharma:${url}`,
      title,
      description: description.slice(0, 300),
      url: `${base}${url}`,
      section: "dharma",
      language: "en",
      keywords: keywords.filter(Boolean),
      content: content.slice(0, 4000),
      weight,
    });
  };

  for (const entry of [DHARMA_ABOUT, ...Object.values(DHARMA_PAGES), SRI_SRI_PAGE]) {
    const url =
      entry.slug === "sri-sri"
        ? "/telugu-culture/sri-sri/"
        : entry.slug === "about"
          ? "/dharma/"
          : `/dharma/${entry.slug}/`;
    push(
      url,
      entry.title,
      entry.summary,
      [entry.titleTe ?? "", ...(entry.divisions ?? []).flatMap((d) => [d.name, d.nameRoman, d.nameEnglish])],
      [entry.summary, ...entry.body, ...(entry.divisions ?? []).map((d) => `${d.nameRoman} ${d.intro}`)].join(" "),
      entry.slug === "gita" ? 3 : 2,
    );
  }

  // A page per Gita chapter, so a search for "Vishwarupa" lands on chapter 11
  // rather than on the chapter list.
  for (const d of GITA.divisions ?? []) {
    push(
      `/dharma/gita/${d.slug}/`,
      `Bhagavad Gita, Chapter ${d.slug} — ${d.nameRoman}`,
      d.intro,
      [d.name, d.nameRoman, d.nameEnglish, "Bhagavad Gita", "భగవద్గీత"],
      `${d.intro} ${(d.teachings ?? []).join(" ")}`,
    );
  }

  push(
    "/dharma/knowledge/",
    "Dharma & Spiritual Knowledge",
    "Dharma, karma, moksha, bhakti, jnana, seva, yoga, meditation, the guru lineage and the samskaras.",
    DHARMA_CONCEPTS.flatMap((c) => [c.name, c.nameRoman, c.nameEnglish]),
    DHARMA_CONCEPTS.map((c) => `${c.nameRoman} ${c.intro}`).join(" "),
  );

  push(
    "/telugu-culture/",
    "Telugu Culture",
    "The traditions, festivals, songs, sayings and literature of this language.",
    ["తెలుగు సంస్కృతి", "Telugu culture", "folk", "proverbs", "festivals"],
    "Telugu traditions festivals folk songs proverbs literature cultural history temple traditions customs",
  );

  for (const [view, title, te] of [
    ["literature", "Telugu Literature", "తెలుగు సాహిత్యం"],
    ["poetry", "Telugu Poetry", "తెలుగు కవిత్వం"],
    ["stories", "Telugu Stories", "తెలుగు కథలు"],
    ["spiritual", "Telugu Spiritual Literature", "తెలుగు ఆధ్యాత్మిక సాహిత్యం"],
  ] as const) {
    push(
      `/telugu-culture/${view}/`,
      title,
      `${title} — writers, works, and which of them are in the public domain.`,
      [te, ...AUTHORS.map((a) => a.name), ...AUTHORS.map((a) => a.nameTe)],
      AUTHORS.map((a) => `${a.name} ${a.nameTe} ${a.lived} ${a.known} ${a.works.join(" ")}`).join(" "),
    );
  }

  push(
    "/spiritual-heritage/",
    "Reddivaripalli Spiritual Heritage",
    "The Sri Ramalayam, the jatharas, the local bhajans and the elders' memories.",
    ["Sri Ramalayam", "శ్రీ రామాలయం", "jathara", "temple", "bhajan", "oral history"],
    "Sri Ramalayam temple history jatharas local devotional traditions bhajans festival videos photographs elders memories community contributions",
    3,
  );

  return docs;
}

export function buildSearchIndex(): SearchShard {
  const docs = [
    ...pageDocs(),
    ...directoryDocs(),
    ...libraryDocs(),
    ...dharmaDocs(),
    ...resourceDocs(),
    ...communityDocs(),
    ...mediaDocs(),
  ].filter((doc) =>
    isIndexable({ section: doc.section as SectionId, url: doc.url }),
  );

  // Stable order: highest weight first, then alphabetical. Keeps the JSON
  // diffable between builds instead of churning on loader iteration order.
  docs.sort(
    (a, b) => (b.weight ?? 1) - (a.weight ?? 1) || a.title.localeCompare(b.title),
  );

  return {
    section: "all",
    builtAt: new Date().toISOString().slice(0, 10),
    count: docs.length,
    docs,
  };
}
