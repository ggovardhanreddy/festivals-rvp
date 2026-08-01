"use client";

import { m, useReducedMotion } from "framer-motion";
import { withBase } from "@/lib/base";
import { SITE_NAME } from "@/lib/site";

export function YouthPortrait() {
  const reduce = useReducedMotion();
  return (
    <section className="section youth-portrait">
      <div className="section-head">
        <div>
          <p className="eyebrow">{SITE_NAME}</p>
          <h2>The faces that keep home alive</h2>
          <p className="lede">
            Friends of Kondreddigaripalli — the youth who gather, remember, and
            carry the village forward.
          </p>
        </div>
      </div>
      <m.figure
        className="youth-portrait-frame"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={withBase("/brand/rvp-youth-photo.webp")}
          alt={`${SITE_NAME} — friends together in Kondreddigaripalli`}
          width={1400}
          height={900}
        />
        <figcaption className="muted">RVP Youth · Kondreddigaripalli</figcaption>
      </m.figure>
    </section>
  );
}
