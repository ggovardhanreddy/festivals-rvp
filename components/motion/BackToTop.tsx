"use client";

/**
 * Return to the top, once there is a top to return to.
 *
 * Appears past one viewport of scrolling and leaves again near the top, so it
 * is never in the way of the hero. A real button, focusable and labelled,
 * rather than a decorative chevron: on a long family tree this is the fastest
 * way back to the navigation.
 *
 * Visibility is toggled by class from a rAF-throttled scroll listener. The
 * element stays mounted so it can transition rather than pop.
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useUiLang } from "@/components/i18n/LanguageProvider";

export function BackToTop() {
  const [shown, setShown] = useState(false);
  const frame = useRef(0);
  const reduce = useReducedMotion();
  const { t } = useUiLang();

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        setShown(window.scrollY > window.innerHeight * 0.9);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className="back-to-top"
      data-shown={shown || undefined}
      // Hidden from the tab order until it is actually on screen, so keyboard
      // users are not sent to an invisible control.
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
      aria-label={t("common.backToTop", "Back to top")}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
      }
    >
      <span aria-hidden>↑</span>
    </button>
  );
}
