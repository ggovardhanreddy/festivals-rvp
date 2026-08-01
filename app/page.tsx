import { allMedia, publicAlbums, years } from "@/lib/content";
import { CinematicHero } from "@/components/experience/CinematicHero";
import { HomeBelowFold } from "@/components/home/HomeBelowFold";

export default function HomePage() {
  const albums = publicAlbums();
  const media = allMedia();
  const recent = albums.slice(0, 4);
  const featured = albums.filter((a) => a.media.some((m) => m.favorite)).slice(0, 3);
  const featuredAlbums = featured.length ? featured : recent;
  const galleryTeaser = media.filter((m) => m.type === "image").slice(0, 8);
  const yearList = years();

  return (
    <main>
      <CinematicHero />
      <HomeBelowFold
        featuredAlbums={featuredAlbums}
        media={media}
        galleryTeaser={galleryTeaser}
        yearList={yearList}
      />
    </main>
  );
}
