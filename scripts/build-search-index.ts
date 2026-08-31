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
import { isIndexable, type SearchDoc, type SearchShard } from "../lib/search/schema";
import { TRANSLITERATIONS } from "../lib/search/normalize";
import { translate } from "../lib/i18n";
import { DIRECTORY, HELPLINES, HUBS } from "../lib/directory";
import {
  loadRhymes,
  loadScienceTopics,
  loadStories,
  loadVideos,
} from "../lib/learning/server";
import { isPublished } from "../lib/learning";
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
      (item.category === "banking" || item.category === "payments"
        ? "/banking/"
        : item.category === "students"
          ? "/students/"
          : item.category === "farmers"
            ? "/farmers/"
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
function libraryDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  const add = (
    items: Array<{
      id: string;
      slug: string;
      title: { en: string; te?: string };
      description: { en: string; te?: string };
      status?: string;
      language?: string[];
      keywords?: string[];
    }>,
    section: SectionId,
    prefix: string,
  ) => {
    for (const item of items) {
      if (!isPublished(item as { status?: undefined })) continue;
      docs.push({
        id: `${prefix}:${item.id}`,
        title: item.title.en,
        description: item.description.en,
        url: `${base}/kids/${prefix}/${item.slug}/`,
        section,
        language: "en",
        keywords: [...(item.keywords ?? []), item.title.te ?? ""].filter(Boolean),
        content: clean(`${item.title.en} ${item.description.en}`),
        weight: WEIGHT.page,
      });
      if (item.title.te) {
        docs.push({
          id: `${prefix}:te:${item.id}`,
          title: item.title.te,
          description: item.description.te ?? item.description.en,
          url: `${base}/kids/${prefix}/${item.slug}/`,
          section,
          language: "te",
          keywords: [item.title.en],
          content: clean(item.title.te),
          weight: WEIGHT.page,
        });
      }
    }
  };

  add(loadStories(), "kids", "stories");
  add(loadRhymes(), "kids", "rhymes");
  add(loadScienceTopics(), "kids", "science");
  add(loadVideos(), "kids", "videos");
  return docs;
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
      section: "learn",
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

export function buildSearchIndex(): SearchShard {
  const docs = [
    ...pageDocs(),
    ...directoryDocs(),
    ...libraryDocs(),
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
