"use client";

import { useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { parseIsoDate } from "@/lib/dates";
import {
  STATUS_META,
  WORKFLOW_STAGES,
  publicDevelopmentLabel,
  publicDevelopmentStatus,
  stageLabel,
  type PublicDevelopmentStatus,
} from "@/lib/development-status";
import type {
  Development,
  DevelopmentWorkflowStage,
} from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const PUBLIC_FILTERS: { key: "all" | PublicDevelopmentStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "in-progress", label: "In Progress" },
  { key: "planned", label: "Planned" },
];

function formatDate(iso: string) {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StageWorkflow({
  stages,
  currentStage,
}: {
  stages: DevelopmentWorkflowStage[];
  currentStage: DevelopmentWorkflowStage;
}) {
  const currentIndex = Math.max(0, stages.indexOf(currentStage));
  const labels = stages.map(
    (key) => WORKFLOW_STAGES.find((s) => s.key === key)?.label ?? stageLabel(key),
  );

  return (
    <div className="dev-stage-workflow" aria-label="Project stage">
      <p className="dev-stage-workflow-label">
        Current stage · <strong>{labels[currentIndex]}</strong>
      </p>
      <ol className="dev-stage-list">
        {stages.map((key, index) => {
          const state =
            index < currentIndex
              ? "done"
              : index === currentIndex
                ? "current"
                : "upcoming";
          return (
            <li key={key} className="dev-stage-item" data-state={state}>
              <span className="dev-stage-marker" aria-hidden>
                {state === "done" ? "✓" : state === "current" ? "●" : "○"}
              </span>
              <span className="dev-stage-name">{labels[index]}</span>
              {index < stages.length - 1 ? (
                <span className="dev-stage-arrow" aria-hidden>
                  ↓
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function DevelopmentCard({ item }: { item: Development }) {
  const photos = item.images ?? [];
  const meta = STATUS_META[item.status];
  const milestones = [...(item.milestones ?? [])].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const stages = item.stages?.length
    ? item.stages
    : (WORKFLOW_STAGES.map((s) => s.key) as DevelopmentWorkflowStage[]);
  const currentStage = item.currentStage ?? stages[0]!;

  return (
    <article className="dev-card" data-status={item.status}>
      {photos.length ? (
        <div className={photos.length > 1 ? "dev-card-photos" : "dev-card-hero"}>
          {photos.map((src, index) => {
            const caption =
              photos.length === 1
                ? "Current view"
                : index === 0
                  ? "Before"
                  : index === photos.length - 1
                    ? "After"
                    : `Update ${index}`;
            return (
              <figure key={src}>
                <img
                  src={withBase(src)}
                  alt={`${item.title} — ${caption.toLowerCase()}`}
                  loading="lazy"
                />
                <figcaption className="muted">{caption}</figcaption>
              </figure>
            );
          })}
        </div>
      ) : null}
      <div className="dev-card-body">
        <div className="dev-card-head">
          <h3>{item.title}</h3>
          <span
            className="dev-status-badge"
            data-status={item.status}
            data-tone={meta.tone}
          >
            {publicDevelopmentLabel(item.status)}
          </span>
        </div>
        <p className="muted">{item.description}</p>

        <StageWorkflow stages={stages} currentStage={currentStage} />

        <p className="dev-dates muted">
          Started {formatDate(item.startDate)}
          {item.endDate ? ` · Target ${formatDate(item.endDate)}` : ""}
        </p>
        {milestones.length ? (
          <div className="dev-timeline">
            <p className="eyebrow">Updates</p>
            <ol className="dev-timeline-list">
              {milestones.map((m) => (
                <li key={`${m.date}-${m.title}`}>
                  <time dateTime={m.date}>{formatDate(m.date)}</time>
                  <div>
                    <strong>{m.title}</strong>
                    {m.description ? (
                      <p className="muted">{m.description}</p>
                    ) : null}
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
  const [filter, setFilter] = useState<"all" | PublicDevelopmentStatus>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return developments;
    return developments.filter((d) => publicDevelopmentStatus(d.status) === filter);
  }, [developments, filter]);

  return (
    <div className="developments-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village works</p>
            <h1>Development</h1>
            <p className="lede">
              Roads, water, schools, temples and community facilities in
              Reddivaripalli — recorded as they stand, without promotion.
            </p>
          </div>
        </div>

        <div className="dev-filters" role="tablist" aria-label="Filter by status">
          {PUBLIC_FILTERS.map(({ key, label }) => (
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
