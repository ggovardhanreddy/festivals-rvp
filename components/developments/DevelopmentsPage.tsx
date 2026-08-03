"use client";

import { useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { parseIsoDate } from "@/lib/dates";
import {
  DEVELOPMENT_STATUSES,
  STATUS_META,
  WORKFLOW_STAGES,
  stageLabel,
} from "@/lib/development-status";
import type {
  Development,
  DevelopmentStatus,
  DevelopmentWorkflowStage,
} from "@/lib/types";
import { Reveal } from "@/components/Reveal";

const STATUS_FILTERS: { key: DevelopmentStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  ...DEVELOPMENT_STATUSES.map((s) => ({
    key: s.key,
    label: `${s.icon} ${s.shortLabel}`,
  })),
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
  const hero = item.images?.[0];
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
      {hero ? (
        <div className="dev-card-hero">
          <img src={withBase(hero)} alt="" loading="lazy" />
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
            <span aria-hidden>{meta.icon}</span> {meta.label}
          </span>
        </div>
        <p className="muted">{item.description}</p>

        <StageWorkflow stages={stages} currentStage={currentStage} />

        <p className="dev-dates muted">
          Project opened {formatDate(item.startDate)}
          {item.endDate ? ` · Target ${formatDate(item.endDate)}` : ""}
          {item.status === "under-construction" ||
          item.status === "ongoing" ||
          item.status === "completed"
            ? ""
            : " · Construction has not started"}
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
  const [filter, setFilter] = useState<DevelopmentStatus | "all">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return developments;
    return developments.filter((d) => d.status === filter);
  }, [developments, filter]);

  const activeStatuses = useMemo(() => {
    const present = new Set(developments.map((d) => d.status));
    return STATUS_FILTERS.filter(
      (f) => f.key === "all" || present.has(f.key as DevelopmentStatus),
    );
  }, [developments]);

  return (
    <div className="developments-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Village progress</p>
            <h1>Developments</h1>
            <p className="lede">
              Community projects for Kondreddigaripalli — from early planning and
              decisions through construction and completion.
            </p>
          </div>
        </div>

        <div className="dev-filters" role="tablist" aria-label="Filter by status">
          {activeStatuses.map(({ key, label }) => (
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
