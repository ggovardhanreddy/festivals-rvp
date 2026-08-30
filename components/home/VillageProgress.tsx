import Link from "next/link";
import { withBase } from "@/lib/base";
import { STATUS_META } from "@/lib/development-status";
import type { Development } from "@/lib/types";

const FALLBACK_IMAGE = "/logo/logo-mark.webp";

/**
 * The village's current development projects.
 *
 * Reads content/data/developments.json only — no example roads, no example
 * water schemes. If the file holds one project, one card renders; the section
 * never pads itself out with work nobody has proposed.
 */
export function VillageProgress({
  developments,
  limit = 4,
}: {
  developments: Development[];
  limit?: number;
}) {
  if (!developments.length) return null;

  const shown = [...developments]
    .sort((a, b) => (b.startDate || "").localeCompare(a.startDate || ""))
    .slice(0, limit);

  return (
    <section className="section home-progress" aria-labelledby="home-progress-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">Developments</p>
          <h2 id="home-progress-heading">Village Progress</h2>
        </div>
        <Link className="btn ghost" href="/developments/">
          View All Developments <span aria-hidden>→</span>
        </Link>
      </div>

      <ul className="progress-grid" data-count={shown.length}>
        {shown.map((project) => {
          const meta = STATUS_META[project.status];
          const image = project.images?.[0];
          return (
            <li key={project.id}>
              <Link className="progress-card" href="/developments/">
                <span
                  className="progress-card-media"
                  data-placeholder={image ? undefined : true}
                >
                  <img
                    src={withBase(image || FALLBACK_IMAGE)}
                    alt=""
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="progress-card-body">
                  <span className="progress-status" data-tone={meta?.tone}>
                    <span aria-hidden>{meta?.icon}</span>
                    {meta?.label ?? project.status}
                  </span>
                  <span className="progress-card-title">{project.title}</span>
                  {/* Summary, not description. The full account of a project —
                      stages, milestones, what it needs from the village — is
                      what the Developments page is for. */}
                  <span className="progress-card-text muted">
                    {project.summary || project.description}
                  </span>
                  <span className="progress-card-cta">
                    View Project <span aria-hidden>→</span>
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
