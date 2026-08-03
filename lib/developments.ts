import fs from "node:fs";
import path from "node:path";
import { normalizeDevelopmentStatus } from "./development-status";
import type {
  Development,
  DevelopmentStatus,
  DevelopmentWorkflowStage,
} from "./types";

const DEVELOPMENTS_PATH = path.join(
  process.cwd(),
  "content",
  "data",
  "developments.json",
);

const DEFAULT_STAGES: DevelopmentWorkflowStage[] = [
  "planning",
  "community-discussion",
  "fundraising",
  "approval",
  "construction",
  "completion",
];

let cache: Development[] | null = null;

function normalizeDevelopment(raw: Development): Development {
  const status = normalizeDevelopmentStatus(raw.status);
  const stages =
    raw.stages?.length ? raw.stages : DEFAULT_STAGES;
  const currentStage =
    raw.currentStage && stages.includes(raw.currentStage)
      ? raw.currentStage
      : stages[0];
  return {
    ...raw,
    status,
    stages,
    currentStage,
  };
}

export function loadDevelopments(): Development[] {
  if (process.env.NODE_ENV === "production" && cache) return cache;
  if (!fs.existsSync(DEVELOPMENTS_PATH)) {
    cache = [];
    return cache;
  }
  const parsed = JSON.parse(
    fs.readFileSync(DEVELOPMENTS_PATH, "utf8"),
  ) as Development[];
  cache = parsed.map(normalizeDevelopment);
  return cache;
}

export function developmentsByStatus(
  status?: DevelopmentStatus,
): Development[] {
  const all = loadDevelopments();
  if (!status) return all;
  return all.filter((d) => d.status === status);
}
