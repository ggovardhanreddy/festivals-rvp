"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { withBase } from "@/lib/base";
import {
  HERITAGE_CATEGORIES,
  loadHeritageSeed,
  newCommunityId,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { HeritageCategory, HeritageItem } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import { ProtectedMedia } from "@/components/media/ProtectedMedia";

const SEED = loadHeritageSeed();

export function HeritagePage() {
  const { session } = useMemberAuth();
  const { items, loading, submitItem, refresh } = useCommunityList<HeritageItem>(
    "heritage",
    SEED,
    { approvedOnly: true },
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HeritageCategory | "all">("all");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cat, setCat] = useState<HeritageCategory>("Village History");
  const [date, setDate] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<HeritageItem["mediaType"]>("image");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return `${item.title} ${item.description}`.toLowerCase().includes(q);
    });
  }, [items, query, category]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const item: HeritageItem = {
        id: newCommunityId("heritage"),
        title: title.trim(),
        description: description.trim(),
        category: cat,
        date: date || undefined,
        mediaUrl: mediaUrl.trim() || null,
        mediaType,
        status: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: session?.memberId,
        submittedName: session?.name,
      };
      await submitItem(item);
      setSubmitted(true);
      setTitle("");
      setDescription("");
      setMediaUrl("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="heritage-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Memory keepers</p>
            <h1>Heritage Archive</h1>
            <p className="lede">
              Historical photographs, temple and village history, cultural
              traditions, oral histories, festival memories, documents, audio,
              and video — preserved for Reddivaripalli.
            </p>
            <p className="muted" style={{ marginTop: "0.75rem" }}>
              For the full written village story — history, agriculture,
              festivals, temples, farmers, and memorials — visit{" "}
              <Link href="/about/">Our Heritage</Link>.
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">Search heritage</span>
            <input
              type="search"
              placeholder="Search archive…"
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
            {HERITAGE_CATEGORIES.map((c) => (
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

        {loading ? <p className="muted">Loading archive…</p> : null}
        <div className="directory-grid heritage-grid">
          {filtered.map((item) => (
            <article key={item.id} className="directory-card">
              {item.mediaUrl && item.mediaType === "image" ? (
                <ProtectedMedia
                  src={withBase(item.mediaUrl)}
                  alt={item.title}
                  className="heritage-media"
                />
              ) : null}
              <div>
                <p className="eyebrow">{item.category}</p>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
                {item.date ? (
                  <p className="directory-meta">{item.date}</p>
                ) : null}
                {item.mediaUrl && item.mediaType !== "image" ? (
                  <a
                    className="btn ghost"
                    href={withBase(item.mediaUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open {item.mediaType}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal className="section">
        <h2>Contribute a memory</h2>
        <p className="muted">
          Member and visitor submissions are reviewed by an administrator before
          publication.
        </p>
        {submitted ? (
          <p className="muted">Submitted — pending admin approval.</p>
        ) : (
          <form className="community-form" onSubmit={onSubmit}>
            <label>
              Title
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value as HeritageCategory)}
              >
                {HERITAGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date (optional)
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Media type
              <select
                value={mediaType}
                onChange={(e) =>
                  setMediaType(e.target.value as HeritageItem["mediaType"])
                }
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </label>
            <label>
              Media URL (optional)
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="R2 path or public URL"
              />
            </label>
            {error ? <p className="media-error">{error}</p> : null}
            <button className="btn" type="submit" disabled={busy}>
              {busy ? "Submitting…" : "Submit for approval"}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
