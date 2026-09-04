import { notFound } from "next/navigation";
import {
  albumsByBucket,
  findYearBucketAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import type { Album, Media } from "@/lib/types";
import type { Metadata } from "next";
import {
  BUCKETS,
  FESTIVAL_HEROES,
  OFFICIAL_TITLE,
  SITE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
  type BucketKey,
} from "@/lib/site";
import { withBase } from "@/lib/base";
import { loadMembers } from "@/lib/members";
import { pastEvents, upcomingEvents } from "@/lib/events";
import { loadDevelopments } from "@/lib/developments";
import { loadSuggestionsSeed } from "@/lib/suggestions";
import { MembersPage } from "@/components/members/MembersPage";
import { EventsBirthdaysHub } from "@/components/events/EventsBirthdaysHub";
import { GalleryHub } from "@/components/gallery/GalleryHub";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminHub } from "@/components/admin/AdminHub";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { FestivalIdolBanner } from "@/components/FestivalIdolBanner";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { MemoryHero } from "@/components/MemoryHero";
import { PageVanta } from "@/components/vanta/PageVanta";
import { Reveal } from "@/components/Reveal";
import { SearchPage } from "@/components/search/SearchPage";
import { YearGrid } from "@/components/YearGrid";
import { AnnualArchivePage } from "@/components/archive/AnnualArchivePage";
import { AppleBucketStage } from "@/components/home/AppleBucketStage";
import { HistoryTimeline } from "@/components/home/HistoryTimeline";
import { buildHistoryTimeline } from "@/lib/timeline";
import { ContactPage } from "@/components/contact/ContactPage";
import { PrivacyPage, TermsPage } from "@/components/legal/LegalPages";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { DevelopmentsPage } from "@/components/developments/DevelopmentsPage";
import { SuggestionsPage } from "@/components/suggestions/SuggestionsPage";
import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { LostFoundPage } from "@/components/lost-found/LostFoundPage";
import { PanchayatDocsPage } from "@/components/documents/PanchayatDocsPage";
import { HeritagePage } from "@/components/heritage/HeritagePage";
import { VillageHeritageStory } from "@/components/heritage/VillageHeritageStory";
import { TemplesFestivalsPage } from "@/components/temples/TemplesFestivalsPage";
import { StoriesPage } from "@/components/stories/StoriesPage";
import { FamiliesHub } from "@/components/families/FamiliesHub";
import { FamilyTreePage } from "@/components/families/FamilyTreePage";
import { PersonProfile } from "@/components/families/PersonProfile";
import { AdapaduchuluPage } from "@/components/families/AdapaduchuluPage";
import {
  allPeople,
  findPerson,
} from "@/lib/family-trees";
import {
  findVillageFamily,
  loadVillageFamilies,
} from "@/lib/families/catalog";
import { loadDirectorySeed } from "@/lib/community";
import { MembersChat } from "@/components/chat/MembersChat";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { FunFestAuthBar } from "@/components/auth/FunFestAuthBar";
import { InstagramFollow } from "@/components/festivals/InstagramFollow";
import { CULTURE_FESTIVALS } from "@/lib/festivals";
import { Suspense, type ReactNode } from "react";
import { WeatherPage } from "@/components/weather/WeatherPage";
import { DirectoryHub } from "@/components/directory/DirectoryHub";
import { SafetyPage } from "@/components/safety/SafetyPage";
import { HUBS, hubBySlug } from "@/lib/directory";
import {
  loadCollectorNotifications,
  loadCollectorRuns,
  loadResourceCatalog,
  loadResourceSources,
} from "@/lib/resources/server";
import { FestivalCalendar } from "@/components/home/FestivalCalendar";
import { VillageUpdatesList } from "@/components/events/VillageUpdatesList";
import { loadAnnouncements, loadEvents } from "@/lib/events";

const BUCKET_ACCENT: Record<
  BucketKey,
  "default" | "sankranthi" | "vinayaka" | "birthday" | "trips"
> = {
  sankranthi: "sankranthi",
  "vinayaka-chavithi": "vinayaka",
  "mathamma-jathara": "default",
  "devapatlamma-jathara": "default",
  "sri-rama-navami": "default",
  "varalakshmi-vratam": "default",
  ugadi: "sankranthi",
  deepavali: "default",
  dasara: "default",
  "rvp-birthdays": "birthday",
  "fun-trips": "trips",
};

const BUCKET_ROUTES: BucketKey[] = [
  ...CULTURE_FESTIVALS.map((f) => f.key as BucketKey),
  "rvp-birthdays",
  "fun-trips",
];

const HERO_ONLY_BUCKETS = new Set<string>([
  ...CULTURE_FESTIVALS.map((f) => f.key),
  "rvp-birthdays",
  "fun-trips",
]);

/** Drop heavy hashes / originals from gallery SSR payload. */
function slimAlbumForClient(album: Album): Album {
  return {
    ...album,
    media: (album.media || []).map(
      (m): Media => ({
        id: m.id,
        file: m.file,
        thumb: m.thumb,
        poster: m.poster,
        type: m.type,
        title: m.title,
        date: m.date,
        tags: m.tags,
        width: m.width,
        height: m.height,
        blurDataURL: m.blurDataURL,
        fileAvif: m.fileAvif,
        visibility: m.visibility,
        watermark: m.watermark,
      }),
    ),
  };
}

export function generateStaticParams() {
  const paths: { slug: string[] }[] = [
    { slug: ["search"] },
    { slug: ["about"] },
    { slug: ["years"] },
    { slug: ["admin"] },
    { slug: ["offline"] },
    { slug: ["members"] },
    { slug: ["people"] },
    { slug: ["families"] },
    { slug: ["adapaduchulu"] },
    { slug: ["events"] },
    { slug: ["temples"] },
    { slug: ["stories"] },
    { slug: ["gallery"] },
    { slug: ["timeline"] },
    { slug: ["contact"] },
    { slug: ["login"] },
    { slug: ["settings"] },
    { slug: ["developments"] },
    { slug: ["suggestions"] },
    { slug: ["directory"] },
    { slug: ["lost-found"] },
    { slug: ["documents"] },
    { slug: ["heritage"] },
    { slug: ["chat"] },
    { slug: ["rvp-birthdays"] },
    { slug: ["fun-trips"] },
    { slug: ["privacy"] },
    { slug: ["terms"] },
  ];

  for (const family of loadVillageFamilies()) {
    paths.push({ slug: ["families", family.slug] });
  }
  for (const person of allPeople()) {
    const family = findVillageFamily(person.familyId);
    if (family) {
      paths.push({ slug: ["families", family.slug, person.id] });
    }
  }

  // Weather and cyber-safety remain live utility pages.
  for (const seg of ["weather", "safety"]) {
    paths.push({ slug: [seg] });
  }

  // Official resource hubs: /government/, /banking/
  // and the documents hub, which lives under /government/ so it cannot
  // collide with the existing Panchayat /documents/ page.
  for (const hub of HUBS) {
    paths.push(hub.slug === "documents" ? { slug: ["government", "documents"] } : { slug: [hub.slug] });
  }

  const published = publicAlbums().filter((a) => (a.media?.length ?? 0) > 0);
  const bucketsWithContent = new Set(published.map((a) => a.bucket));

  for (const bucket of BUCKET_ROUTES) {
    // Publish culture festivals even before album photos exist (hero pages)
    if (!bucketsWithContent.has(bucket) && !HERO_ONLY_BUCKETS.has(bucket)) {
      continue;
    }
    if (!paths.some((p) => p.slug.length === 1 && p.slug[0] === bucket)) {
      paths.push({ slug: [bucket] });
    }
    const yearsForBucket = [
      ...new Set(published.filter((a) => a.bucket === bucket).map((a) => a.year)),
    ];
    for (const year of yearsForBucket) {
      paths.push({ slug: [bucket, year] });
    }
  }

  for (const year of years()) {
    paths.push({ slug: ["years", year] });
  }

  for (const album of published) {
    if (album.bucket === "rvp-birthdays") {
      paths.push({ slug: ["rvp-birthdays", album.year, album.slug] });
    }
  }

  return paths;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bucketKey = slug[0] as BucketKey | undefined;
  const bucketMeta = bucketKey
    ? BUCKETS.find((b) => b.key === bucketKey)
    : undefined;

  if (bucketMeta && BUCKET_ROUTES.includes(bucketKey!)) {
    const year = slug[1];
    const title = year ? `${bucketMeta.title} ${year}` : bucketMeta.title;
    const description = `${bucketMeta.blurb} ${bucketMeta.story} — ${VILLAGE_ALSO_KNOWN_AS} (${VILLAGE_NAME}).`;
    const hero =
      FESTIVAL_HEROES[bucketKey!] || "/logo/social-banner.png";
    const path = `/${slug.join("/")}/`;
    return {
      title,
      description,
      keywords: [
        bucketMeta.title,
        year,
        VILLAGE_ALSO_KNOWN_AS,
        VILLAGE_NAME,
        SITE_NAME,
        "festival",
        bucketMeta.eyebrow,
      ].filter(Boolean) as string[],
      alternates: { canonical: path },
      openGraph: {
        title: `${title} | ${VILLAGE_ALSO_KNOWN_AS}`,
        description,
        url: path,
        images: [
          {
            url: withBase(hero),
            alt: `${bucketMeta.title} — ${SITE_NAME}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | ${VILLAGE_ALSO_KNOWN_AS}`,
        description,
        images: [withBase(hero)],
      },
    };
  }

  const pageTitles: Record<
    string,
    { title: string; description: string; noindex?: boolean }
  > = {
    gallery: {
      title: "Gallery",
      description: `Photographs of ${VILLAGE_ALSO_KNOWN_AS} — village life, temples, festivals, people, old photos and development.`,
    },
    about: {
      title: `Our Village — ${VILLAGE_ALSO_KNOWN_AS}`,
      description: `${VILLAGE_ALSO_KNOWN_AS} — Our Village. Our Heritage. Our Home. History, origin, map, agriculture and important places.`,
    },
    temples: {
      title: "Temples & Festivals",
      description: `Temples, jatharas and village festivals of ${VILLAGE_ALSO_KNOWN_AS} — Sri Ramalayam, Mathamma, Devapatlamma, Sankranti, Ugadi and more.`,
    },
    stories: {
      title: "Village Stories & Memories",
      description: `Stories from elders, old village memories and traditional practices of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    events: {
      title: "Events & Birthdays",
      description: `Upcoming festivals, birthdays, and gatherings in ${VILLAGE_ALSO_KNOWN_AS} Gram Panchayat, Sambepalle.`,
    },
    members: {
      title: "Our People",
      description: `Our Elders, families, professionals and village contributors of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    people: {
      title: "Our People",
      description: `Our Elders, families, professionals and village contributors of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    families: {
      title: "Village Families",
      description: `Village families of ${VILLAGE_ALSO_KNOWN_AS} — parents, children, spouses and Adapaduchulu across generations.`,
    },
    adapaduchulu: {
      title: "Adapaduchulu",
      description: `Married daughters of ${VILLAGE_ALSO_KNOWN_AS} families, remaining connected to their parental family.`,
    },
    years: {
      title: "Annual Archive",
      description: `Year-by-year archive of festivals, galleries, and memories from ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    search: {
      title: "Search",
      description: `Search members, festivals, media, documents, and government services in ${VILLAGE_ALSO_KNOWN_AS}.`,
      noindex: true,
    },
    contact: {
      title: "Contact",
      description: `Contact ${OFFICIAL_TITLE} · ${VILLAGE_ALSO_KNOWN_AS}, Sambepalle, YSR Kadapa.`,
    },
    directory: {
      title: "Village Directory",
      description: `Doctors, teachers, and government employees serving ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    "lost-found": {
      title: "Lost & Found",
      description: `Community lost and found notices for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    documents: {
      title: "Panchayat Documents",
      description: `Panchayat notices, minutes, and public forms for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    heritage: {
      title: "Heritage Archive",
      description: `Historical photographs, temple history, and cultural memory of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    developments: {
      title: "Development",
      description: `Village development projects, infrastructure updates, and community works in ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    suggestions: {
      title: "Suggestions",
      description: `Share ideas and feedback for ${VILLAGE_ALSO_KNOWN_AS} Gram Panchayat and RVP Youth.`,
    },
    timeline: {
      title: "Village Timeline",
      description: `History timeline of ${VILLAGE_ALSO_KNOWN_AS} — origins, milestones, and community memory.`,
    },
    "rvp-birthdays": {
      title: "RVP Birthdays",
      description: `Birthday celebrations and photo memories from RVP Youth in ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    admin: {
      title: "Admin Dashboard",
      description: `Administrator tools for ${SITE_NAME}.`,
      noindex: true,
    },
    login: {
      title: "Login",
      description: `Secure sign-in for ${SITE_NAME} administrators.`,
      noindex: true,
    },
    settings: {
      title: "Settings",
      description: `Site preferences for ${SITE_NAME}.`,
      noindex: true,
    },
    privacy: {
      title: "Privacy Policy",
      description: `How ${SITE_NAME} handles member photos, birthdays, analytics, and contact data for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    terms: {
      title: "Terms of Use",
      description: `Terms for using the ${VILLAGE_ALSO_KNOWN_AS} community website stewarded by ${SITE_NAME}.`,
    },
  };

  if (slug[0] === "families" && slug[1]) {
    const family = findVillageFamily(slug[1]);
    if (family) {
      const person = slug[2] ? findPerson(slug[2]) : undefined;
      const title = person?.fullName ?? family.name;
      const description = person
        ? `${person.fullName} of ${family.name}, ${VILLAGE_ALSO_KNOWN_AS}.`
        : `Family tree of ${family.name} in ${VILLAGE_ALSO_KNOWN_AS}.`;
      const nestedPath = `/${slug.join("/")}/`;
      return {
        title,
        description,
        alternates: { canonical: nestedPath },
        openGraph: {
          title: `${title} | ${VILLAGE_ALSO_KNOWN_AS}`,
          description,
          url: nestedPath,
        },
      };
    }
  }

  const page = slug[0] ? pageTitles[slug[0]] : undefined;
  if (page) {
    const path = `/${slug[0]}/`;
    const socialTitle = `${page.title} | ${VILLAGE_ALSO_KNOWN_AS}`;
    return {
      title: page.title,
      description: page.description,
      alternates: { canonical: path },
      robots: page.noindex
        ? { index: false, follow: false, googleBot: { index: false, follow: false } }
        : { index: true, follow: true },
      openGraph: {
        title: socialTitle,
        description: page.description,
        url: path,
        images: [
          {
            url: withBase("/logo/social-banner.png"),
            alt: `${page.title} — ${VILLAGE_ALSO_KNOWN_AS}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: socialTitle,
        description: page.description,
        images: [withBase("/logo/social-banner.png")],
      },
    };
  }
  return {};
}

function BucketPage({ bucket }: { bucket: BucketKey }) {
  const meta = BUCKETS.find((b) => b.key === bucket)!;
  const albums = albumsByBucket(bucket);
  const media = albums.flatMap((a) => a.media);
  const images = media.filter((m) => m.type === "image");
  // Fun Fest: prefer real album covers (signed after login) over the locked brand plate
  const heroImage =
    bucket === "fun-trips"
      ? albums.find((a) => a.cover)?.cover ||
        images[0]?.thumb ||
        images[0]?.file ||
        FESTIVAL_HEROES[bucket]
      : FESTIVAL_HEROES[bucket] ||
        albums.find((a) => a.cover)?.cover ||
        images[0]?.file;
  if (!albums.length && !heroImage && !HERO_ONLY_BUCKETS.has(bucket)) {
    notFound();
  }

  const page = (
    <main className="experience-page experience-page--apple">
      {bucket === "fun-trips" ? <FunFestAuthBar /> : null}
      <AppleBucketStage
        bucket={bucket}
        title={bucket === "fun-trips" ? "Fun Fest" : meta.title}
        eyebrow={meta.eyebrow}
        blurb={meta.blurb}
        story={meta.story}
        albums={albums}
        heroImage={heroImage || FESTIVAL_HEROES["fun-trips"]}
      />

      {bucket === "vinayaka-chavithi" && (
        <div className="page apple-rest">
          <FestivalIdolBanner lede={meta.story} />
        </div>
      )}

      {bucket === "devapatlamma-jathara" ? (
        <div className="page apple-rest">
          <Reveal className="section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Devapatlamma Temple</p>
                <h2>Stay connected</h2>
                <p className="lede">
                  Follow the official Devapatlamma Temple Instagram for temple
                  updates and Jathara moments.
                </p>
              </div>
            </div>
            <InstagramFollow />
          </Reveal>
        </div>
      ) : null}

      <div className="page apple-rest">
        {images.length ? (
          <Reveal className="section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Village Scene</p>
                <h2>Step into this chapter</h2>
              </div>
            </div>
            <InteractiveVillageMap
              accent={BUCKET_ACCENT[bucket]}
              slides={images.slice(0, 18)}
            />
          </Reveal>
        ) : null}

        {!albums.length && (
          <Reveal className="section">
            {/* This is what a villager sees on a festival page with no album
                yet. It used to read "Add photos under content/<YEAR>/dasara/
                and rebuild" with a button to /admin/ — a build instruction and
                a staff link, shown to the public. */}
            <EmptyState
              eyebrow="Archive"
              title={
                bucket === "rvp-birthdays"
                  ? "No birthday albums yet"
                  : "No photographs yet"
              }
              description={
                bucket === "rvp-birthdays"
                  ? "Birthday albums appear here as families share their photographs with the village archive."
                  : `Photographs from ${meta.title} will appear here once they are added to the village archive.`
              }
              actionHref={bucket === "rvp-birthdays" ? "/events/?tab=birthdays" : "/gallery/"}
              actionLabel={
                bucket === "rvp-birthdays" ? "View birthdays" : "Browse the gallery"
              }
            />
          </Reveal>
        )}

        {media.length > 10 && (
          <Reveal className="section" id="full-gallery">
            <div className="section-head">
              <div>
                <p className="eyebrow">Full gallery</p>
                <h2>Every frame</h2>
              </div>
            </div>
            <Gallery items={media} />
          </Reveal>
        )}
      </div>
    </main>
  );

  if (bucket === "fun-trips") {
    return <RequireAuth>{page}</RequireAuth>;
  }

  return page;
}

export default async function ArchiveRoute({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");

  if (BUCKET_ROUTES.includes(slug[0] as BucketKey) && slug.length === 1) {
    return <BucketPage bucket={slug[0] as BucketKey} />;
  }

  if (BUCKET_ROUTES.includes(slug[0] as BucketKey) && slug.length === 2) {
    const bucket = slug[0] as BucketKey;
    const year = slug[1]!;
    const album = findYearBucketAlbum(bucket, year);
    const gate = (node: ReactNode) =>
      bucket === "fun-trips" ? <RequireAuth>{node}</RequireAuth> : <>{node}</>;

    if (!album) {
      const matches = albumsByBucket(bucket).filter((a) => a.year === year);
      if (!matches.length) notFound();
      return gate(
        <main className="page">
          {bucket === "fun-trips" ? <FunFestAuthBar /> : null}
          <MemoryHero
            eyebrow={`${bucket === "fun-trips" ? "Fun Fest" : bucket} · ${year}`}
            title={year}
            lede="Memories from this year."
            primaryHref={`/${bucket}/`}
            primaryLabel="Back"
          />
          <div className="grid-cards section">
            {matches.map((item, index) => (
              <AlbumCard key={`${item.year}-${item.slug}`} album={item} index={index} />
            ))}
          </div>
          <Gallery items={matches.flatMap((a) => a.media)} />
        </main>,
      );
    }
    return gate(
      <>
        {bucket === "fun-trips" ? <FunFestAuthBar /> : null}
        <AlbumView album={album} />
      </>,
    );
  }

  if (slug[0] === "rvp-birthdays" && slug.length === 3) {
    const album = publicAlbums().find(
      (a) => a.bucket === "rvp-birthdays" && a.year === slug[1] && a.slug === slug[2],
    );
    if (!album) notFound();
    return <AlbumView album={album} />;
  }

  if (path === "timeline") {
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Timeline"
          title="Our history"
          lede="Walk through the years that shaped Kondreddigaripalli."
          primaryHref="/years/"
          primaryLabel="All years"
          secondaryHref="/gallery/"
          secondaryLabel="Gallery"
        />
        <HistoryTimeline entries={buildHistoryTimeline(24)} />
      </main>
    );
  }

  if (path === "members" || path === "people") {
    const members = loadMembers();
    return (
      <main className="page page--members">
        <MemoryHero
          eyebrow="Our People"
          title="Our People"
          lede="Our Elders, our families, and the neighbours who keep Reddivaripalli’s traditions and community spirit alive. Private contact details are not shown."
          primaryHref="/stories/"
          primaryLabel="Village stories"
          secondaryHref="/gallery/"
          secondaryLabel="Gallery"
          fullBleed={false}
        />
        <MembersPage seed={members} directory={loadDirectorySeed()} />
      </main>
    );
  }

  if (slug[0] === "families") {
    if (slug.length === 1) {
      return (
        <main className="page">
          <MemoryHero
            eyebrow="Our People"
            title="Village Families"
            lede="Families of Reddivaripalli — parents, children, spouses and Adapaduchulu. Missing names are not invented. Family order is maintained by the village administrator."
            primaryHref="/adapaduchulu/"
            primaryLabel="Adapaduchulu"
            secondaryHref="/people/"
            secondaryLabel="Our People"
            fullBleed={false}
          />
          <FamiliesHub />
        </main>
      );
    }
    const family = findVillageFamily(slug[1]!);
    if (!family) notFound();
    if (slug.length === 2) {
      return (
        <main className="page page--family-tree">
          <FamilyTreePage familyId={family.id} />
        </main>
      );
    }
    const person = findPerson(slug[2]!);
    if (!person || person.familyId !== family.id) notFound();
    return (
      <main className="page">
        <PersonProfile personId={person.id} />
      </main>
    );
  }

  if (path === "adapaduchulu") {
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Our People"
          title="Adapaduchulu"
          lede="Married daughters of Reddivaripalli families. Each remains a member of her original parental family."
          primaryHref="/families/"
          primaryLabel="Village Families"
          secondaryHref="/people/"
          secondaryLabel="Our People"
          fullBleed={false}
        />
        <AdapaduchuluPage />
      </main>
    );
  }

  if (path === "chat") {
    return (
      <main className="page">
        <MembersChat />
      </main>
    );
  }

  if (path === "developments") {
    return (
      <main className="page page--vanta">
        <PageVanta effect="topology" />
        <DevelopmentsPage developments={loadDevelopments()} />
      </main>
    );
  }

  if (path === "suggestions") {
    return (
      <main className="page page--vanta">
        <PageVanta effect="clouds2" />
        <Suspense
          fallback={
            <div className="suggestions-page">
              <p className="muted">Loading suggestions…</p>
            </div>
          }
        >
          <SuggestionsPage seed={loadSuggestionsSeed()} />
        </Suspense>
      </main>
    );
  }

  if (path === "directory") {
    return (
      <main className="page">
        <DirectoryPage />
      </main>
    );
  }

  if (path === "lost-found") {
    return (
      <main className="page">
        <LostFoundPage />
      </main>
    );
  }

  if (path === "documents") {
    return (
      <main className="page">
        <PanchayatDocsPage />
      </main>
    );
  }

  if (path === "heritage") {
    return (
      <main className="page">
        <HeritagePage />
      </main>
    );
  }

  if (path === "contact") {
    return (
      <main className="page page--vanta">
        <PageVanta effect="halo" />
        <ContactPage />
      </main>
    );
  }

  if (path === "settings") {
    return (
      <main className="page">
        <SettingsPage />
      </main>
    );
  }

  if (path === "login") {
    return (
      <main className="page page--login">
        <Suspense
          fallback={
            <div className="auth-gate">
              <p className="muted">Loading Fun Fest sign in…</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    );
  }

  if (path === "events") {
    const liveSlugs = [
      ...new Set(
        publicAlbums()
          .filter((a) => (a.media?.length ?? 0) > 0)
          .map((a) => a.bucket)
          .filter(Boolean),
      ),
    ] as string[];
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Village calendar"
          title="Events & Birthdays"
          lede="Festivals, jatharas, and birthday celebrations — with a Telugu panchangam calendar (Tithi, Nakshatra, Rahu Kalam, Yama Gandam)."
          primaryHref="/gallery/"
          primaryLabel="Gallery"
          secondaryHref="/rvp-birthdays/"
          secondaryLabel="Birthday gallery"
          vantaEffect="halo"
        />
        <EventsBirthdaysHub
          upcoming={upcomingEvents(5)}
          archive={pastEvents()}
          liveSlugs={liveSlugs}
          members={loadMembers()}
        />
        {/* Moved off the homepage: the full annual festival calendar and the
            announcement archive now live with the rest of the calendar. */}
        <FestivalCalendar
          festivals={loadEvents().filter((e) => e.category === "festival")}
          liveSlugs={liveSlugs}
        />
        <VillageUpdatesList announcements={loadAnnouncements()} />
      </main>
    );
  }

  if (path === "gallery") {
    const albums = publicAlbums()
      .filter((a) => a.bucket !== "fun-trips" && (a.media?.length ?? 0) > 0)
      .map(slimAlbumForClient);
    return (
      <main className="page">
        <MemoryHero
          eyebrow="One archive"
          title="Gallery"
          lede="Village, temples, festivals, people, old photographs, village life, development and nature — one gallery for Reddivaripalli."
          primaryHref="/temples/"
          primaryLabel="Temples & Festivals"
          secondaryHref="/stories/"
          secondaryLabel="Stories"
          vantaEffect="fog"
        />
        <GalleryHub albums={albums} developments={loadDevelopments()} />
      </main>
    );
  }

  if (path === "search") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">{OFFICIAL_TITLE}</p>
          <h1>Search the village</h1>
          <p className="lede">
            Find members, festivals, photos, videos, developments, temple
            records, documents, doctors, and teachers — in English or Telugu.
          </p>
        </div>
        <div className="section">
          <Suspense fallback={<p className="muted">Loading search…</p>}>
            <SearchPage />
          </Suspense>
        </div>
      </main>
    );
  }

  if (path === "privacy") {
    return <PrivacyPage />;
  }

  if (path === "terms") {
    return <TermsPage />;
  }

  if (path === "about") {
    return (
      <main className="page">
        <MemoryHero
          showLogo
          atmosphere
          eyebrow="Reddivaripalli"
          title="Our Village"
          lede={`${VILLAGE_ALSO_KNOWN_AS} — founded around 1850 as Kondareddigaripalli by Sri G. Konda Reddy. History, origin, map, agriculture and the places that make this home.`}
          primaryHref="/about/#history"
          primaryLabel="Read the history"
          secondaryHref="/gallery/"
          secondaryLabel="Gallery"
        />
        <VillageHeritageStory />
      </main>
    );
  }

  if (path === "temples") {
    const liveSlugs = [
      ...new Set(
        publicAlbums()
          .filter((a) => (a.media?.length ?? 0) > 0)
          .map((a) => a.bucket)
          .filter(Boolean),
      ),
    ] as string[];
    return (
      <main className="page">
        <MemoryHero
          atmosphere
          eyebrow="Faith of the village"
          title="Temples & Festivals"
          lede={`The temples, jatharas and festivals of ${VILLAGE_ALSO_KNOWN_AS} — celebrated together, remembered in photographs, and kept for the next generation.`}
          primaryHref="/gallery/"
          primaryLabel="Gallery"
          secondaryHref="/about/"
          secondaryLabel="Our Village"
        />
        <TemplesFestivalsPage
          upcoming={upcomingEvents(8)}
          liveSlugs={liveSlugs}
          festivals={loadEvents().filter((e) => e.category === "festival")}
        />
      </main>
    );
  }

  if (path === "stories") {
    return (
      <main className="page">
        <MemoryHero
          atmosphere
          eyebrow="Remembered together"
          title="Village Stories & Memories"
          lede="Stories from elders, old village memories, traditional practices, and the people who grew up in Reddivaripalli."
          primaryHref="/gallery/"
          primaryLabel="Gallery"
          secondaryHref="/people/"
          secondaryLabel="Our People"
        />
        <StoriesPage />
      </main>
    );
  }

  if (path === "years") {
    const published = publicAlbums().filter((a) => (a.media?.length ?? 0) > 0);
    const chapters = years().map((year) => {
      const yearAlbums = published.filter((a) => a.year === year);
      return {
        year,
        albums: yearAlbums,
        mediaCount: yearAlbums.reduce((n, a) => n + (a.media?.length ?? 0), 0),
      };
    });
    const counts = Object.fromEntries(
      chapters.map((c) => [
        c.year,
        { albums: c.albums.length, media: c.mediaCount },
      ]),
    );
    return (
      <main className="page">
        <AnnualArchivePage chapters={chapters} />
        <div className="section">
          <h2>Quick year grid</h2>
          <YearGrid years={years()} counts={counts} />
        </div>
      </main>
    );
  }

  if (slug[0] === "years" && slug.length === 2) {
    const year = slug[1]!;
    const matches = publicAlbums().filter((album) => album.year === year);
    if (!matches.length) notFound();
    return (
      <main className="page">
        <MemoryHero
          eyebrow={`Annual Archive · ${year}`}
          title={year}
          lede={`Festivals, galleries, and memories gathered in ${year} — part of the ${VILLAGE_ALSO_KNOWN_AS} record.`}
          primaryHref="/years/"
          primaryLabel="All years"
          secondaryHref="/heritage/"
          secondaryLabel="Heritage"
        />
        <div className="grid-cards section">
          {matches.map((album, index) => (
            <AlbumCard key={`${album.year}-${album.slug}`} album={album} index={index} />
          ))}
        </div>
        <Gallery items={matches.flatMap((album) => album.media)} />
      </main>
    );
  }

  if (path === "admin") {
    return (
      <main className="page">
        <AdminHub
          collector={{
            resources: loadResourceCatalog(),
            sources: loadResourceSources(),
            runs: loadCollectorRuns(),
            notifications: loadCollectorNotifications(),
          }}
        />
      </main>
    );
  }

  if (path === "government/documents") {
    return <DirectoryHub hub={hubBySlug("documents")!} />;
  }

  {
    const hub = slug.length === 1 ? hubBySlug(path) : undefined;
    if (hub && hub.slug !== "documents") {
      return <DirectoryHub hub={hub} />;
    }
  }

  if (path === "safety") {
    return <SafetyPage />;
  }

  if (path === "weather") {
    // Only a configured provider produces a forecast. No key, no numbers.
    return <WeatherPage provider={process.env.NEXT_PUBLIC_WEATHER_PROVIDER || null} />;
  }

  if (path === "offline") {
    return (
      <main className="page">
        <h1>You’re offline</h1>
        <p className="lede">Reconnect to browse memories that are not cached yet.</p>
      </main>
    );
  }

  notFound();
}
