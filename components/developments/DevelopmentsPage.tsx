"use client";

import { useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { parseIsoDate } from "@/lib/dates";
import type { Development, DevelopmentStatus } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const STATUS_FILTERS: { key: DevelopmentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "planned", label: "Planned" },
  { key: "completed", label: "Completed" },
  { key: "paused", label: "Paused" },
];

const STATUS_LABELS: Record<DevelopmentStatus, string> = {
  planned: "Planned",
  ongoing: "Ongoing",
  completed: "Completed",
  paused: "Paused",
};

function formatDate(iso: string) {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DevelopmentCard({ item }: { item: Development }) {
  const hero = item.images?.[0];
  const milestones = [...(item.milestones ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <article className="dev-card" data-status={item.status}>
      {hero ? (
        <div className="dev-card-hero">
          <img src={withBase(hero)} alt="" loading="lazy" />
        </div>
      ) : null}
      <div className="dev-card-body">
        <div className="dev-card-head">
          <h3>{item.title}</h3>
          <span className="dev-status-badge" data-status={item.status}>
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        <p className="muted">{item.description}</p>
        <div className="dev-progress">
          <div className="dev-progress-label">
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <div className="dev-progress-bar" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="dev-progress-fill" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
        <p className="dev-dates muted">
          Started {formatDate(item.startDate)}
          {item.endDate ? ` · Target ${formatDate(item.endDate)}` : ""}
        </p>
        {milestones.length ? (
          <div className="dev-timeline">
            <p className="eyebrow">Timeline</p>
            <ol className="dev-timeline-list">
              {milestones.map((m) => (
                <li key={`${m.date}-${m.title}`}>
                  <time dateTime={m.date}>{formatDate(m.date)}</time>
                  <div>
                    <strong>{m.title}</strong>
                    {m.description ? <p className="muted">{m.description}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DevelopmentsPage({ developments }: { developments: Development[] }) {
  const [filter, setFilter] = useState<DevelopmentStatus | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return developments;
    return developments.filter((d) => d.status === filter);
  }, [developments, filter]);

  return (
    <div className="developments-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village progress</p>
            <h1>Developments</h1>
            <p className="lede">
              Temple restoration, infrastructure, and community projects shaping
              Kondreddigaripalli.
            </p>
          </div>
        </div>

        <div className="dev-filters" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              className="dev-filter-btn"
              data-active={filter === key || undefined}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="dev-grid">
            {filtered.map((item) => (
              <DevelopmentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="muted">No developments match this filter.</p>
        )}
      </Reveal>
    </div>
  );
}
