"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { ResourceAdmin } from "@/components/resources/ResourceAdmin";
import type {
  CollectorNotification,
  CollectorRun,
  Resource,
  Source,
} from "@/lib/resources";

/** Build-time collector state, handed to the Resources tab. */
export type CollectorAdminData = {
  resources: Resource[];
  sources: Source[];
  runs: CollectorRun[];
  notifications: CollectorNotification[];
};
import {
  DIRECTORY_CATEGORIES,
  HERITAGE_CATEGORIES,
  LOST_FOUND_CATEGORIES,
  loadDirectorySeed,
  loadHeritageSeed,
  loadLostFoundSeed,
  loadPanchayatDocsSeed,
  loadSiteSettingsSeed,
  newCommunityId,
  PANCHAYAT_DOC_CATEGORIES,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type {
  ApprovalStatus,
  DirectoryEntry,
  HeritageItem,
  LostFoundItem,
  PanchayatDocument,
  SiteSettings,
} from "@/lib/types";
import { RequireAdmin, useAdminSession } from "@/components/auth/RequireAdmin";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { AdminClient } from "@/components/AdminClient";
import { MembersManager } from "@/components/admin/MembersManager";
import { FamiliesManager } from "@/components/admin/FamiliesManager";
import { MediaProtectionPanel } from "@/components/admin/MediaProtectionPanel";
import { AuditLogPanel } from "@/components/admin/AuditLogPanel";
import { ROLE_CAPABILITIES } from "@/lib/roles";

type Tab =
  | "overview"
  | "resources"
  | "analytics"
  | "media"
  | "members"
  | "families"
  | "audit"
  | "directory"
  | "approvals"
  | "documents"
  | "backup"
  | "settings"
  | "guide"
  | "roles";

function StatusButtons({
  status,
  onChange,
}: {
  status: ApprovalStatus;
  onChange: (s: ApprovalStatus) => void;
}) {
  return (
    <div className="btn-row">
      {(["pending", "approved", "rejected"] as ApprovalStatus[]).map((s) => (
        <button
          key={s}
          type="button"
          className={`btn ghost${status === s ? " is-selected" : ""}`}
          onClick={() => onChange(s)}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function DirectoryManager() {
  const seed = useMemo(() => loadDirectorySeed(), []);
  const { raw, saveAll, refresh, loading } = useCommunityList<DirectoryEntry>(
    "directory",
    seed,
    { admin: true },
  );
  const [items, setItems] = useState(seed);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setItems(raw.length ? raw : seed);
  }, [raw, seed]);

  async function persist(next: DirectoryEntry[]) {
    setMsg(null);
    try {
      await saveAll(next);
      setItems(next);
      setMsg("Directory saved to Cloudflare R2.");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  function update(id: string, patch: Partial<DirectoryEntry>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  return (
    <div>
      <p className="muted">
        Add, edit, or remove directory profiles without changing code. Changes
        persist in R2 (`community/directory.json`).
      </p>
      {loading ? <p className="muted">Loading…</p> : null}
      <div className="btn-row" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="btn"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              {
                id: newCommunityId("dir"),
                name: "New professional",
                category: "Other Professionals",
                profession: "Professional",
                designation: "",
                photo: null,
              },
            ])
          }
        >
          Add entry
        </button>
        <button type="button" className="btn ghost" onClick={() => void persist(items)}>
          Save directory
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => void persist(seed)}
        >
          Reset to seed
        </button>
      </div>
      {msg ? <p className="muted">{msg}</p> : null}
      <div className="admin-manage-list">
        {items.map((item) => (
          <article key={item.id} className="glass-card admin-manage-card">
            <label>
              Name
              <input
                value={item.name}
                onChange={(e) => update(item.id, { name: e.target.value })}
              />
            </label>
            <label>
              Category
              <select
                value={item.category}
                onChange={(e) =>
                  update(item.id, {
                    category: e.target.value as DirectoryEntry["category"],
                  })
                }
              >
                {DIRECTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Profession
              <input
                value={item.profession}
                onChange={(e) => update(item.id, { profession: e.target.value })}
              />
            </label>
            <label>
              Designation
              <input
                value={item.designation || ""}
                onChange={(e) => update(item.id, { designation: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={item.phone || ""}
                onChange={(e) => update(item.id, { phone: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={item.email || ""}
                onChange={(e) => update(item.id, { email: e.target.value })}
              />
            </label>
            <label>
              Availability
              <input
                value={item.availability || ""}
                onChange={(e) =>
                  update(item.id, { availability: e.target.value })
                }
              />
            </label>
            <label>
              Photo URL
              <input
                value={item.photo || ""}
                onChange={(e) => update(item.id, { photo: e.target.value })}
              />
            </label>
            <button
              type="button"
              className="btn ghost"
              onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ApprovalsManager() {
  const lfSeed = useMemo(() => loadLostFoundSeed(), []);
  const hSeed = useMemo(() => loadHeritageSeed(), []);
  const lf = useCommunityList<LostFoundItem>("lost-found", lfSeed, { admin: true });
  const heritage = useCommunityList<HeritageItem>("heritage", hSeed, {
    admin: true,
  });

  return (
    <div className="admin-approvals">
      <section>
        <h3>Lost &amp; Found</h3>
        {lf.raw.map((item) => (
          <article key={item.id} className="glass-card admin-manage-card">
            <strong>{item.title}</strong>
            <p className="muted">
              {item.category} · {item.location}
            </p>
            <StatusButtons
              status={item.status}
              onChange={(status) => {
                const next = lf.raw.map((i) =>
                  i.id === item.id ? { ...i, status } : i,
                );
                void lf.saveAll(next);
              }}
            />
          </article>
        ))}
        {!lf.raw.length ? <p className="muted">No submissions.</p> : null}
      </section>
      <section>
        <h3>Heritage submissions</h3>
        {heritage.raw.map((item) => (
          <article key={item.id} className="glass-card admin-manage-card">
            <strong>{item.title}</strong>
            <p className="muted">
              {item.category}
              {item.status ? ` · ${item.status}` : ""}
            </p>
            <StatusButtons
              status={item.status || "approved"}
              onChange={(status) => {
                const next = heritage.raw.map((i) =>
                  i.id === item.id ? { ...i, status } : i,
                );
                void heritage.saveAll(next);
              }}
            />
          </article>
        ))}
      </section>
      <p className="muted">
        Categories reference: Lost/Found ({LOST_FOUND_CATEGORIES.length}),
        Heritage ({HERITAGE_CATEGORIES.length}).
      </p>
    </div>
  );
}

function DocumentsManager() {
  const seed = useMemo(() => loadPanchayatDocsSeed(), []);
  const { raw, saveAll, refresh } = useCommunityList<PanchayatDocument>(
    "panchayat-docs",
    seed,
    { admin: true },
  );
  const [items, setItems] = useState(seed);
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] =
    useState<PanchayatDocument["category"]>("Panchayat Notices");
  const [fileKey, setFileKey] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setItems(raw.length ? raw : seed);
  }, [raw, seed]);

  async function addDoc(e: FormEvent) {
    e.preventDefault();
    const next: PanchayatDocument[] = [
      ...items,
      {
        id: newCommunityId("doc"),
        title: title.trim(),
        category,
        date,
        fileKey: fileKey.trim(),
        mime: "application/pdf",
      },
    ];
    try {
      await saveAll(next);
      setItems(next);
      setTitle("");
      setFileKey("");
      setMsg("Document catalog updated.");
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div>
      <p className="muted">
        Upload the PDF via Media (category <code>documents/</code>), then register
        its R2 key here for public preview.
      </p>
      <form className="community-form" onSubmit={addDoc}>
        <label>
          Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as PanchayatDocument["category"])
            }
          >
            {PANCHAYAT_DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          R2 file key
          <input
            required
            value={fileKey}
            onChange={(e) => setFileKey(e.target.value)}
            placeholder="documents/1234-notice.pdf"
          />
        </label>
        <button className="btn" type="submit">
          Add document
        </button>
      </form>
      {msg ? <p className="muted">{msg}</p> : null}
      <div className="admin-manage-list">
        {items.map((doc) => (
          <article key={doc.id} className="glass-card admin-manage-card">
            <strong>{doc.title}</strong>
            <p className="muted">
              {doc.category} · {doc.date}
            </p>
            <code>{doc.fileKey}</code>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const next = items.filter((i) => i.id !== doc.id);
                setItems(next);
                void saveAll(next);
              }}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

const SETTINGS_SEED = loadSiteSettingsSeed();

function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(SETTINGS_SEED);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(withBase("/api/community/site-settings"), {
          credentials: "include",
        });
        const data = (await res.json()) as { settings?: SiteSettings };
        if (data.settings) setSettings({ ...SETTINGS_SEED, ...data.settings });
      } catch {
        /* keep seed */
      }
    })();
  }, []);

  async function save() {
    setMsg(null);
    try {
      const res = await fetch(withBase("/api/community/site-settings"), {
        method: "PUT",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("Website settings saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="community-form">
      <label className="notif-pref-row">
        <input
          type="checkbox"
          checked={settings.watermarkEnabled}
          onChange={(e) =>
            setSettings((s) => ({ ...s, watermarkEnabled: e.target.checked }))
          }
        />
        <span>
          <strong>Watermark displayed images</strong>
          <span className="muted">Soft deterrent overlay on protected media</span>
        </span>
      </label>
      <label>
        Watermark text
        <input
          value={settings.watermarkText}
          onChange={(e) =>
            setSettings((s) => ({ ...s, watermarkText: e.target.value }))
          }
        />
      </label>
      <label>
        Watermark position
        <select
          value={settings.watermarkPosition || "bottom-right"}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              watermarkPosition: e.target.value as SiteSettings["watermarkPosition"],
            }))
          }
        >
          <option value="bottom-right">Bottom right</option>
          <option value="bottom-left">Bottom left</option>
          <option value="top-right">Top right</option>
          <option value="top-left">Top left</option>
          <option value="center">Center</option>
        </select>
      </label>
      <label>
        Watermark opacity ({Math.round((settings.watermarkOpacity ?? 0.35) * 100)}%)
        <input
          type="range"
          min="8"
          max="70"
          value={Math.round((settings.watermarkOpacity ?? 0.35) * 100)}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              watermarkOpacity: Number(e.target.value) / 100,
            }))
          }
        />
      </label>
      <label className="notif-pref-row">
        <input
          type="checkbox"
          checked={settings.allowPublicMediaDownload}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              allowPublicMediaDownload: e.target.checked,
            }))
          }
        />
        <span>
          <strong>Allow public media download buttons</strong>
          <span className="muted">Off by default for media protection</span>
        </span>
      </label>
      <label className="notif-pref-row">
        <input
          type="checkbox"
          checked={settings.hideDirectoryContactsByDefault !== false}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              hideDirectoryContactsByDefault: e.target.checked,
            }))
          }
        />
        <span>
          <strong>Hide directory contacts by default</strong>
          <span className="muted">
            Only publish phone/email when explicitly approved
          </span>
        </span>
      </label>
      <label className="notif-pref-row">
        <input
          type="checkbox"
          checked={settings.requireConsentForPersonalData !== false}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              requireConsentForPersonalData: e.target.checked,
            }))
          }
        />
        <span>
          <strong>Require consent for personal data</strong>
          <span className="muted">
            Blood donors and contacts must opt in before public display
          </span>
        </span>
      </label>
      <label className="notif-pref-row">
        <input
          type="checkbox"
          checked={Boolean(settings.maintenanceMode)}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              maintenanceMode: e.target.checked,
            }))
          }
        />
        <span>
          <strong>Maintenance mode</strong>
          <span className="muted">
            Soft flag for pausing public submissions (stored in site settings)
          </span>
        </span>
      </label>
      <button type="button" className="btn" onClick={() => void save()}>
        Save settings
      </button>
      {msg ? <p className="muted">{msg}</p> : null}
    </div>
  );
}

function BackupPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const collections = [
    "directory",
    "members",
    "lost-found",
    "panchayat-docs",
    "heritage",
    "site-settings",
    "analytics",
  ] as const;

  async function downloadBackup() {
    setStatus("Collecting community data from R2…");
    const bundle: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      site: "reddivaripalli",
      collections: {},
    };
    try {
      for (const name of collections) {
        const res = await fetch(
          withBase(
            name === "site-settings" || name === "analytics"
              ? `/api/community/${name}`
              : `/api/community/${name}?admin=1`,
          ),
          { credentials: "include", cache: "no-store" },
        );
        bundle.collections = {
          ...(bundle.collections as object),
          [name]: await res.json(),
        };
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `reddivaripalli-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(href);
      setStatus(
        "Backup downloaded. Recommended: daily incremental (this export), weekly full (plus media sync), monthly archive copy offline.",
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Backup failed");
    }
  }

  async function restoreBackup(file: File) {
    setStatus("Reading backup…");
    try {
      const raw = JSON.parse(await file.text()) as {
        collections?: Record<string, { items?: unknown[]; settings?: unknown }>;
      };
      const cols = raw.collections || {};
      for (const [name, payload] of Object.entries(cols)) {
        if (name === "analytics") continue;
        if (name === "site-settings" && payload.settings) {
          await fetch(withBase("/api/community/site-settings"), {
            method: "PUT",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ settings: payload.settings }),
          });
          continue;
        }
        if (Array.isArray(payload.items)) {
          await fetch(withBase(`/api/community/${name}`), {
            method: "PUT",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ items: payload.items }),
          });
        }
      }
      setStatus("Restore finished. Refresh public pages to verify.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Restore failed");
    }
  }

  return (
    <div>
      <p className="muted">
        Protect important village data. Export community JSON from Cloudflare R2
        regularly. Media remains in the R2 bucket — keep a separate media sync
        schedule (`npm run media:migrate:r2`).
      </p>
      <div className="btn-row" style={{ margin: "1rem 0" }}>
        <button type="button" className="btn" onClick={() => void downloadBackup()}>
          Download full community backup
        </button>
        <label className="btn ghost">
          Restore from JSON
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void restoreBackup(file);
            }}
          />
        </label>
      </div>
      <ul className="muted">
        <li>Daily: download this community backup after admin edits</li>
        <li>Weekly: full backup + confirm R2 media inventory</li>
        <li>Monthly: archive a dated copy offline and test restore</li>
      </ul>
      {status ? <p className="muted">{status}</p> : null}
    </div>
  );
}

function GuidePanel() {
  return (
    <div className="admin-guide-panel">
      <h3>Admin quick guide</h3>
      <ol className="cms-steps">
        <li>
          <strong>Members</strong> — Git seed{" "}
          <code>content/data/members.json</code> is the build SSOT (Fun Fest
          auth, search). Admin Save writes R2 <code>community/members.json</code>{" "}
          for live merge; sync important edits back to Git when you can.
        </li>
        <li>
          <strong>Media</strong> — Media/R2 tab: set Year + Festival, upload,
          then <strong>Reindex gallery</strong>. Prefer WebP/MP4 (local import
          for HEIC). Official <code>hero.webp</code> is never overwritten.
        </li>
        <li>
          <strong>Events &amp; notifications</strong> — edit{" "}
          <code>content/data/events.json</code>; festival reminders fire 2 days /
          1 day / day-of automatically.
        </li>
        <li>
          <strong>Directory / documents</strong> — manage in Directory and
          Documents tabs; Save writes to R2 without code changes.
        </li>
        <li>
          <strong>Approvals</strong> — review Lost &amp; Found and heritage
          submissions before they go public.
        </li>
        <li>
          <strong>Privacy</strong> — Settings tab: hide contacts by default;
          directory contacts stay private unless opted in.
        </li>
        <li>
          <strong>Backups</strong> — Backup tab: download JSON regularly and test
          restore monthly.
        </li>
      </ol>
      <p className="muted">
        Full written guide: <code>docs/14-ADMIN_GUIDE.md</code> in the repository.
      </p>
      <div className="btn-row">
        <Link className="btn ghost" href="/years/">
          Annual Archive
        </Link>
        <Link className="btn ghost" href="/search/">
          Search
        </Link>
        <Link className="btn ghost" href="/heritage/">
          Heritage
        </Link>
      </div>
    </div>
  );
}

function RolesPanel() {
  return (
    <div className="roles-panel">
      <p className="muted">
        Permission model enforced in the UI and APIs. Administrators manage
        content; members may submit pending items; guests browse public pages.
      </p>
      {(Object.keys(ROLE_CAPABILITIES) as Array<keyof typeof ROLE_CAPABILITIES>).map(
        (role) => (
          <article key={role} className="glass-card admin-manage-card">
            <h3>{role}</h3>
            <ul>
              {ROLE_CAPABILITIES[role].map((cap) => (
                <li key={cap}>
                  <code>{cap}</code>
                </li>
              ))}
            </ul>
          </article>
        ),
      )}
    </div>
  );
}

export function AdminHub({ collector }: { collector?: CollectorAdminData }) {
  const { isAdmin, ready, refresh } = useAdminSession();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "resources", label: "Resources" },
    { id: "analytics", label: "Analytics" },
    { id: "media", label: "Media / R2" },
    { id: "members", label: "Members" },
    { id: "families", label: "Families" },
    { id: "audit", label: "Audit" },
    { id: "directory", label: "Directory" },
    { id: "approvals", label: "Approvals" },
    { id: "documents", label: "Documents" },
    { id: "backup", label: "Backup" },
    { id: "settings", label: "Settings" },
    { id: "guide", label: "Guide" },
    { id: "roles", label: "Roles" },
  ];

  if (!ready) return <p className="muted">Checking administrator session…</p>;

  if (!isAdmin) {
    return (
      <div className="section">
        <AdminLoginForm onSuccess={() => void refresh()} />
        <p className="muted" style={{ marginTop: "1rem" }}>
          Super Admin only. Members and guests cannot manage the website,
          members, media, or settings.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-hub section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Administrator</p>
          <h1>Dashboard</h1>
          <p className="lede">
            Manage media, directory, families, approvals, documents, heritage, analytics,
            and site settings.
          </p>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() =>
            void fetch(withBase("/api/admin/logout"), {
              method: "POST",
              credentials: "include",
            }).then(() => window.location.reload())
          }
        >
          Sign out
        </button>
      </div>

      <div className="dev-filters admin-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className="dev-filter-btn"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "resources" ? (
        collector ? (
          <ResourceAdmin
            resources={collector.resources}
            sources={collector.sources}
            runs={collector.runs}
            notifications={collector.notifications}
          />
        ) : (
          <p className="muted">Collector data is unavailable in this build.</p>
        )
      ) : null}

      {tab === "overview" ? (
        <div className="analytics-cards">
          <article>
            <p className="eyebrow">Quick links</p>
            <div className="btn-row" style={{ flexWrap: "wrap" }}>
              <Link className="btn ghost" href="/directory/">
                Directory
              </Link>
              <Link className="btn ghost" href="/lost-found/">
                Lost &amp; Found
              </Link>
              <Link className="btn ghost" href="/documents/">
                Documents
              </Link>
              <Link className="btn ghost" href="/families/">
                Families
              </Link>
              <Link className="btn ghost" href="/heritage/">
                Heritage
              </Link>
            </div>
          </article>
        </div>
      ) : null}

      {tab === "analytics" ? (
        <RequireAdmin>
          <AnalyticsPanel />
        </RequireAdmin>
      ) : null}
      {tab === "media" ? (
        <>
          <AdminClient />
          <MediaProtectionPanel />
        </>
      ) : null}
      {tab === "members" ? <MembersManager /> : null}
      {tab === "families" ? <FamiliesManager /> : null}
      {tab === "audit" ? (
        <RequireAdmin>
          <AuditLogPanel />
        </RequireAdmin>
      ) : null}
      {tab === "directory" ? <DirectoryManager /> : null}
      {tab === "approvals" ? <ApprovalsManager /> : null}
      {tab === "documents" ? <DocumentsManager /> : null}
      {tab === "backup" ? <BackupPanel /> : null}
      {tab === "settings" ? <SettingsManager /> : null}
      {tab === "guide" ? <GuidePanel /> : null}
      {tab === "roles" ? <RolesPanel /> : null}
    </div>
  );
}
