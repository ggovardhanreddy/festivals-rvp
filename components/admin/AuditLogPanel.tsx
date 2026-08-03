"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMemberAudit } from "@/lib/member-audit";
import type { MemberAuditEntry } from "@/lib/types";

export function AuditLogPanel() {
  const [items, setItems] = useState<MemberAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchMemberAudit();
      setItems(next.slice(0, 100));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div>
      <p className="muted">
        Recent Super Admin changes to the members roster (stored in R2 as{" "}
        <code>community/audit.json</code>).
      </p>
      <div className="btn-row" style={{ marginBottom: "1rem" }}>
        <button type="button" className="btn ghost" onClick={() => void refresh()}>
          Refresh
        </button>
      </div>
      {loading ? <p className="muted">Loading audit log…</p> : null}
      {error ? <p className="media-error">{error}</p> : null}
      {!loading && !items.length ? (
        <p className="muted">No audit entries yet.</p>
      ) : null}
      <div className="admin-manage-list">
        {items.map((entry) => (
          <article key={entry.id} className="glass-card admin-manage-card">
            <p className="eyebrow" style={{ margin: 0 }}>
              {new Date(entry.ts).toLocaleString()} · {entry.action}
            </p>
            <h3 style={{ margin: "0.35rem 0" }}>
              {entry.memberName || entry.memberId}
            </h3>
            <p className="muted" style={{ margin: 0 }}>
              Admin: {entry.adminName}
            </p>
            {entry.fields?.length ? (
              <p className="muted" style={{ margin: "0.35rem 0 0" }}>
                Fields: {entry.fields.join(", ")}
              </p>
            ) : null}
            {entry.before || entry.after ? (
              <details style={{ marginTop: "0.5rem" }}>
                <summary>Before / after</summary>
                <pre className="admin-audit-pre">
                  {JSON.stringify(
                    { before: entry.before, after: entry.after },
                    null,
                    2,
                  )}
                </pre>
              </details>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
