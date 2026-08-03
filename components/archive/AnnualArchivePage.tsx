"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { albumHref, BUCKETS } from "@/lib/site";
import type { Album } from "@/lib/types";

type YearChapter = {
  year: string;
  albums: Album[];
  mediaCount: number;
};

export function AnnualArchivePage({ chapters }: { chapters: YearChapter[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="annual-archive">
      <div className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Preserve · Browse · Remember</p>
            <h1>Annual Archive</h1>
            <p className="lede">
              Content organized by year — festivals, galleries, birthdays, and
              village chapters. Built so history stays findable for decades.
            </p>
          </div>
          <div className="btn-row">
            <Link className="btn ghost" href="/heritage/">
              Heritage Archive
            </Link>
            <Link className="btn ghost" href="/timeline/">
              Timeline
            </Link>
            <Link className="btn ghost" href="/search/">
              Search everything
            </Link>
          </div>
        </div>

        <div className="archive-year-list">
          {chapters.map((chapter, index) => {
            const festivals = chapter.albums.filter(
              (a) => a.category === "Festivals" || a.bucket !== "rvp-birthdays",
            );
            return (
              <m.section
                key={chapter.year}
                className="archive-year-block"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.24) }}
              >
                <div className="archive-year-head">
                  <h2>{chapter.year}</h2>
                  <p className="muted">
                    {chapter.albums.length} collection
                    {chapter.albums.length === 1 ? "" : "s"} · {chapter.mediaCount}{" "}
                    memories
                  </p>
                  <Link className="btn ghost" href={`/years/${chapter.year}/`}>
                    Open {chapter.year}
                  </Link>
                </div>
                <ul className="archive-festival-list">
                  {chapter.albums.map((album) => {
                    const bucketLabel =
                      BUCKETS.find((b) => b.key === album.bucket)?.title ||
                      album.title;
                    return (
                      <li key={`${album.year}-${album.slug}-${album.bucket}`}>
                        <Link href={albumHref(album)}>
                          <strong>{bucketLabel}</strong>
                          <span className="muted">
                            {album.media?.length || 0} items
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  {!festivals.length && !chapter.albums.length ? (
                    <li className="muted">No published collections yet.</li>
                  ) : null}
                </ul>
              </m.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
