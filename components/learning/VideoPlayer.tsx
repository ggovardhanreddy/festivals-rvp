"use client";

import { useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { MediaAsset } from "@/lib/learning";
import { mediaUrl } from "@/lib/learning";

/**
 * Video player.
 *
 * A village recording plays from R2 with the browser's own controls —
 * fullscreen, scrubbing, captions and playback speed all come free and are
 * already familiar. A third-party lesson is an embed and is never rehosted;
 * it loads only after a click, so the page costs nothing until a child asks
 * for it and no third party is told about visitors who never press play.
 */
export function VideoPlayer({
  media,
  title,
  poster,
}: {
  media: MediaAsset;
  title: string;
  poster?: string;
}) {
  const { t } = useUiLang();
  const [started, setStarted] = useState(false);

  if (media.provider === "youtube" && media.externalId) {
    if (!started) {
      return (
        <button
          type="button"
          className="videoplayer videoplayer--facade"
          onClick={() => setStarted(true)}
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          aria-label={t("player.play", undefined, { label: title })}
        >
          <span className="videoplayer-play" aria-hidden>
            ▶
          </span>
          <span className="videoplayer-facade-note">{t("player.loadsExternal")}</span>
        </button>
      );
    }
    return (
      <div className="videoplayer">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(media.externalId)}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  const src = mediaUrl(media);
  if (!src) return null;

  return (
    <div className="videoplayer">
      <video controls playsInline preload="metadata" poster={poster} title={title}>
        <source src={src} />
        {media.captions ? <track kind="captions" src={media.captions} default /> : null}
      </video>
    </div>
  );
}
