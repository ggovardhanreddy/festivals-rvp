"use client";

import { Users, Award, Star, Rocket } from "lucide-react";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";

type Stat = {
  value: number;
  label: string;
  icon: "legacy" | "core" | "nextgen" | "total";
};

const ICONS = {
  legacy: Award,
  core: Star,
  nextgen: Rocket,
  total: Users,
} as const;

export function StatsOverview({ stats }: { stats: Stat[] }) {
  return (
    <Reveal className="section home-stats" id="overview">
      <div className="section-head">
        <div>
          <p className="eyebrow">At a glance</p>
          <h2>Our community in numbers</h2>
        </div>
      </div>
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = ICONS[stat.icon];
          return (
            <div
              key={stat.label}
              className="stat-card"
              data-stat={stat.icon}
            >
              <div className="stat-card-icon" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <Counter value={stat.value} label={stat.label} />
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
