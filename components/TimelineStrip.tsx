import Link from "next/link";
import { Reveal } from "./Reveal";

export function TimelineStrip({ years }: { years: string[] }) {
  return (
    <Reveal className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Timeline</p>
          <h2>Years that still speak</h2>
        </div>
        <Link className="btn ghost" href="/timeline/">
          Full timeline
        </Link>
      </div>
      <ol className="timeline-strip" aria-label="Years">
        {years.map((year, index) => (
          <li key={year}>
            <Link href={`/years/${year}/`} className="timeline-year">
              <span>{year}</span>
            </Link>
            {index < years.length - 1 && (
              <span className="timeline-arrow" aria-hidden>
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
