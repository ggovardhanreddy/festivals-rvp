"use client";

import { withBase } from "@/lib/base";

/** Layered night village depth — stars, fog, temple silhouette, trees. */
export function NightVillageBackdrop({ brighten = false }: { brighten?: boolean }) {
  return (
    <div className={`night-village ${brighten ? "is-bright" : ""}`} aria-hidden>
      <div className="night-village-sky" />
      <div className="night-village-stars" />
      <div className="night-village-moon" />
      <div className="night-village-clouds" />
      <div
        className="night-village-aerial"
        style={{ backgroundImage: `url(${withBase("/brand/village-night-sky.webp")})` }}
      />
      <div className="night-village-rays" />
      <div className="night-village-fog night-village-fog-a" />
      <div className="night-village-fog night-village-fog-b" />
      <div className="night-village-birds">
        <span />
        <span />
        <span />
      </div>
      <div className="night-village-leaves">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <svg className="night-village-silhouettes" viewBox="0 0 1440 320" preserveAspectRatio="none">
        <path
          fill="#0a1410"
          d="M0,224 L80,210 C160,190 200,160 280,168 C360,176 400,220 480,200 C560,180 620,120 720,128 C820,136 860,190 940,186 C1020,182 1080,130 1160,140 C1240,150 1320,190 1440,170 L1440,320 L0,320 Z"
        />
        <path
          fill="#07100d"
          d="M0,260 L120,248 C220,236 280,210 360,220 C460,234 520,270 620,255 C740,236 800,200 900,210 C1020,224 1100,260 1200,248 C1300,236 1380,250 1440,242 L1440,320 L0,320 Z"
        />
        {/* Temple peak */}
        <path fill="#0c1813" d="M690,210 L720,120 L750,210 Z" />
        <rect x="708" y="200" width="24" height="40" fill="#0c1813" />
        {/* Soft tree clusters */}
        <ellipse cx="180" cy="250" rx="28" ry="42" fill="#081510" />
        <ellipse cx="1280" cy="245" rx="34" ry="48" fill="#081510" />
        <ellipse cx="420" cy="255" rx="22" ry="36" fill="#0a1612" />
      </svg>
      <div className="night-village-ground" />
      <div className="night-village-particles" />
    </div>
  );
}
