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
import { VillageDepthMap } from "@/components/VillageDepthMap";
import { FestivalIdolBanner } from "@/components/FestivalIdolBanner";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminHub } from "@/components/admin/AdminHub";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { MemoryHero } from "@/components/MemoryHero";
import { PageVanta } from "@/components/vanta/PageVanta";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
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
import { MembersChat } from "@/components/chat/MembersChat";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { FunFestAuthBar } from "@/components/auth/FunFestAuthBar";
import { InstagramFollow } from "@/components/festivals/InstagramFollow";
import { CULTURE_FESTIVALS } from "@/lib/festivals";
import { Suspense, type ReactNode } from "react";

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
    { slug: ["events"] },
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
      description: `Festival and village photo gallery from ${VILLAGE_ALSO_KNOWN_AS} — Vinayaka Chavithi, Sankranthi, temples, and community memories.`,
    },
    events: {
      title: "Events & Birthdays",
      description: `Upcoming festivals, birthdays, and gatherings in ${VILLAGE_ALSO_KNOWN_AS} Gram Panchayat, Sambepalle.`,
    },
    members: {
      title: "Members",
      description: `Meet RVP Youth Legacy, Core, and NextGen members of ${VILLAGE_ALSO_KNOWN_AS} Gram Panchayat.`,
    },
    about: {
      title: `About ${VILLAGE_ALSO_KNOWN_AS}`,
      description: `${VILLAGE_ALSO_KNOWN_AS} — One Village • One Family • One Heritage. Village history, agriculture, festivals, temples, and memorials.`,
    },
    years: {
      title: "Annual Archive",
      description: `Year-by-year archive of festivals, galleries, and memories from ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    search: {
      title: "Search",
      description: `Search members, festivals, media, documents, and village services in ${VILLAGE_ALSO_KNOWN_AS}.`,
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
      title: "Developments",
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
            <EmptyState
              title={
                bucket === "rvp-birthdays"
                  ? "Birthday gallery coming soon"
                  : "Photos coming soon"
              }
              description={
                bucket === "rvp-birthdays"
                  ? "Birthday albums will appear here as photos are added under content/<YEAR>/rvp-birthdays/."
                  : `Add photos under content/<YEAR>/${bucket}/ and rebuild.`
              }
              actionHref={bucket === "rvp-birthdays" ? "/events/?tab=birthdays" : "/admin/"}
              actionLabel={
                bucket === "rvp-birthdays" ? "View birthdays" : "CMS guide"
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

  if (path === "members") {
    const members = loadMembers();
    return (
      <main className="page page--members">
        <MemoryHero
          eyebrow="RVP Youth"
          title="Members"
          lede="Legacy Circle, Core Members, and Next Generation — the people of Reddivaripalli who keep our traditions and community spirit alive."
          primaryHref="/events/"
          primaryLabel="Events"
          secondaryHref="/gallery/"
          secondaryLabel="Gallery"
          fullBleed={false}
        />
        <MembersPage seed={members} />
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
          eyebrow="Archive"
          title="Gallery"
          lede="Festivals first — then year, then photos and videos from every celebration."
          primaryHref="/events/"
          primaryLabel="Events"
          secondaryHref="/years/"
          secondaryLabel="Years"
          vantaEffect="fog"
        />
        <GalleryHub albums={albums} />
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
            records, documents, doctors, and teachers.
          </p>
        </div>
        <SearchClient />
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
          title="Our Heritage"
          lede={`${VILLAGE_ALSO_KNOWN_AS} — founded around 1850 as Kondareddigaripalli by Sri G. Konda Reddy. A living record of history, agriculture, festivals, temples, and the people who shaped our home.`}
          primaryHref="/heritage/"
          primaryLabel="Heritage Archive"
          secondaryHref="/gallery/"
          secondaryLabel="Gallery"
        />
        <VillageHeritageStory />
        <Reveal className="section">
          <VillageDepthMap />
        </Reveal>
        <Reveal className="section">
          <PrivateNotice />
        </Reveal>
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
        <AdminHub />
      </main>
    );
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
