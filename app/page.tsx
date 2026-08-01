import Link from "next/link";
import { PrivateNotice, SiteShell } from "@/components/site-shell";

export default function Home() {
  return <SiteShell><main className="shell"><section className="hero"><div className="eyebrow">Govardhan Reddy’s family archive</div><h1>Every celebration has a story.</h1><p>A quiet place for festivals, journeys, people and the small moments worth keeping.</p><p><Link className="button" href="/years">Explore the archive</Link> <Link className="button alt" href="/random">A random memory</Link></p></section><PrivateNotice /><section className="grid"><article className="card"><h3>Festivals</h3><p>Rituals, color and togetherness across the years.</p><Link href="/festivals">Browse festivals →</Link></article><article className="card"><h3>Trips</h3><p>Roads travelled and places remembered.</p><Link href="/trips">Browse journeys →</Link></article><article className="card"><h3>Memory of the day</h3><p>Let the archive surprise you with a day to revisit.</p><Link href="/memory-of-the-day">See today’s memory →</Link></article></section></main></SiteShell>;
}
