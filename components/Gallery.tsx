"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";

const VideoPlayer = dynamic(
  () => import("./media/VideoPlayer").then((m) => m.VideoPlayer),
  { ssr: false },
);
const AudioPlayer = dynamic(
  () => import("./media/AudioPlayer").then((m) => m.AudioPlayer),
  { ssr: false },
);
const DocumentCard = dynamic(
  () => import("./media/DocumentCard").then((m) => m.DocumentCard),
  { ssr: false },
);

function TilePreview({ media }: { media: Media }) {
  if (media.type === "image") {
    return (
      <img
        src={withBase(media.thumb || media.file)}
        alt={media.title || "Memory"}
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
    );
  }
  return (
    <div className="tile-kind">
      <p className="eyebrow">{media.type}</p>
      <h3>{media.title}</h3>
    </div>
  );
}

function LightboxBody({
  media,
  zoom,
  reduce,
}: {
  media: Media;
  zoom: number;
  reduce: boolean | null;
}) {
  if (media.type === "video") {
    return (
      <VideoPlayer
        src={media.file}
        poster={media.poster || media.thumb}
        title={media.title}
      />
    );
  }
  if (media.type === "audio") {
    return (
      <AudioPlayer
        id={media.id}
        src={media.file}
        title={media.title}
        artwork={media.thumb}
      />
    );
  }
  if (media.type === "document") {
    return (
      <DocumentCard src={media.file} title={media.title} mime={media.mime} />
    );
  }
  return (
    <img
      src={withBase(media.file)}
      alt={media.title || "Memory photograph"}
      style={{
        transform: `scale(${zoom})`,
        transition: reduce ? undefined : "transform 0.25s ease",
      }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

export function Gallery({ items }: { items: Media[] }) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [shown, setShown] = useState(18);
  const [zoom, setZoom] = useState(1);
  const [filter, setFilter] = useState<"all" | Media["type"]>("all");
  const filtered =
    filter === "all" ? items : items.filter((item) => item.type === filter);
  const visible = filtered.slice(0, shown);

  const close = useCallback(() => {
    setSelected(null);
    setZoom(1);
  }, []);
  const next = useCallback(
    () =>
      setSelected((i) =>
        i === null ? null : (i + 1) % Math.max(filtered.length, 1),
      ),
    [filtered.length],
  );
  const prev = useCallback(
    () =>
      setSelected((i) =>
        i === null
          ? null
          : (i - 1 + filtered.length) % Math.max(filtered.length, 1),
      ),
    [filtered.length],
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "+" || event.key === "=")
        setZoom((z) => Math.min(2.5, z + 0.2));
      if (event.key === "-") setZoom((z) => Math.max(1, z - 0.2));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close, next, prev]);

  if (!items.length) {
    return (
      <p className="muted">
        No memories here yet. Upload media into the GitHub content folder.
      </p>
    );
  }

  const current = selected !== null ? filtered[selected] : null;

  return (
    <>
      <div className="search-filters" role="toolbar" aria-label="Media filters">
        {(["all", "image", "video", "audio", "document"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={`btn ghost ${filter === key ? "is-selected" : ""}`}
            onClick={() => {
              setFilter(key);
              setShown(18);
              setSelected(null);
            }}
          >
            {key === "all" ? "All" : key}
          </button>
        ))}
      </div>

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
            <TilePreview media={media} />
            <span>{media.title}</span>
          </m.button>
        ))}
      </div>

      {shown < filtered.length && (
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button
            className="btn ghost"
            type="button"
            onClick={() => setShown((n) => n + 18)}
          >
            Load more memories
          </button>
        </div>
      )}

      <AnimatePresence>
        {current && selected !== null && (
          <m.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
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
              <LightboxBody media={current} zoom={zoom} reduce={reduce} />
              <p style={{ color: "#f7efe4", margin: 0 }}>
                {current.date} · {current.title} · {current.type}
              </p>
              <div className="lightbox-actions">
                <button className="btn ghost" type="button" onClick={prev}>
                  Previous
                </button>
                {current.type === "image" && (
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  >
                    Zoom
                  </button>
                )}
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
