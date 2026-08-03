"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BLOOD_GROUPS,
  loadBloodDonorsSeed,
  newCommunityId,
} from "@/lib/community";
import { useCommunityList } from "@/lib/use-community";
import type { BloodDonor, BloodGroup } from "@/lib/types";
import { Reveal } from "@/components/Reveal";
import { useMemberAuth } from "@/components/auth/MemberAuthProvider";
import Link from "next/link";

const SEED = loadBloodDonorsSeed();
const VILLAGE = "Reddivaripalli";

export function BloodDonorsPage() {
  const { session } = useMemberAuth();
  const { items, loading, submitItem, refresh } = useCommunityList<BloodDonor>(
    "blood-donors",
    SEED,
    { approvedOnly: true },
  );
  const [group, setGroup] = useState<BloodGroup | "all">("all");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState(session?.name || "");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState(VILLAGE);
  const [availability, setAvailability] = useState("Available");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [showContactPublicly, setShowContactPublicly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((d) => {
      if (group !== "all" && d.bloodGroup !== group) return false;
      if (!q) return true;
      return `${d.name} ${d.village} ${d.bloodGroup}`.toLowerCase().includes(q);
    });
  }, [items, group, query]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const item: BloodDonor = {
        id: newCommunityId("bd"),
        name: name.trim(),
        bloodGroup,
        mobile: mobile.trim(),
        village: village.trim(),
        availability: availability.trim(),
        lastDonationDate: lastDonationDate || undefined,
        status: "pending",
        showContactPublicly,
        submittedAt: new Date().toISOString(),
        submittedBy: session?.memberId,
      };
      await submitItem(item);
      setSubmitted(true);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="blood-donors-page">
      <Reveal className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Emergency support</p>
            <h1>Blood Donor Directory</h1>
            <p className="lede">
              Voluntary donors from our village. Contact details stay private
              unless a donor chooses to share them. All registrations need admin
              approval.
            </p>
          </div>
        </div>

        <div className="community-toolbar">
          <label className="community-search">
            <span className="sr-only">Search donors</span>
            <input
              type="search"
              placeholder="Search donors…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="dev-filters" role="tablist" aria-label="Blood group">
            <button
              type="button"
              className="dev-filter-btn"
              aria-pressed={group === "all"}
              onClick={() => setGroup("all")}
            >
              All
            </button>
            {BLOOD_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                className="dev-filter-btn"
                aria-pressed={group === g}
                onClick={() => setGroup(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="muted">Loading donors…</p> : null}
        <div className="directory-grid">
          {filtered.map((donor) => (
            <article key={donor.id} className="directory-card blood-card">
              <div>
                <p className="blood-group-badge">{donor.bloodGroup}</p>
                <h3>{donor.name}</h3>
                <p className="muted">
                  {donor.village} · {donor.availability}
                </p>
                {donor.lastDonationDate ? (
                  <p className="directory-meta">
                    Last donation · {donor.lastDonationDate}
                  </p>
                ) : null}
                {typeof donor.mobile === "string" &&
                donor.mobile &&
                donor.mobile !== "Available on request" ? (
                  <a className="btn" href={`tel:${donor.mobile}`}>
                    Emergency call
                  </a>
                ) : (
                  <p className="directory-meta">
                    Contact available via village admins on request
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && !loading ? (
          <p className="muted">No approved donors match this filter yet.</p>
        ) : null}
      </Reveal>

      <Reveal className="section">
        <h2>Register as a donor</h2>
        {!session ? (
          <p className="muted">
            Optional: <Link href="/login/">sign in</Link> as a member, or
            register below as a guest volunteer.
          </p>
        ) : null}
        {submitted ? (
          <p className="muted">
            Registration received. An administrator will approve before your
            profile is listed.
          </p>
        ) : (
          <form className="community-form" onSubmit={onSubmit}>
            <label>
              Name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Blood group
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Mobile number
              <input
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                inputMode="tel"
              />
            </label>
            <label>
              Village
              <input
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </label>
            <label>
              Availability
              <input
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              />
            </label>
            <label>
              Last donation date (optional)
              <input
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
              />
            </label>
            <label className="notif-pref-row">
              <input
                type="checkbox"
                checked={showContactPublicly}
                onChange={(e) => setShowContactPublicly(e.target.checked)}
              />
              <span>
                <strong>Show my mobile publicly</strong>
                <span className="muted">
                  Leave unchecked to keep your number private (admin can still
                  reach you).
                </span>
              </span>
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
