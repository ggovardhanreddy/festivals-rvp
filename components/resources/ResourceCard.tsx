"use client";

/**
 * One resource, as a card.
 *
 * The three things this component must always get right:
 *
 *  1. The official source is named and linked on every card, always. Whether
 *     or not we host a copy, the reader can reach the original — which is
 *     what §17's respect for these publishers actually looks like in the UI.
 *  2. "Download" appears only when we lawfully host a copy. Otherwise the
 *     only action is "View Original Resource →", per §4.
 *  3. A language badge, so a Telugu-medium student can see at a glance which
 *     documents are in Telugu (§8).
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import {
  canDownload,
  formatFileSize,
  LANGUAGE_LABEL,
  resourceDate,
  resourceSlug,
  RESOURCE_TYPE_LABEL,
  type Resource,
} from "@/lib/resources";
import { formatEventDate } from "@/lib/dates";

export function ResourceCard({
  resource,
  sourceName,
}: {
  resource: Resource;
  sourceName?: string;
}) {
  const { lang } = useUiLang();
  const title = (lang === "te" && resource.titleTe) || resource.title;
  const description = (lang === "te" && resource.descriptionTe) || resource.description;
  const size = formatFileSize(resource.fileSize);
  const date = resourceDate(resource);

  return (
    <article className="resource-card">
      <div className="resource-card-head">
        <span className="resource-type">{RESOURCE_TYPE_LABEL[resource.resourceType]}</span>
        <span className={`resource-lang resource-lang--${resource.language}`}>
          {LANGUAGE_LABEL[resource.language]}
        </span>
      </div>

      <h3 className="resource-card-title">
        <Link href={navHref(`/learn/resource/${resourceSlug(resource)}/`, lang)}>{title}</Link>
      </h3>

      {description ? <p className="resource-card-desc">{description}</p> : null}

      <dl className="resource-card-meta">
        {resource.classLevel ? (
          <div>
            <dt>{lang === "te" ? "తరగతి" : "Class"}</dt>
            <dd>{resource.classLevel}</dd>
          </div>
        ) : null}
        {resource.subject ? (
          <div>
            <dt>{lang === "te" ? "సబ్జెక్ట్" : "Subject"}</dt>
            <dd>{resource.subject}</dd>
          </div>
        ) : null}
        {resource.exam ? (
          <div>
            <dt>{lang === "te" ? "పరీక్ష" : "Exam"}</dt>
            <dd>{resource.exam}</dd>
          </div>
        ) : null}
        {date ? (
          <div>
            <dt>{lang === "te" ? "తేదీ" : "Updated"}</dt>
            <dd>{formatEventDate(date, lang === "te" ? "te-IN" : "en-GB")}</dd>
          </div>
        ) : null}
        {size ? (
          <div>
            <dt>{lang === "te" ? "పరిమాణం" : "Size"}</dt>
            <dd>{size}</dd>
          </div>
        ) : null}
      </dl>

      <div className="resource-card-actions">
        {canDownload(resource) ? (
          <>
            <a className="btn btn-primary" href={resource.localFileUrl} target="_blank" rel="noopener">
              {lang === "te" ? "చూడండి" : "View"}
            </a>
            <a className="btn" href={resource.localFileUrl} download>
              {lang === "te" ? "డౌన్‌లోడ్" : "Download"}
            </a>
          </>
        ) : null}
        {/* Always present. The official copy is the authoritative one. */}
        <a className="btn resource-original" href={resource.originalUrl} target="_blank" rel="noopener noreferrer">
          {lang === "te" ? "అసలు వనరు చూడండి →" : "View Original Resource →"}
        </a>
      </div>

      {sourceName ? (
        <p className="resource-card-source">
          {lang === "te" ? "మూలం" : "Source"}: {sourceName}
        </p>
      ) : null}
    </article>
  );
}
