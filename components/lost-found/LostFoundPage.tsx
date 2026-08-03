"use client";

import { FormEvent, useMemo, useState } from "react";
import { withBase } from "@/lib/base";
import {
  LOST_FOUND_CATEGORIES,
  loadLostFoundSeed,
  newCommunityId,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { LostFoundCategory, LostFoundItem } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";

const SEED = loadLostFoundSeed();

export function LostFoundPage() {
  const { session } = useMemberAuth();
  const { items, loading, submitItem, refresh } = useCommunityList<LostFoundItem>(
    "lost-found",
    SEED,
    { approvedOnly: true },
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<LostFoundCategory | "all">("all");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cat, setCat] = useState<LostFoundCategory>("Lost Documents");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("Reddivaripalli");
  const [contact, setContact] = useState("");
  const [image, setImage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      return `${item.title} ${item.description} ${item.location}`
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, category]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const item: LostFoundItem = {
        id: newCommunityId("lf"),
        title: title.trim(),
        description: description.trim(),
        category: cat,
        date,
        location: location.trim(),
        image: image.trim() || null,
        contact: contact.trim(),
        status: "pending",
        submittedAt: new Date().toISOString(),
        submittedBy: session?.memberId,
      };
      await submitItem(item);
      setSubmitted(true);
      setTitle("");
      setDescription("");
      setContact("");
      setImage("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lost-found-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Community help</p>
            <h1>Lost &amp; Found</h1>
            <p className="lede">
              Report lost documents, phones, keys, wallets, livestock, or found
              items. Submissions appear after administrator approval.
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">Search</span>
            <input
              type="search"
              placeholder="Search notices…"
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
            {LOST_FOUND_CATEGORIES.map((c) => (
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

        {loading ? <p className="muted">Loading…</p> : null}
        <div className="directory-grid">
          {filtered.map((item) => (
            <article key={item.id} className="directory-card">
              {item.image ? (
                <div className="directory-photo">
                  <img
                    src={withBase(item.image)}
                    alt=""
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              ) : null}
              <div>
                <p className="eyebrow">{item.category}</p>
                <h3>{item.title}</h3>
                <p className="muted">{item.description}</p>
                <p className="directory-meta">
                  {item.date} · {item.location}
                </p>
                <p className="directory-meta">Contact · {item.contact}</p>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && !loading ? (
          <p className="muted">No public notices yet.</p>
        ) : null}
      </Reveal>

      <Reveal className="section">
        <h2>Report an item</h2>
        {submitted ? (
          <p className="muted">
            Thank you. Your notice was submitted and awaits admin approval.
          </p>
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
                onChange={(e) => setCat(e.target.value as LostFoundCategory)}
              >
                {LOST_FOUND_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Location
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
            <label>
              Contact details
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Mobile or WhatsApp"
              />
            </label>
            <label>
              Image URL (optional)
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/… or R2 URL"
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
