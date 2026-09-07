"use client";

import Link from "next/link";
import { withBase } from "@/lib/base";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { StaggerChildren, StaggerItem } from "@/components/motion";
import { CinematicImage } from "@/components/motion/CinematicImage";

const TEMPLE_PHOTOS: Record<string, string> = {
  "Sri Ramalayam": "/brand/rama-navami-hero.webp",
  "Sri Mathamma Temple": "/brand/mathamma-hero.webp",
  "Sri Devapatlamma Temple": "/brand/devapatlamma-hero.webp",
  "Sri Mulasthanamma Temple": "/brand/mulasthanamma.webp",
};

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
                  <ProtectedMedia>
                    <img
                      src={withBase(TEMPLE_PHOTOS[temple.name])}
                      alt=""
                      width={400}
                      height={280}
                      loading="lazy"
                      draggable={false}
                    />
                  </ProtectedMedia>
                ) : (
                  <span className="home-temple-photo-empty">
                    {t("person.infoNotProvided")}
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
    </section>
  );
}
