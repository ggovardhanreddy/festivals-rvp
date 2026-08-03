import { notFound } from "next/navigation";
import {
  allMedia,
  albumsByBucket,
  findYearBucketAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import type { Metadata } from "next";
import {
  BUCKETS,
  FESTIVAL_HEROES,
  LANDING_BRAND_TAGLINES,
  OFFICIAL_MISSION,
  OFFICIAL_TITLE,
  SITE_NAME,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
  type BucketKey,
} from "@/lib/site";
import { withBase } from "@/lib/base";
import { loadMembers } from "@/lib/members";
import { pastEvents, upcomingEvents } from "@/lib/events";
import { loadDevelopments } from "@/lib/developments";
import { loadSuggestionsSeed } from "@/lib/suggestions";
import { YouthPortrait } from "@/components/YouthPortrait";
import { MembersPage } from "@/components/members/MembersPage";
import { EventsCalendar } from "@/components/events/EventsCalendar";
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
import { MemoryWall } from "@/components/MemoryWall";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
import { VillageStory } from "@/components/VillageStory";
import { YearGrid } from "@/components/YearGrid";
import { AnnualArchivePage } from "@/components/archive/AnnualArchivePage";
import { AppleBucketStage } from "@/components/home/AppleBucketStage";
import { HistoryTimeline } from "@/components/home/HistoryTimeline";
import { buildHistoryTimeline } from "@/lib/timeline";
import { ContactPage } from "@/components/contact/ContactPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { DevelopmentsPage } from "@/components/developments/DevelopmentsPage";
import { SuggestionsPage } from "@/components/suggestions/SuggestionsPage";
import { DirectoryPage } from "@/components/directory/DirectoryPage";
import { LostFoundPage } from "@/components/lost-found/LostFoundPage";
import { BloodDonorsPage } from "@/components/blood/BloodDonorsPage";
import { PanchayatDocsPage } from "@/components/documents/PanchayatDocsPage";
import { HeritagePage } from "@/components/heritage/HeritagePage";
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
  "fun-trips",
]);

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
    { slug: ["blood-donors"] },
    { slug: ["documents"] },
    { slug: ["heritage"] },
    { slug: ["chat"] },
    { slug: ["fun-trips"] },
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

  const pageTitles: Record<string, { title: string; description: string }> = {
    gallery: {
      title: "Gallery",
      description: `Festival and village photo gallery from ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    events: {
      title: "Events",
      description: `Upcoming festivals, birthdays, and gatherings in ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    members: {
      title: "Members",
      description: `RVP Youth members of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    about: {
      title: "About Village",
      description: `${OFFICIAL_TITLE} — ${OFFICIAL_MISSION}`,
    },
    years: {
      title: "Annual Archive",
      description: `Year-by-year archive of festivals, galleries, and memories from ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    search: {
      title: "Search",
      description: `Search members, festivals, media, documents, and village services in ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    contact: {
      title: "Contact",
      description: `Contact ${OFFICIAL_TITLE} · ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    directory: {
      title: "Village Directory",
      description: `Doctors, teachers, and government employees serving ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    "lost-found": {
      title: "Lost & Found",
      description: `Community lost and found notices for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    "blood-donors": {
      title: "Blood Donor Directory",
      description: `Voluntary blood donor directory for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    documents: {
      title: "Panchayat Documents",
      description: `Panchayat notices, minutes, and public forms for ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    heritage: {
      title: "Heritage Archive",
      description: `Historical photographs, temple history, and cultural memory of ${VILLAGE_ALSO_KNOWN_AS}.`,
    },
    admin: {
      title: "Admin Dashboard",
      description: `Administrator tools for ${SITE_NAME}.`,
    },
  };
  const page = slug[0] ? pageTitles[slug[0]] : undefined;
  if (page) {
    return {
      title: page.title,
      description: page.description,
      alternates: { canonical: `/${slug[0]}/` },
    };
  }
  return {};
}

function BucketPage({ bucket }: { bucket: BucketKey }) {
  const meta = BUCKETS.find((b) => b.key === bucket)!;
  const albums = albumsByBucket(bucket);
  const media = albums.flatMap((a) => a.media);
  const images = media.filter((m) => m.type === "image");
  const heroImage =
    FESTIVAL_HEROES[bucket] ||
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
              title="Photos coming soon"
              description={`Add photos under content/<YEAR>/${bucket}/ and rebuild.`}
              actionHref="/admin/"
              actionLabel="CMS guide"
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
  const media = allMedia();

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

  if (path === "blood-donors") {
    return (
      <main className="page">
        <BloodDonorsPage />
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
          title="Events"
          lede="Festivals, jatharas, and the next gatherings — with countdowns and archive."
          primaryHref="/gallery/"
          primaryLabel="Gallery"
          secondaryHref="/members/"
          secondaryLabel="Members"
          vantaEffect="halo"
        />
        <EventsCalendar
          upcoming={upcomingEvents(5)}
          archive={pastEvents()}
          liveSlugs={liveSlugs}
          members={loadMembers()}
        />
      </main>
    );
  }

  if (path === "gallery") {
    const albums = publicAlbums().filter((a) => (a.media?.length ?? 0) > 0);
    return (
      <main className="page">
        <MemoryHero
          eyebrow="Archive"
          title="Gallery"
          lede="Events, celebrations, historical photos, and year-wise collections."
          primaryHref="/events/"
          primaryLabel="Events"
          secondaryHref="/years/"
          secondaryLabel="Years"
          vantaEffect="fog"
        />
        <GalleryHub albums={albums} media={media} years={years()} />
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
            records, documents, doctors, teachers, and blood donors.
          </p>
        </div>
        <SearchClient items={media} />
      </main>
    );
  }

  if (path === "about") {
    return (
      <main className="page">
        <MemoryHero
          showLogo
          atmosphere
          eyebrow="About Village"
          title={OFFICIAL_TITLE}
          lede={OFFICIAL_MISSION}
          primaryHref="/years/"
          primaryLabel="Annual Archive"
          secondaryHref="/heritage/"
          secondaryLabel="Heritage"
        />
        <VillageStory />
        <Reveal className="section">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2>What this digital home holds</h2>
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              {SITE_TAGLINE}
            </p>
            {LANDING_BRAND_TAGLINES.map((line) => (
              <p key={line} className="muted" style={{ marginTop: "0.5rem" }}>
                {line}
              </p>
            ))}
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Annual archives, heritage photographs, temple history, festivals,
              members, developments, directory, and community services — curated
              so {VILLAGE_ALSO_KNOWN_AS} remains findable for the next decade.
              Stewards: {SITE_NAME}.
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              {VILLAGE_ADDRESS_LINE}
            </p>
            <p style={{ marginTop: "1rem" }}>
              <a className="btn" href={VILLAGE_MAPS_URL} target="_blank" rel="noreferrer">
                Open Ramalayam on Google Maps
              </a>
            </p>
            <PrivateNotice />
          </div>
        </Reveal>
        <Reveal className="section">
          <VillageDepthMap />
        </Reveal>
        <YouthPortrait />
        <MemoryWall items={media} />
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
