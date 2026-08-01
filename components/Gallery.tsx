"use client";

import { useState } from "react";
import type { Media } from "@/lib/types";
import { withBase } from "@/lib/base";

export function Gallery({ items }: { items: Media[] }) {
  const [selected, setSelected] = useState<Media | null>(null);
  const [shown, setShown] = useState(24);
  const visible = items.slice(0, shown);

  return (
    <>
      <div className="masonry" onContextMenu={(e) => e.preventDefault()}>
        {visible.map((m) => (
          <button className="tile" key={m.id} onClick={() => setSelected(m)}>
            {m.type === "image" ? (
              <img
                src={withBase(m.thumb || m.file)}
                alt={m.title}
                loading="lazy"
                draggable={false}
              />
            ) : (
              <div className="file">
                {m.type === "video" ? "▶ Video" : "▧ Document"}
                <br />
                <small>{m.title}</small>
              </div>
            )}
            <span>
              {m.favorite ? "♡ " : ""}
              {m.title}
            </span>
          </button>
        ))}
      </div>
      {shown < items.length && (
        <button className="more" onClick={() => setShown((s) => s + 24)}>
          Load more memories
        </button>
      )}
      {selected && (
        <div className="lightbox" onClick={() => setSelected(null)}>
          <button aria-label="Close" onClick={() => setSelected(null)}>
            ×
          </button>
          {selected.type === "image" ? (
            <img src={withBase(selected.file)} alt={selected.title} />
          ) : (
            <p>{selected.title}</p>
          )}
          <p>
            {selected.date} · {selected.title}
          </p>
        </div>
      )}
    </>
  );
}
