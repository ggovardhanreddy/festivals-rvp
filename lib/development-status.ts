import type { DevelopmentStatus, DevelopmentWorkflowStage } from "./types";

export type StatusMeta = {
  key: DevelopmentStatus;
  label: string;
  shortLabel: string;
  icon: string;
  tone: string;
};

/** Canonical project statuses for Developments. */
export const DEVELOPMENT_STATUSES: StatusMeta[] = [
  {
    key: "proposed",
    label: "Proposed",
    shortLabel: "Proposed",
    icon: "📌",
    tone: "proposed",
  },
  {
    key: "planning",
    label: "Planning",
    shortLabel: "Planning",
    icon: "📋",
    tone: "planning",
  },
  {
    key: "critical-decision",
    label: "Planning / Critical Decision Stage",
    shortLabel: "Critical Decision",
    icon: "⚠️",
    tone: "critical",
  },
  {
    key: "fundraising",
    label: "Fundraising",
    shortLabel: "Fundraising",
    icon: "💰",
    tone: "fundraising",
  },
  {
    key: "under-construction",
    label: "Under Construction",
    shortLabel: "Construction",
    icon: "🏗️",
    tone: "construction",
  },
  {
    key: "ongoing",
    label: "Ongoing",
    shortLabel: "Ongoing",
    icon: "🚧",
    tone: "ongoing",
  },
  {
    key: "completed",
    label: "Completed",
    shortLabel: "Completed",
    icon: "✅",
    tone: "completed",
  },
];

export const STATUS_META: Record<DevelopmentStatus, StatusMeta> =
  Object.fromEntries(DEVELOPMENT_STATUSES.map((s) => [s.key, s])) as Record<
    DevelopmentStatus,
    StatusMeta
  >;

export const WORKFLOW_STAGES: {
  key: DevelopmentWorkflowStage;
  label: string;
}[] = [
  { key: "planning", label: "Planning" },
  { key: "community-discussion", label: "Community Discussion" },
  { key: "fundraising", label: "Fundraising" },
  { key: "approval", label: "Approval" },
  { key: "construction", label: "Construction" },
  { key: "completion", label: "Completion" },
];

export function stageLabel(stage: DevelopmentWorkflowStage): string {
  return WORKFLOW_STAGES.find((s) => s.key === stage)?.label ?? stage;
}

/** Map legacy statuses from older data files. */
export function normalizeDevelopmentStatus(
  status: string | undefined,
): DevelopmentStatus {
  switch (status) {
    case "planned":
      return "planning";
    case "paused":
      return "proposed";
    case "proposed":
    case "planning":
    case "critical-decision":
    case "fundraising":
    case "under-construction":
    case "ongoing":
    case "completed":
      return status;
    default:
      return "proposed";
  }
}
