"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { PublicationStatus } from "@/lib/learning";
import { statusKey } from "@/lib/learning";

/**
 * What an unpublished item is waiting on.
 *
 * Named after the real blocker rather than a generic "unavailable": a parent
 * who reads "waiting on recordings from the village" learns something true
 * and can act on it — they might be the person who records it.
 */
export function StatusNotice({
  status,
  variant = "block",
}: {
  status: PublicationStatus | undefined;
  variant?: "block" | "inline";
}) {
  const { t } = useUiLang();
  const message = t(statusKey(status));
  if (variant === "inline") {
    return <span className="status-inline">{message}</span>;
  }
  return (
    <p className="status-block" role="status">
      {message}
    </p>
  );
}

/**
 * The empty state for a whole section that has no published items yet.
 *
 * Deliberately not an apology and not a countdown. It says what is missing,
 * why, and — where there is one — what a reader can do about it.
 */
export function EmptyLibrary({
  titleKey,
  reasonKey,
  helpKey,
}: {
  titleKey: string;
  reasonKey: string;
  helpKey?: string;
}) {
  const { t } = useUiLang();
  return (
    <div className="empty-library">
      <h2>{t(titleKey)}</h2>
      <p className="empty-library-reason">{t(reasonKey)}</p>
      {helpKey ? <p className="muted">{t(helpKey)}</p> : null}
    </div>
  );
}
