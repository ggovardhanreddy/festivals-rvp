"use client";

import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { SectionIcon } from "@/components/platform/SectionIcon";
import { isPlayable, isPublished, text, type LearningItem } from "@/lib/learning";
import { StatusNotice } from "./StatusNotice";

/**
 * One item in a library listing.
 *
 * A published item is a link. An unpublished one is a card that says what it
 * is waiting on and does not pretend to be clickable — no dead link, no
 * "coming soon" that turns out to be a 404.
 */
export function LibraryCard({
  item,
  href,
  icon,
}: {
  item: LearningItem;
  href?: string;
  icon: string;
}) {
  const { t, lang } = useUiLang();
  const title = text(item.title, lang);
  const description = text(item.description, lang);
  const published = isPublished(item) && Boolean(href);

  const hasAudio =
    ("audio" in item && isPlayable(item.audio)) ||
    ("media" in item && item.media?.type === "audio" && isPlayable(item.media));
  const hasVideo =
    ("video" in item && isPlayable(item.video)) ||
    ("media" in item && item.media?.type === "video" && isPlayable(item.media));

  const inner = (
    <>
      <span className="libcard-art" aria-hidden>
        {item.image ? (
          <img src={item.image} alt="" loading="lazy" />
        ) : (
          <SectionIcon name={icon} size={30} />
        )}
      </span>
      <span className="libcard-body">
        <strong className="libcard-title">{title}</strong>
        {description ? <span className="libcard-desc">{description}</span> : null}
        <span className="libcard-tags">
          {hasAudio ? <span className="libcard-tag">{t("player.audio")}</span> : null}
          {hasVideo ? <span className="libcard-tag">{t("player.video")}</span> : null}
          {(item.language ?? []).map((l) => (
            <span key={l} className="libcard-tag libcard-tag--lang">
              {t(`lang.${l}`)}
            </span>
          ))}
        </span>
        {published ? null : <StatusNotice status={item.status} variant="inline" />}
      </span>
    </>
  );

  if (published && href) {
    return (
      <li>
        <Link className="libcard" href={href}>
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="libcard is-pending" aria-disabled="true">
        {inner}
      </div>
    </li>
  );
}
