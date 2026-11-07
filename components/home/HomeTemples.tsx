"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { withBase } from "@/lib/base";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { CinematicImage } from "@/components/motion/CinematicImage";
import { Progressive3D } from "@/components/three/Progressive3D";

const TEMPLE_PHOTOS: Record<string, string> = {
  "Sri Ramalayam": "/brand/rama-navami-hero.webp",
  "Sri Mathamma Temple": "/brand/mathamma-hero.webp",
  "Sri Devapatlamma Temple": "/brand/devapatlamma-hero.webp",
  "Sri Mulasthanamma Temple": "/brand/mulasthanamma.webp",
};
const TEMPLE_FALLBACK = "/logo/logo-mark.webp";
const TempleShowcaseScene = dynamic(
  () =>
    import("@/components/three/TempleShowcaseScene").then(
      (m) => m.TempleShowcaseScene,
    ),
  { ssr: false },
);
const VillageMapScene = dynamic(
  () => import("@/components/three/VillageMapScene").then((m) => m.VillageMapScene),
  { ssr: false },
);

export function HomeTemples() {
  const { t } = useUiLang();
  const temples = loadVillageHeritage().temples.items.slice(0, 5);

  return (
    <section className="section home-temples" aria-labelledby="home-temples-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("nav.temples")}</p>
          <h2 id="home-temples-heading">{t("home.ourTemples")}</h2>
        </div>
        <Link className="btn ghost" href="/temples/">
          {t("home.viewTemples")} <span aria-hidden>→</span>
        </Link>
      </div>
      {/* Each temple's photograph arrives after the one before it, so the row
          reads across rather than snapping in as a block. */}
      <StaggerChildren as="ul" className="home-temple-grid" safe>
        {temples.map((temple) => (
          <StaggerItem as="li" key={temple.name}>
            <Link className="home-temple-card" href="/temples/">
              <CinematicImage className="home-temple-media" mask hover={1.04}>
                {TEMPLE_PHOTOS[temple.name] ? (
                  // CinematicImage renders a <span>, so the wrapper must be
                  // phrasing content too.
                  <ProtectedMedia as="span">
                    <img
                      src={withBase(TEMPLE_PHOTOS[temple.name])}
                      alt={`${temple.name} — Reddivaripalli`}
                      width={400}
                      height={280}
                      loading="lazy"
                      draggable={false}
                      onError={(event) => {
                        event.currentTarget.src = withBase(TEMPLE_FALLBACK);
                      }}
                    />
                  </ProtectedMedia>
                ) : (
                  <span className="home-temple-photo-empty">
                    {t("person.infoNotProvided", "Image not yet available")}
                  </span>
                )}
              </CinematicImage>
              <span className="home-temple-body">
                <strong>{temple.name}</strong>
                <span className="muted">{temple.note}</span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerChildren>
      <div className="home-temple-3d-grid">
        <Progressive3D
          className="home-temple-3d-card"
          fallback={<div className="home-temple-3d-fallback" />}
        >
          <TempleShowcaseScene />
        </Progressive3D>
        <Progressive3D
          className="home-temple-3d-card"
          fallback={<div className="home-temple-3d-fallback" />}
        >
          <VillageMapScene />
        </Progressive3D>
      </div>
    </section>
  );
}
