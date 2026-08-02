import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allMedia,
  albumsByBucket,
  findYearBucketAlbum,
  publicAlbums,
  years,
} from "@/lib/content";
import {
  BUCKETS,
  FESTIVAL_HEROES,
  LANDING_BRAND_TAGLINES,
  SITE_TAGLINE,
  VILLAGE_ADDRESS_LINE,
  VILLAGE_MAPS_URL,
  VILLAGE_NAME,
  type BucketKey,
} from "@/lib/site";
import { loadMembers } from "@/lib/members";
import { pastEvents, upcomingEvents } from "@/lib/events";
import { loadDevelopments } from "@/lib/developments";
import { loadSuggestionsSeed } from "@/lib/suggestions";
import { YouthPortrait } from "@/components/YouthPortrait";
import { MembersGrid } from "@/components/members/MembersGrid";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { GalleryHub } from "@/components/gallery/GalleryHub";
import { VillageDepthMap } from "@/components/VillageDepthMap";
import { FestivalIdolBanner } from "@/components/FestivalIdolBanner";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminClient } from "@/components/AdminClient";
import { AlbumCard } from "@/components/AlbumCard";
import { AlbumView } from "@/components/AlbumView";
import { Gallery } from "@/components/Gallery";
import { InteractiveVillageMap } from "@/components/experience/InteractiveVillageMap";
import { MemoryHero } from "@/components/MemoryHero";
import { MemoryWall } from "@/components/MemoryWall";
import { PrivateNotice } from "@/components/PrivateNotice";
import { Reveal } from "@/components/Reveal";
import { SearchClient } from "@/components/SearchClient";
import { VillageStory } from "@/components/VillageStory";
import { YearGrid } from "@/components/YearGrid";
import { AppleBucketStage } from "@/components/home/AppleBucketStage";
import { HistoryTimeline } from "@/components/home/HistoryTimeline";
import { buildHistoryTimeline } from "@/lib/timeline";
import { ContactPage } from "@/components/contact/ContactPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { DevelopmentsPage } from "@/components/developments/DevelopmentsPage";
import { SuggestionsPage } from "@/components/suggestions/SuggestionsPage";
import { MembersChat } from "@/components/chat/MembersChat";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { LoginForm } from "@/components/auth/LoginForm";
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
  "rvp-birthdays": "birthday",
  "fun-trips": "trips",
};

const BUCKET_ROUTES: BucketKey[] = [
  "sankranthi",
  "vinayaka-chavithi",
  "mathamma-jathara",
  "devapatlamma-jathara",
  "sri-rama-navami",
  "rvp-birthdays",
  "fun-trips",
];

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
    { slug: ["chat"] },
    // Always publish Fun Fest route so auth gating can redirect to login
    { slug: ["fun-trips"] },
  ];

  const published = publicAlbums().filter((a) => (a.media?.length ?? 0) > 0);
  const bucketsWithContent = new Set(published.map((a) => a.bucket));

  for (const bucket of BUCKET_ROUTES) {
    // Hide empty CMS folders until images are uploaded (except fun-trips shell)
    if (!bucketsWithContent.has(bucket) && bucket !== "fun-trips") continue;
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

function BucketPage({ bucket }: { bucket: BucketKey }) {
  const meta = BUCKETS.find((b) => b.key === bucket)!;
  const albums = albumsByBucket(bucket);
  const media = albums.flatMap((a) => a.media);
  const images = media.filter((m) => m.type === "image");
  const heroImage =
    FESTIVAL_HEROES[bucket] ||
    albums.find((a) => a.cover)?.cover ||
    images[0]?.file;
  if (!albums.length && !heroImage && bucket !== "fun-trips") notFound();

  const page = (
    <main className="experience-page experience-page--apple">
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
    return gate(<AlbumView album={album} />);
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
      <RequireAuth>
        <main className="page">
          <MemoryHero
            eyebrow="RVP Youth"
            title="Members"
            lede="Legacy Circle, Core Members, and NextGen — the people who keep Kondreddigaripalli celebrations alive."
            primaryHref="/chat/"
            primaryLabel="Community chat"
            secondaryHref="/events/"
            secondaryLabel="Events"
          />
          <Reveal className="section">
            <div className="members-teaser-card">
              <div>
                <p className="eyebrow">Stay connected</p>
                <h2>Members chat</h2>
                <p className="muted">
                  Share updates, photos, and quick notes with fellow members.
                </p>
              </div>
              <Link className="btn" href="/chat/">
                Open chat
              </Link>
            </div>
          </Reveal>
          <MembersGrid
            members={members}
            eyebrow="Community"
            title="Our circles"
            lede="Elders, active members, and the next generation — organized by experience and age."
          />
        </main>
      </RequireAuth>
    );
  }

  if (path === "chat") {
    return (
      <RequireAuth>
        <main className="page">
          <MembersChat />
        </main>
      </RequireAuth>
    );
  }

  if (path === "developments") {
    return (
      <main className="page">
        <DevelopmentsPage developments={loadDevelopments()} />
      </main>
    );
  }

  if (path === "suggestions") {
    return (
      <main className="page">
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

  if (path === "contact") {
    return (
      <main className="page">
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
              <p className="muted">Loading sign in…</p>
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
        />
        <GalleryHub albums={albums} media={media} years={years()} />
      </main>
    );
  }

  if (path === "search") {
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Search</p>
          <h1>Find a memory</h1>
          <p className="lede">
            Search across festivals, jatharas, birthdays, and fun trips.
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
          eyebrow="About"
          title="RVP Youth"
          lede={SITE_TAGLINE}
          primaryHref="/sankranthi/"
          primaryLabel="Begin with Sankranthi"
          secondaryHref="/#map"
          secondaryLabel="Village map"
        />
        <VillageStory />
        <Reveal className="section">
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h2>What this archive holds</h2>
            {LANDING_BRAND_TAGLINES.map((line) => (
              <p key={line} className="muted" style={{ marginTop: "0.5rem" }}>
                {line}
              </p>
            ))}
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              Sankranthi, Vinayaka Chavithi, Mathamma & Devapatlamma Jathara, Sri Rama
              Navami, members, and Fun Trips — a premium digital village archive for{" "}
              {VILLAGE_NAME}.
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
    return (
      <main className="page">
        <div className="section">
          <p className="eyebrow">Years</p>
          <h1>Browse by year</h1>
        </div>
        <YearGrid years={years()} />
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
          eyebrow={`The ${year} chapter`}
          title={year}
          lede="Everything gathered from this year."
          primaryHref="/years/"
          primaryLabel="All years"
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
        <div className="section">
          <p className="eyebrow">Administrator</p>
          <h1>GitHub CMS</h1>
          <p className="lede">
            Manage photos in the GitHub repository. The website rebuilds and deploys
            automatically — no uploads on this site.
          </p>
        </div>
        <AdminClient />
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
