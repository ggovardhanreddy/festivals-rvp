"use client";

/**
 * A permitted video embed.
 *
 * §6 in two rules. First, we never re-host someone's video — this renders the
 * platform's own player, which is the arrangement YouTube's embed terms
 * cover. Second, when the source has removed the video, we say so plainly and
 * render no player at all: a broken iframe teaches a reader nothing and looks
 * like our fault.
 *
 * The iframe is not loaded until the reader asks for it. That keeps YouTube
 * from setting cookies on a villager who only scrolled past the card, and
 * saves the data of anyone on a metered connection.
 */
import { useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { Resource } from "@/lib/resources";

export function VideoEmbed({ resource }: { resource: Resource }) {
  const { lang } = useUiLang();
  const [playing, setPlaying] = useState(false);
  const video = resource.video;

  if (!video) return null;

  if (video.unavailable) {
    return (
      <div className="resource-video resource-video--gone">
        <p>
          <strong>{lang === "te" ? "వీడియో అందుబాటులో లేదు" : "Video unavailable"}</strong>
        </p>
        <p className="muted">
          {lang === "te"
            ? "ఈ వీడియోను మూల ఛానెల్ తొలగించింది."
            : "The source channel has removed this video."}
        </p>
      </div>
    );
  }

  const title = (lang === "te" && resource.titleTe) || resource.title;

  if (!playing) {
    return (
      <button type="button" className="resource-video resource-video--poster" onClick={() => setPlaying(true)}>
        {video.thumbnail ? (
          /* A remote thumbnail on a platform we do not control; next/image
             would need a host allowlist entry and buys nothing on a static
             export. */
          <img src={video.thumbnail} alt="" loading="lazy" width={480} height={360} />
        ) : null}
        <span className="resource-video-play" aria-hidden>
          ▶
        </span>
        <span className="resource-video-label">
          {lang === "te" ? `${title} — ప్లే చేయండి` : `Play: ${title}`}
        </span>
      </button>
    );
  }

  return (
    <div className="resource-video">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
