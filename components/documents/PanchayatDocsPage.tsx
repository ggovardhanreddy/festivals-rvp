"use client";

import { useMemo, useState } from "react";
import {
  loadPanchayatDocsSeed,
  PANCHAYAT_DOC_CATEGORIES,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { PanchayatDocCategory, PanchayatDocument } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { DocumentCard } from "@/components/media/DocumentCard";

const SEED = loadPanchayatDocsSeed();

export function PanchayatDocsPage() {
  const { items, loading } = useCommunityList<PanchayatDocument>(
    "panchayat-docs",
    SEED,
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PanchayatDocCategory | "all">("all");
  const [preview, setPreview] = useState<PanchayatDocument | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...items]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((doc) => {
        if (category !== "all" && doc.category !== category) return false;
        if (!q) return true;
        return `${doc.title} ${doc.description || ""} ${doc.category}`
          .toLowerCase()
          .includes(q);
      });
  }, [items, query, category]);

  return (
    <div className="panchayat-docs-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Transparency</p>
            <h1>Panchayat Documents</h1>
            <p className="lede">
              Notices, minutes, schemes, and public forms. Only administrators
              can upload or remove documents (stored in Cloudflare R2).
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">Search documents</span>
            <input
              type="search"
              placeholder="Search documents…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="dev-filters" role="tablist">
            <button
              type="button"
              className="dev-filter-btn"
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              All
            </button>
            {PANCHAYAT_DOC_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="dev-filter-btn"
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="muted">Loading documents…</p> : null}

        <div className="directory-grid">
          {filtered.map((doc) => (
            <article key={doc.id} className="directory-card">
              <div>
                <p className="eyebrow">{doc.category}</p>
                <h3>{doc.title}</h3>
                {doc.description ? (
                  <p className="muted">{doc.description}</p>
                ) : null}
                <p className="directory-meta">{doc.date}</p>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setPreview(doc)}
                >
                  Preview PDF
                </button>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && !loading ? (
          <p className="muted">
            No documents published yet. Administrators can upload from the Admin
            dashboard.
          </p>
        ) : null}
      </Reveal>

      {preview ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
        >
          <div
            className="lightbox-frame"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "56rem" }}
          >
            <DocumentCard
              src={preview.fileKey}
              title={preview.title}
              mime={preview.mime || "application/pdf"}
              allowDownload={false}
            />
            <button
              type="button"
              className="btn ghost"
              onClick={() => setPreview(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
