"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";
import { isDisplayableImageUrl } from "@/lib/media-formats";

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

function previewUrl(media: Media): string | null {
  if (media.type === "image") {
    const thumb = media.thumb || media.file;
    return isDisplayableImageUrl(thumb) ? thumb : null;
  }
  if (media.poster && isDisplayableImageUrl(media.poster)) return media.poster;
  if (media.thumb && isDisplayableImageUrl(media.thumb)) return media.thumb;
  return null;
}

function TilePreview({ media }: { media: Media }) {
  const src = previewUrl(media);
  if (src) {
    return (
      <>
        <img
          src={withBase(src)}
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
        {media.type !== "image" ? (
          <span className="tile-badge">{media.type}</span>
        ) : null}
      </>
    );
  }
  return (
    <div className="tile-kind">
      <p className="eyebrow">{media.type}</p>
      <h3>{media.title}</h3>
    </div>
  );
}

function ImageLightbox({
  media,
  zoom,
  pan,
  onPan,
  reduce,
}: {
  media: Media;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (next: { x: number; y: number }) => void;
  reduce: boolean | null;
}) {
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const src = isDisplayableImageUrl(media.file)
    ? media.file
    : media.thumb && isDisplayableImageUrl(media.thumb)
      ? media.thumb
      : null;

  if (!src) {
    return (
      <p className="media-error">
        This image is not available in a browser-friendly format yet.
      </p>
    );
  }

  return (
    <div
      className="lightbox-image-stage"
      onPointerDown={(e) => {
        if (zoom <= 1) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        drag.current = {
          x: e.clientX,
          y: e.clientY,
          px: pan.x,
          py: pan.y,
        };
      }}
      onPointerMove={(e) => {
        if (!drag.current || zoom <= 1) return;
        onPan({
          x: drag.current.px + (e.clientX - drag.current.x),
          y: drag.current.py + (e.clientY - drag.current.y),
        });
      }}
      onPointerUp={() => {
        drag.current = null;
      }}
    >
      <img
        src={withBase(src)}
        alt={media.title || "Memory photograph"}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: reduce ? undefined : "transform 0.2s ease",
          cursor: zoom > 1 ? "grab" : "default",
        }}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

function LightboxBody({
  media,
  zoom,
  pan,
  onPan,
  reduce,
}: {
  media: Media;
  zoom: number;
  pan: { x: number; y: number };
  onPan: (next: { x: number; y: number }) => void;
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
    <ImageLightbox
      media={media}
      zoom={zoom}
      pan={pan}
      onPan={onPan}
      reduce={reduce}
    />
  );
}

export function Gallery({
  items,
  allowDownload = false,
}: {
  items: Media[];
  allowDownload?: boolean;
}) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<number | null>(null);
  const [shown, setShown] = useState(18);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState<"all" | Media["type"]>("all");
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const filtered =
    filter === "all" ? items : items.filter((item) => item.type === filter);
  const visible = filtered.slice(0, shown);

  const close = useCallback(() => {
    setSelected(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const next = useCallback(() => {
    setSelected((i) =>
      i === null ? null : (i + 1) % Math.max(filtered.length, 1),
    );
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [filtered.length]);
  const prev = useCallback(() => {
    setSelected((i) =>
      i === null
        ? null
        : (i - 1 + filtered.length) % Math.max(filtered.length, 1),
    );
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [filtered.length]);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "+" || event.key === "=") {
        setZoom((z) => Math.min(3, z + 0.25));
      }
      if (event.key === "-") {
        setZoom((z) => {
          const nextZ = Math.max(1, z - 0.25);
          if (nextZ === 1) setPan({ x: 0, y: 0 });
          return nextZ;
        });
      }
      if (event.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close, next, prev]);

  if (!items.length) {
    return (
      <p className="muted">
        No memories here yet. Add media into the GitHub{" "}
        <code>content/</code> folder, then run sync.
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
            onTouchStart={(e) => {
              const t = e.changedTouches[0];
              if (!t) return;
              touchStart.current = { x: t.clientX, y: t.clientY };
            }}
            onTouchEnd={(e) => {
              const start = touchStart.current;
              const t = e.changedTouches[0];
              touchStart.current = null;
              if (!start || !t || zoom > 1) return;
              const dx = t.clientX - start.x;
              const dy = t.clientY - start.y;
              if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
              if (dx < 0) next();
              else prev();
            }}
          >
            <m.div
              className="lightbox-frame"
              initial={reduce ? false : { scale: 0.94, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LightboxBody
                media={current}
                zoom={zoom}
                pan={pan}
                onPan={setPan}
                reduce={reduce}
              />
              <p style={{ color: "#f7efe4", margin: 0 }}>
                {current.date} · {current.title} · {current.type}
              </p>
              <div className="lightbox-actions">
                <button className="btn ghost" type="button" onClick={prev}>
                  Previous
                </button>
                {current.type === "image" && (
                  <>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                    >
                      Zoom in
                    </button>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setZoom((z) => {
                          const nextZ = Math.max(1, z - 0.25);
                          if (nextZ === 1) setPan({ x: 0, y: 0 });
                          return nextZ;
                        });
                      }}
                    >
                      Zoom out
                    </button>
                  </>
                )}
                {allowDownload && isDisplayableImageUrl(current.file) ? (
                  <a
                    className="btn ghost"
                    href={withBase(current.file)}
                    download
                    target="_blank"
                    rel="noreferrer"
                  >
                    Download
                  </a>
                ) : null}
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
