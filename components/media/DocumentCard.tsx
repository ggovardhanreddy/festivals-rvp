"use client";

import { withBase } from "@/lib/base";

export function DocumentCard({
  src,
  title,
  mime,
}: {
  src: string;
  title: string;
  mime?: string;
}) {
  const href = withBase(src);
  const isPdf = (mime || "").includes("pdf") || src.toLowerCase().endsWith(".pdf");

  return (
    <div className="doc-card glass-card">
      <p className="eyebrow">{isPdf ? "PDF" : "Document"}</p>
      <h3>{title}</h3>
      {isPdf ? (
        <iframe
          className="doc-frame"
          src={href}
          title={title}
          loading="lazy"
        />
      ) : (
        <p className="muted">Open or download this memory document.</p>
      )}
      <div className="btn-row">
        <a className="btn" href={href} target="_blank" rel="noreferrer">
          Open
        </a>
        <a className="btn ghost" href={href} download>
          Download
        </a>
      </div>
    </div>
  );
}
