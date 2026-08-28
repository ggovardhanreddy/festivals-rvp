"use client";

import { useUiLang } from "@/components/i18n/LanguageProvider";
import type { DirectoryEntry } from "@/lib/directory";

/**
 * A single official destination.
 *
 * The domain is shown before the visitor clicks, not after, because "check
 * the address bar" is useless advice if the site never tells you what the
 * address should be. Every link is an external link, marked as one, and
 * carries rel="noopener" — Reddivaripalli never proxies or frames these.
 */
export function OfficialLink({ item }: { item: DirectoryEntry }) {
  const { t, lang } = useUiLang();
  const name = (lang === "te" && item.nameTe) || item.name;
  const description = (lang === "te" && item.descriptionTe) || item.description;

  return (
    <li className="oflink-item">
      <a
        className="oflink"
        href={item.officialUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        <span className="oflink-body">
          <span className="oflink-head">
            <strong>{name}</strong>
            <span className="oflink-badge">{t("gov.official")}</span>
          </span>
          <span className="oflink-desc">{description}</span>
          <span className="oflink-meta">
            <span className="oflink-dept">{item.department}</span>
            <span className="oflink-domain">{item.officialDomain}</span>
          </span>
        </span>
        <span className="oflink-cta" aria-hidden>
          {t("gov.open")} <span className="oflink-arrow">→</span>
        </span>
        <span className="sr-only">{t("gov.opensExternal")}</span>
      </a>
      <p className="oflink-source">
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer nofollow">
          {item.source}
        </a>
        {" · "}
        {t("gov.verified", undefined, { date: item.lastVerified })}
      </p>
    </li>
  );
}

export function OfficialLinkList({ items }: { items: DirectoryEntry[] }) {
  return (
    <ul className="oflink-list">
      {items.map((item) => (
        <OfficialLink key={item.id} item={item} />
      ))}
    </ul>
  );
}
