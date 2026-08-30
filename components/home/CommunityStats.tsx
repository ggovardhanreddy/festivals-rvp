"use client";

import Link from "next/link";
import { Award, Rocket, Star, Users } from "lucide-react";
import { Counter } from "@/components/Counter";
import type { CommunityStat } from "@/lib/member-stats";

const ICONS = {
  total: Users,
  legacy: Award,
  core: Star,
  nextgen: Rocket,
} as const;

/**
 * Our Community, in four numbers.
 *
 * Every value is derived from the member roster (content/data/members.json
 * merged with the admin overlay) — nothing here is typed by hand, so adding a
 * member moves these figures on the next render. When the roster genuinely has
 * not loaded, the block renders a loading state rather than four zeros, because
 * "0 Total Members" is not a neutral placeholder: it is a false statement about
 * the village.
 */
export function CommunityStats({
  stats,
  loading = false,
}: {
  stats: CommunityStat[];
  loading?: boolean;
}) {
  const hasData = stats.some((s) => s.value > 0);

  return (
    <section
      className="home-panel home-community"
      aria-labelledby="home-community-heading"
    >
      <p className="eyebrow">People</p>
      <h2 id="home-community-heading">Our Community</h2>
      <p className="home-panel-lede">
        Legacy Circle, Core Members and Next Generation — the people who steward
        Reddivaripalli.
      </p>

      {hasData ? (
        <ul className="community-stat-grid">
          {stats.map((stat) => {
            const Icon = ICONS[stat.key];
            return (
              <li key={stat.key} className="community-stat" data-stat={stat.key}>
                <span className="community-stat-icon" aria-hidden>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <Counter value={stat.value} label={stat.label} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty" role="status">
          {loading
            ? "Loading community numbers…"
            : "Member numbers are being updated."}
        </p>
      )}

      <div className="home-panel-actions">
        <Link className="btn" href="/members/">
          Meet Our People <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
