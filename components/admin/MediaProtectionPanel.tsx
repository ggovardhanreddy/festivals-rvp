"use client";

import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import { useCommunityList } from "@/lib/use-community";
import type { MediaProtection } from "@/lib/types";
import type { SearchDoc, SearchShard } from "@/lib/search/schema";

export function MediaProtectionPanel() {
  const { raw, saveAll, loading } = useCommunityList<MediaProtection>(
    "media-protection",
    [],
    { admin: true, replaceSeedWhenRemote: true },
  );
  const [rules, setRules] = useState<MediaProtection[]>([]);
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setRules(raw);
  }, [raw]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("/search-index.json"), {
          cache: "no-store",
        });
        if (!res.ok) return;
        const shard = (await res.json()) as SearchShard;
        if (!cancelled) {
          setDocs(shard.docs.filter((doc) => doc.section === "media" && doc.media));
        }
      } catch {
        /* gallery list is optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const map = new Map(rules.map((rule) => [rule.id, rule]));
    return map;
  }, [rules]);

  const listed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs
      .filter((doc) =>
        q
          ? `${doc.title} ${doc.id} ${doc.media?.file || ""}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .slice(0, q ? 80 : 40);
  }, [docs, query]);

  function mediaId(doc: SearchDoc) {
    return doc.id.startsWith("media:") ? doc.id.slice("media:".length) : doc.id;
  }

  function ruleOf(id: string): MediaProtection {
    return (
      byId.get(id) || {
        id,
        visibility: "public",
        watermark: true,
      }
    );
  }

  async function persist(next: MediaProtection[]) {
    setRules(next);
    setMsg(null);
    try {
      await saveAll(next);
      setMsg("Image protection saved.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  }

  function update(id: string, patch: Partial<MediaProtection>) {
    const current = ruleOf(id);
    const nextRule = {
      ...current,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    const next = [...rules.filter((rule) => rule.id !== id), nextRule];
    void persist(next);
  }

  return (
    <section className="community-form" style={{ marginTop: "2rem" }}>
      <h3>Gallery / Media protection</h3>
      <p className="muted">
        Public photographs use a protected viewer (no drag, no save-as menu, no
        download button). Private photographs are hidden from public listings
        and served only with a signed URL. Browsers cannot fully prevent
        screenshots.
      </p>
      <label>
        Find a photograph
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title or file"
        />
      </label>
      {loading ? <p className="muted">Loading protection rules…</p> : null}
      {msg ? <p className="muted">{msg}</p> : null}
      <ul className="admin-manage-list">
        {listed.map((doc) => {
          const id = mediaId(doc);
          const rule = ruleOf(id);
          return (
            <li key={doc.id} className="admin-manage-card">
              <strong>{doc.title}</strong>
              <p className="muted">{doc.media?.album} · {doc.media?.year}</p>
              <fieldset style={{ border: 0, padding: 0 }}>
                <legend>Visibility</legend>
                <label className="notif-pref-row">
                  <input
                    type="radio"
                    name={`vis-${id}`}
                    checked={rule.visibility === "public"}
                    onChange={() => update(id, { visibility: "public" })}
                  />
                  Public
                </label>
                <label className="notif-pref-row">
                  <input
                    type="radio"
                    name={`vis-${id}`}
                    checked={rule.visibility === "private"}
                    onChange={() => update(id, { visibility: "private" })}
                  />
                  Private
                </label>
              </fieldset>
              <fieldset style={{ border: 0, padding: 0 }}>
                <legend>Watermark</legend>
                <label className="notif-pref-row">
                  <input
                    type="radio"
                    name={`wm-${id}`}
                    checked={rule.watermark}
                    onChange={() => update(id, { watermark: true })}
                  />
                  Enabled
                </label>
                <label className="notif-pref-row">
                  <input
                    type="radio"
                    name={`wm-${id}`}
                    checked={!rule.watermark}
                    onChange={() => update(id, { watermark: false })}
                  />
                  Disabled
                </label>
              </fieldset>
              <p className="muted">Download: Disabled</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
