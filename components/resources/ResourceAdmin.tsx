"use client";

/**
 * §2 + §12: the admin's view of the collector.
 *
 * Three panels, in the order an administrator actually needs them:
 *
 *   1. The last run — did it work, what arrived, what needs me.
 *   2. The review queue — the resources that need a decision, with the
 *      REASON each one is held, because "needs review" without a reason is
 *      just a chore.
 *   3. The sources — their health, their licence position, and whether they
 *      are collecting.
 *
 * This panel is READ-ONLY, deliberately. Numbers are computed from the
 * committed catalog at build time, so the page is accurate as of the last
 * deploy. Source edits and resource approvals are made in
 * content/resources/sources.json and generated/resources.json — which means a
 * licence verdict or a publish decision goes through a commit and a review
 * rather than a button, and leaves a git history saying who changed what.
 * For a permissions registry that is a feature, not a limitation.
 */
import { useMemo, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import {
  categoryLabel,
  LANGUAGE_LABEL,
  RESOURCE_TYPE_LABEL,
  STATUS_LABEL,
  formatFileSize,
  resourceDate,
  type CollectorNotification,
  type CollectorRun,
  type Resource,
  type Source,
} from "@/lib/resources";
import type { ResourceFlag } from "@/lib/resources/types";
import { formatEventDate } from "@/lib/dates";

/** Plain-language explanation of why a resource is held. */
const FLAG_REASON: Record<ResourceFlag, string> = {
  "empty-file": "The file downloaded but contains no document.",
  "password-protected": "The PDF is encrypted and cannot be opened or indexed.",
  "wrong-file-type": "The server sent something other than a PDF for a .pdf link — usually an error page.",
  "too-large": "The file is above the size cap.",
  "download-failed": "The download did not complete after retries.",
  duplicate: "The same document already exists from another source.",
  "missing-metadata": "No usable title, description or text could be extracted.",
  "license-unclear": "The source has no readable licence statement, so this is never re-hosted.",
  expired: "Its deadline has passed.",
  "source-removed": "The source has taken it down.",
  "suspicious-content": "The PDF contains embedded scripts or auto-run actions.",
};

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "warn" | "bad" }) {
  return (
    <div className={`admin-stat${tone ? ` admin-stat--${tone}` : ""}`}>
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

export function ResourceAdmin({
  resources,
  sources,
  runs,
  notifications,
}: {
  resources: Resource[];
  sources: Source[];
  runs: CollectorRun[];
  notifications: CollectorNotification[];
}) {
  const { lang } = useUiLang();
  const te = lang === "te";
  const dateFmt = te ? "te-IN" : "en-GB";
  const lastRun = runs[0];
  const sourceName = new Map(sources.map((s) => [s.id, s.name]));
  const [tab, setTab] = useState<"dashboard" | "review" | "sources">("dashboard");

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const count = (fn: (r: Resource) => boolean) => resources.filter(fn).length;
    return {
      total: resources.length,
      published: count((r) => r.status === "published"),
      newToday: count((r) => r.collectedDate === today),
      updatedToday: count((r) => r.lastUpdatedDate === today),
      needsReview: count((r) => r.status === "needs-review"),
      expired: count((r) => r.status === "expired"),
      broken: count((r) =>
        r.flags.some((f) => f === "empty-file" || f === "wrong-file-type" || f === "download-failed" || f === "password-protected"),
      ),
      hosted: count((r) => Boolean(r.localFileUrl)),
      linkOnly: count((r) => !r.localFileUrl && r.resourceType !== "video"),
      videos: count((r) => r.resourceType === "video"),
      videosGone: count((r) => r.video?.unavailable === true),
      activeSources: sources.filter((s) => s.active && s.method !== "manual").length,
      manualSources: sources.filter((s) => s.method === "manual").length,
      failingSources: sources.filter((s) => s.health.consecutiveFailures >= 3).length,
    };
  }, [resources, sources]);

  const queue = useMemo(
    () =>
      resources
        .filter((r) => r.status === "needs-review" || r.status === "new" || r.status === "source-unavailable")
        .sort((a, b) => (resourceDate(b) < resourceDate(a) ? -1 : 1)),
    [resources],
  );

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="resource-admin">
      <div className="admin-tabs" role="tablist">
        {(
          [
            ["dashboard", te ? "డాష్‌బోర్డ్" : "Dashboard"],
            ["review", `${te ? "సమీక్ష" : "Review"} (${queue.length})`],
            ["sources", `${te ? "మూలాలు" : "Sources"} (${sources.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "is-active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "dashboard" ? (
        <>
          <section className="section">
            <h2>{te ? "చివరి సేకరణ" : "Resource Collector"}</h2>
            {lastRun ? (
              <>
                <p className="muted">
                  {te ? "చివరి రన్" : "Last run"}: {formatEventDate(lastRun.startedAt.slice(0, 10), dateFmt)}{" "}
                  {new Date(lastRun.startedAt).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  IST · {lastRun.tier}
                  {lastRun.dryRun ? " · dry run" : ""}
                </p>
                <div className="admin-stats">
                  <Stat label={te ? "తనిఖీ చేసిన మూలాలు" : "Sources checked"} value={lastRun.sourcesChecked} />
                  <Stat label={te ? "కొత్త వనరులు" : "New resources"} value={lastRun.newResources} />
                  <Stat label={te ? "నవీకరించినవి" : "Updated"} value={lastRun.updatedResources} />
                  <Stat label={te ? "నకిలీలు" : "Duplicates"} value={lastRun.duplicates} />
                  <Stat label={te ? "సమీక్ష అవసరం" : "Needs review"} value={lastRun.needsReview} tone={lastRun.needsReview ? "warn" : undefined} />
                  <Stat label={te ? "విఫలమైన మూలాలు" : "Failed sources"} value={lastRun.sourcesFailed} tone={lastRun.sourcesFailed ? "bad" : undefined} />
                </div>
              </>
            ) : (
              <p className="muted">
                {te
                  ? "సేకరణ ఇంకా అమలు కాలేదు."
                  : "The collector has not run yet. Trigger it from Actions → Collect Knowledge Resources, or run npm run resources:collect -- --dry-run locally."}
              </p>
            )}
          </section>

          <section className="section">
            <h2>{te ? "వనరులు" : "Resources"}</h2>
            <div className="admin-stats">
              <Stat label={te ? "మొత్తం" : "Total"} value={stats.total} />
              <Stat label={te ? "ప్రచురించినవి" : "Published"} value={stats.published} />
              <Stat label={te ? "ఈరోజు కొత్తవి" : "New today"} value={stats.newToday} />
              <Stat label={te ? "ఈరోజు నవీకరించినవి" : "Updated today"} value={stats.updatedToday} />
              <Stat label={te ? "సమీక్ష అవసరం" : "Needs review"} value={stats.needsReview} tone={stats.needsReview ? "warn" : undefined} />
              <Stat label={te ? "గడువు ముగిసినవి" : "Expired"} value={stats.expired} />
              <Stat label={te ? "పనిచేయనివి" : "Broken"} value={stats.broken} tone={stats.broken ? "bad" : undefined} />
            </div>
          </section>

          <section className="section">
            <h2>{te ? "నిల్వ మరియు అనుమతి" : "Hosting and permission"}</h2>
            <div className="admin-stats">
              <Stat label={te ? "మేము నిల్వ చేసినవి" : "Hosted by us"} value={stats.hosted} />
              <Stat label={te ? "లింక్ మాత్రమే" : "Link-only"} value={stats.linkOnly} />
              <Stat label={te ? "వీడియోలు" : "Videos"} value={stats.videos} />
              <Stat label={te ? "అందుబాటులో లేని వీడియోలు" : "Unavailable videos"} value={stats.videosGone} tone={stats.videosGone ? "warn" : undefined} />
            </div>
            <p className="muted">
              {te
                ? "పునఃప్రచురణకు స్పష్టమైన అనుమతి ఉన్న మూలాల నుండి మాత్రమే ఫైళ్లు నిల్వ చేయబడతాయి."
                : "Files are only ever stored from sources whose licence explicitly permits redistribution. Everything else is a link to the official copy."}
            </p>
          </section>

          <section className="section">
            <h2>{te ? "మూలాలు" : "Sources"}</h2>
            <div className="admin-stats">
              <Stat label={te ? "సేకరిస్తున్నవి" : "Collecting"} value={stats.activeSources} />
              <Stat label={te ? "లింక్ మాత్రమే (మాన్యువల్)" : "Link-only (manual)"} value={stats.manualSources} />
              <Stat label={te ? "విఫలమవుతున్నవి" : "Failing"} value={stats.failingSources} tone={stats.failingSources ? "bad" : undefined} />
            </div>
          </section>

          {unread.length > 0 ? (
            <section className="section">
              <h2>{te ? "నోటిఫికేషన్లు" : "Notifications"}</h2>
              <ul className="admin-notifications">
                {unread.slice(0, 20).map((n) => (
                  <li key={n.id} className={`admin-note admin-note--${n.level}`}>
                    <span className="admin-note-kind">{n.kind}</span>
                    <span>{n.message}</span>
                    <span className="muted">{formatEventDate(n.at.slice(0, 10), dateFmt)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      {tab === "review" ? (
        <section className="section">
          <h2>{te ? "సమీక్ష క్యూ" : "Review queue"}</h2>
          {queue.length === 0 ? (
            <p className="muted">{te ? "సమీక్షించాల్సినవి ఏవీ లేవు." : "Nothing is waiting for a decision."}</p>
          ) : (
            <ul className="admin-review-list">
              {queue.map((r) => (
                <li key={r.id} className="admin-review-item">
                  <div className="admin-review-head">
                    <strong>{r.title}</strong>
                    <span className={`resource-status resource-status--${r.status}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                  <p className="muted">
                    {sourceName.get(r.sourceId) ?? r.sourceId} · {categoryLabel(r.category)} ·{" "}
                    {RESOURCE_TYPE_LABEL[r.resourceType]} · {LANGUAGE_LABEL[r.language]}
                    {formatFileSize(r.fileSize) ? ` · ${formatFileSize(r.fileSize)}` : ""}
                  </p>
                  {/* The reason, not just the label. */}
                  {r.flags.length > 0 ? (
                    <ul className="admin-review-flags">
                      {r.flags.map((f) => (
                        <li key={f}>
                          <code>{f}</code> — {FLAG_REASON[f] ?? f}
                        </li>
                      ))}
                    </ul>
                  ) : r.status === "new" ? (
                    <p className="muted">
                      {te
                        ? "ఈ మూలానికి ఆటో-పబ్లిష్ ఆఫ్‌లో ఉంది, కాబట్టి ఇది మీ ఆమోదం కోసం వేచి ఉంది."
                        : "Auto-publish is off for this source, so it is waiting for your approval."}
                    </p>
                  ) : null}
                  <div className="admin-review-actions">
                    <a href={r.originalUrl} target="_blank" rel="noopener noreferrer">
                      {te ? "అసలు వనరు" : "Open original"}
                    </a>
                    <code className="admin-review-id">{r.id}</code>
                    {r.localFileUrl ? (
                      <a href={r.localFileUrl} target="_blank" rel="noopener">
                        {te ? "మా కాపీ" : "Our copy"}
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {tab === "sources" ? (
        <section className="section">
          <h2>{te ? "వనరు మూలాలు" : "Resource Sources"}</h2>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{te ? "మూలం" : "Source"}</th>
                  <th>{te ? "రకం" : "Type"}</th>
                  <th>{te ? "పద్ధతి" : "Method"}</th>
                  <th>{te ? "అనుమతి" : "Redistribution"}</th>
                  <th>{te ? "స్థితి" : "Status"}</th>
                  <th>{te ? "చివరి తనిఖీ" : "Last checked"}</th>
                  <th>{te ? "చివరి సేకరణ" : "Last collection"}</th>
                  <th>{te ? "వనరులు" : "Resources"}</th>
                  <th>{te ? "ఫ్రీక్వెన్సీ" : "Frequency"}</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => {
                  const failing = s.health.consecutiveFailures >= 3;
                  return (
                    <tr key={s.id} className={failing ? "is-failing" : ""}>
                      <td>
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          {s.name}
                        </a>
                        {s.notes ? <p className="admin-source-note">{s.notes}</p> : null}
                        <p className="admin-source-licence">
                          <strong>{te ? "లైసెన్స్" : "Licence"}:</strong> {s.licenseNote}
                          {s.licenseUrl ? (
                            <>
                              {" "}
                              <a href={s.licenseUrl} target="_blank" rel="noopener noreferrer">
                                {te ? "మూలం" : "cite"}
                              </a>
                            </>
                          ) : null}
                        </p>
                      </td>
                      <td>{s.type}</td>
                      <td>{s.method}</td>
                      <td>
                        <span className={`licence-badge licence-badge--${s.licenseStatus}`}>
                          {s.licenseStatus === "yes" ? "Yes" : s.licenseStatus === "no" ? "No" : "Unknown"}
                        </span>
                      </td>
                      <td>
                        {s.active ? (
                          s.method === "manual" ? (
                            <span className="muted">{te ? "లింక్ మాత్రమే" : "Link-only"}</span>
                          ) : (
                            <span>{te ? "సక్రియం" : "Active"}</span>
                          )
                        ) : (
                          <span className="muted">{te ? "నిష్క్రియం" : "Inactive"}</span>
                        )}
                        {failing ? <span className="admin-badge admin-badge--bad">{te ? "విఫలం" : "Failing"}</span> : null}
                      </td>
                      <td>{s.health.lastChecked ? formatEventDate(s.health.lastChecked.slice(0, 10), dateFmt) : "—"}</td>
                      <td>{s.health.lastSuccess ? formatEventDate(s.health.lastSuccess.slice(0, 10), dateFmt) : "—"}</td>
                      <td>{s.health.resourceCount}</td>
                      <td>{s.frequency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="muted">
            {te
              ? "మూలాలను content/resources/sources.json లో సవరించండి. లైసెన్స్ నిర్ణయం మారితే అది కమిట్ ద్వారా సమీక్షకు వెళ్తుంది."
              : "Sources are edited in content/resources/sources.json. A licence verdict changing is a commit, so it goes through review and leaves a record — read docs/KNOWLEDGE_SECTIONS.md before setting any source to \u201cyes\u201d."}
          </p>
        </section>
      ) : null}
    </div>
  );
}
