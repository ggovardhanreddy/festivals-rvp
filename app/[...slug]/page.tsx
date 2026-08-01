import Link from "next/link";
import { PrivateNotice, SiteShell } from "@/components/site-shell";

const pages: Record<string, { title: string; copy: string }> = {
  years: { title: "Years", copy: "Browse celebrations and memories by the year they happened." },
  timeline: { title: "Timeline", copy: "A chronological path through the archive." },
  festivals: { title: "Festivals", copy: "Traditions, decorations and the people who make each occasion special." },
  trips: { title: "Trips", copy: "Journeys near and far, gathered in one place." },
  videos: { title: "Videos", copy: "Short moving memories from the family archive." },
  documents: { title: "Documents", copy: "Letters, invitations and other paper memories." },
  gallery: { title: "Gallery", copy: "A selection from every corner of the archive." },
  favorites: { title: "Favorites", copy: "The memories marked as especially meaningful." },
  search: { title: "Search", copy: "Search the generated index by year, event, place or person." },
  settings: { title: "Settings", copy: "Your appearance preference is saved on this device." },
  about: { title: "About this archive", copy: "Festivals RVP is a private, static family archive maintained by Govardhan Reddy." },
  random: { title: "A random memory", copy: "Sankranti 2024 — a warm afternoon of rangoli, family and shared food." },
  "memory-of-the-day": { title: "Memory of the day", copy: "Today’s selection is generated from the archive’s dates." },
  "this-day": { title: "This day in memory", copy: "Look back at memories captured on this date in past years." },
  offline: { title: "Offline access", copy: "After visiting, supported browsers may keep this archive available when you are offline." },
};
export function generateStaticParams() { return Object.keys(pages).map((slug) => ({ slug: [slug] })); }
export default async function ArchivePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params; const key = slug.join("/"); const page = pages[key] ?? { title: "Archive", copy: "This memory has not been published yet." };
  return <SiteShell><main className="shell"><section className="hero"><div className="eyebrow">Festivals RVP archive</div><h1>{page.title}</h1><p>{page.copy}</p></section>{["gallery", "festivals", "years", "favorites", "random", "memory-of-the-day", "this-day"].includes(key) && <><PrivateNotice /><div className="gallery">{["Sankranti 2024", "Family gathering", "A remembered day", "Shared celebrations", "From the archive", "Another chapter"].map((x) => <div className="photo" key={x}>{x}</div>)}</div></>}<Link className="button alt" href="/">Back home</Link></main></SiteShell>;
}
