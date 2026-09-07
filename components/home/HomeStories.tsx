"use client";

import Link from "next/link";
import { loadVillageHeritage } from "@/lib/village-heritage";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { FadeUp, DIST } from "@/components/motion";

export function HomeStories() {
  const { t } = useUiLang();
  const heritage = loadVillageHeritage();

  return (
    <section className="section home-stories" aria-labelledby="home-stories-heading">
      <div className="home-section-head">
        <div>
          <p className="eyebrow">{t("nav.stories")}</p>
          <h2 id="home-stories-heading">{t("home.villageStories")}</h2>
        </div>
        <Link className="btn ghost" href="/stories/">
          {t("home.viewStories")} <span aria-hidden>→</span>
        </Link>
      </div>
      <div className="home-stories-grid">
        {/*
          The emotional close of the homepage. The man who founded the village
          arrives first and alone; the man who followed him arrives after a
          beat. Neither record carries a photograph, so this is the words --
          built to take a portrait the day one exists, and until then not
          pretending to have one.
        */}
        <FadeUp as="article" className="home-story-card" distance={DIST.mid} safe>
          <p className="eyebrow">{heritage.memorial.founder.role}</p>
          <h3>{heritage.memorial.founder.name}</h3>
          <p className="muted">{heritage.memorial.founder.bio}</p>
        </FadeUp>
        <FadeUp
          as="article"
          className="home-story-card"
          distance={DIST.mid}
          delay={0.22}
          safe
        >
          <p className="eyebrow">{heritage.memorial.successor.role}</p>
          <h3>{heritage.memorial.successor.name}</h3>
          <p className="muted">{heritage.memorial.successor.bio}</p>
        </FadeUp>
      </div>
    </section>
  );
}
