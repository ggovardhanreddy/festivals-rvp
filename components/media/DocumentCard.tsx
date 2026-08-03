"use client";

import { useMediaUrl } from "@/lib/use-media-url";

export function DocumentCard({
  src,
  title,
  mime,
  allowDownload = false,
}: {
  src: string;
  title: string;
  mime?: string;
  allowDownload?: boolean;
}) {
  const { url: href, loading, error } = useMediaUrl(src);
  const isPdf =
    (mime || "").includes("pdf") || src.toLowerCase().endsWith(".pdf");

  if (loading) {
    return (
      <div className="doc-card glass-card">
        <p className="muted">Loading document…</p>
      </div>
    );
  }

  if (error || !href) {
    return (
      <div className="doc-card glass-card">
        <p className="media-error">{error || "Document unavailable."}</p>
      </div>
    );
  }

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
        <p className="muted">Open this document in a new tab.</p>
      )}
      <div className="btn-row">
        <a className="btn" href={href} target="_blank" rel="noreferrer">
          Open
        </a>
        {allowDownload ? (
          <a className="btn ghost" href={href} download>
            Download
          </a>
        ) : null}
      </div>
    </div>
  );
}
