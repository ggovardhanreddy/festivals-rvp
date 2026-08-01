"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";

export function Gallery({ items }: { items: Media[] }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [shown, setShown] = useState(18);
  const visible = items.slice(0, shown);

  const close = useCallback(() => setSelected(null), []);
  const next = useCallback(
    () =>
      setSelected((i) =>
        i === null ? null : (i + 1) % Math.max(items.length, 1),
      ),
    [items.length],
  );
  const prev = useCallback(
    () =>
      setSelected((i) =>
        i === null
          ? null
          : (i - 1 + items.length) % Math.max(items.length, 1),
      ),
    [items.length],
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close, next, prev]);

  useEffect(() => {
    if (selected === null) return;
    let startX = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.changedTouches[0]?.clientX || 0;
    };
    const onEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0]?.clientX || 0;
      const delta = endX - startX;
      if (Math.abs(delta) < 40) return;
      if (delta < 0) next();
      else prev();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [selected, next, prev]);

  if (!items.length) {
    return <p className="muted">No memories here yet. Import photos to begin.</p>;
  }

  const current = selected !== null ? items[selected] : null;

  return (
    <>
      <div className="masonry" onContextMenu={(e) => e.preventDefault()}>
        {visible.map((media, index) => (
          <m.button
            key={media.id}
            className="tile"
            type="button"
            onClick={() => setSelected(index)}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3) }}
          >
            {media.type === "image" ? (
              <img
                src={withBase(media.thumb || media.file)}
                alt={media.title}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={
                  media.blurDataURL
                    ? {
                        backgroundImage: `url(${media.blurDataURL})`,
                        backgroundSize: "cover",
                      }
                    : undefined
                }
              />
            ) : (
              <div className="card-body">
                <h3>Video</h3>
                <p className="muted">{media.title}</p>
              </div>
            )}
            <span>{media.title}</span>
          </m.button>
        ))}
      </div>

      {shown < items.length && (
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button className="btn ghost" type="button" onClick={() => setShown((n) => n + 18)}>
            Load more memories
          </button>
        </div>
      )}

      <AnimatePresence>
        {current && selected !== null && (
          <m.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <m.div
              className="lightbox-frame"
              initial={reduce ? false : { scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={withBase(current.file)} alt={current.title} />
              <p style={{ color: "#f7efe4", margin: 0 }}>
                {current.date} · {current.title}
              </p>
              <div className="lightbox-actions">
                <button className="btn ghost" type="button" onClick={prev}>
                  Previous
                </button>
                <button className="btn ghost" type="button" onClick={close}>
                  Close
                </button>
                <button className="btn" type="button" onClick={next}>
                  Next
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
