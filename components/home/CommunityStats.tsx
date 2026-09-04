"use client";

import Link from "next/link";
import { Award, Rocket, Star, Users } from "lucide-react";
import { Counter } from "@/components/Counter";
import { useUiLang } from "@/components/i18n/LanguageProvider";
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
  const { t } = useUiLang();
  const hasData = stats.some((s) => s.value > 0);

  return (
    <section
      className="home-panel home-community"
      aria-labelledby="home-community-heading"
    >
      <p className="eyebrow">{t("home.eyebrow.people")}</p>
      <h2 id="home-community-heading">{t("home.ourCommunity")}</h2>
      <p className="home-panel-lede">{t("home.community.lede")}</p>

      {hasData ? (
        <ul className="community-stat-grid">
          {stats.map((stat) => {
            const Icon = ICONS[stat.key];
            return (
              <li key={stat.key} className="community-stat" data-stat={stat.key}>
                <span className="community-stat-icon" aria-hidden>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <Counter
                  value={stat.value}
                  label={t(`home.stat.${stat.key}`, stat.label)}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="home-empty" role="status">
          {loading
            ? t("home.community.loading")
            : t("home.community.unavailable")}
        </p>
      )}

      <div className="home-panel-actions">
        <Link className="btn" href="/people/">
          {t("home.meetOurPeople")} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
