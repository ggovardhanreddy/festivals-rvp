"use client";

import { useEffect, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import type { AnalyticsHit } from "@/lib/types";

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function countBy(hits: AnalyticsHit[], keyFn: (h: AnalyticsHit) => string) {
  const map = new Map<string, number>();
  for (const hit of hits) {
    const key = keyFn(hit);
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function BarList({
  rows,
  max = 8,
}: {
  rows: [string, number][];
  max?: number;
}) {
  const top = rows.slice(0, max);
  const peak = top[0]?.[1] || 1;
  return (
    <ul className="analytics-bars">
      {top.map(([label, value]) => (
        <li key={label}>
          <div className="analytics-bar-meta">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
          <div className="analytics-bar-track">
            <div
              className="analytics-bar-fill"
              style={{ width: `${Math.max(6, (value / peak) * 100)}%` }}
            />
          </div>
        </li>
      ))}
      {!top.length ? <li className="muted">No data yet.</li> : null}
    </ul>
  );
}

export function AnalyticsPanel() {
  const [hits, setHits] = useState<AnalyticsHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(withBase("/api/community/analytics"), {
          credentials: "include",
          cache: "no-store",
        });
        const data = (await res.json()) as { hits?: AnalyticsHit[]; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed to load analytics");
        if (!cancelled) setHits(data.hits || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Analytics unavailable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const day = startOfDay(now);
    const week = now - 7 * 86_400_000;
    const month = now - 30 * 86_400_000;
    const pageviews = hits.filter((h) => !h.kind || h.kind === "pageview");
    const daily = pageviews.filter((h) => h.ts >= day).length;
    const weekly = pageviews.filter((h) => h.ts >= week).length;
    const monthly = pageviews.filter((h) => h.ts >= month).length;
    const pages = countBy(pageviews, (h) => h.path || "/");
    const festivals = pages.filter(([p]) =>
      /sankranthi|vinayaka|mathamma|devapatlamma|rama|varalakshmi|ugadi|deepavali|dasara/i.test(
        p,
      ),
    );
    const albums = pages.filter(([p]) => /gallery|years|rvp-birthdays|fun-trips/i.test(p));
    const devices = countBy(pageviews, (h) => h.device || "unknown");
    const browsers = countBy(pageviews, (h) => h.browser || "unknown");
    const searches = hits.filter((h) => h.kind === "search");
    const searchQueries = countBy(searches, (h) => h.meta || "(empty)");
    const notifClicks = hits.filter((h) => h.kind === "notif-click").length;
    const uploads = hits.filter((h) => h.kind === "upload").length;
    return {
      daily,
      weekly,
      monthly,
      total: pageviews.length,
      pages,
      festivals,
      albums,
      devices,
      browsers,
      searchQueries,
      notifClicks,
      uploads,
    };
  }, [hits]);

  if (loading) return <p className="muted">Loading analytics…</p>;
  if (error) return <p className="media-error">{error}</p>;

  return (
    <div className="analytics-panel">
      <div className="analytics-cards">
        <article>
          <p className="eyebrow">Today</p>
          <strong>{stats.daily}</strong>
          <span>Daily visitors</span>
        </article>
        <article>
          <p className="eyebrow">7 days</p>
          <strong>{stats.weekly}</strong>
          <span>Weekly visitors</span>
        </article>
        <article>
          <p className="eyebrow">30 days</p>
          <strong>{stats.monthly}</strong>
          <span>Monthly visitors</span>
        </article>
        <article>
          <p className="eyebrow">All time</p>
          <strong>{stats.total}</strong>
          <span>Total visitors</span>
        </article>
        <article>
          <p className="eyebrow">Notifications</p>
          <strong>{stats.notifClicks}</strong>
          <span>Notification clicks</span>
        </article>
        <article>
          <p className="eyebrow">Uploads</p>
          <strong>{stats.uploads}</strong>
          <span>Upload events</span>
        </article>
      </div>

      <div className="analytics-grid">
        <section>
          <h3>Most viewed pages</h3>
          <BarList rows={stats.pages} />
        </section>
        <section>
          <h3>Most viewed festivals</h3>
          <BarList rows={stats.festivals} />
        </section>
        <section>
          <h3>Gallery / album paths</h3>
          <BarList rows={stats.albums} />
        </section>
        <section>
          <h3>Device types</h3>
          <BarList rows={stats.devices} />
        </section>
        <section>
          <h3>Browser usage</h3>
          <BarList rows={stats.browsers} />
        </section>
        <section>
          <h3>Search queries</h3>
          <BarList rows={stats.searchQueries} />
        </section>
      </div>
      <p className="muted" style={{ marginTop: "1rem" }}>
        Storage usage and active members are available via Cloudflare dashboard
        (R2 metrics) and the Members page. Analytics events are stored in R2
        under <code>community/analytics.json</code>.
      </p>
    </div>
  );
}
