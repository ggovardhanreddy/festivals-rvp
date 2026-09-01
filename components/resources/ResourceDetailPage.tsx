"use client";

/**
 * §16's resource page. Every field the brief lists, and one it does not say
 * outright but the whole design depends on: the licence position, stated
 * plainly.
 *
 * When we host a copy, the attribution the source requires is displayed with
 * it — NCERT's licence and GODL-India both make attribution a condition of
 * reuse, so rendering it is not a courtesy, it is the thing that makes the
 * copy lawful. When we do not host a copy, the page says why and sends the
 * reader to the original.
 */
import Link from "next/link";
import { useUiLang } from "@/components/i18n/LanguageProvider";
import { navHref } from "@/lib/routes/registry";
import { VideoEmbed } from "./VideoEmbed";
import {
  canDownload,
  categoryLabel,
  formatFileSize,
  LANGUAGE_LABEL,
  RESOURCE_TYPE_LABEL,
  subcategoryLabel,
  type Resource,
  type Source,
} from "@/lib/resources";
import { formatEventDate } from "@/lib/dates";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="resource-detail-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function ResourceDetailPage({
  resource,
  source,
}: {
  resource: Resource;
  source?: Source;
}) {
  const { lang } = useUiLang();
  const te = lang === "te";
  const title = (te && resource.titleTe) || resource.title;
  const description = (te && resource.descriptionTe) || resource.description;
  const size = formatFileSize(resource.fileSize);
  const dateFmt = te ? "te-IN" : "en-GB";
  const hosted = canDownload(resource);

  return (
    <main className="page resource-detail">
      <div className="section">
        <p className="eyebrow">
          <Link href={navHref("/dharma/", lang)}>{te ? "సనాతన ధర్మం" : "Sanatana Dharma"}</Link>
          {" · "}
          <Link href={navHref(`/dharma/${resource.category}/`, lang)}>
            {categoryLabel(resource.category, te ? "te" : "en")}
          </Link>
        </p>
        <h1>{title}</h1>
        {description ? <p className="lede">{description}</p> : null}
      </div>

      {resource.resourceType === "video" ? (
        <section className="section">
          <VideoEmbed resource={resource} />
        </section>
      ) : null}

      {resource.status === "expired" ? (
        <section className="section">
          <p className="resource-expired-notice">
            <strong>{te ? "గడువు ముగిసింది / ఆర్కైవ్" : "Expired / Archived"}</strong>
            {" — "}
            {te
              ? "ఈ సమాచారం ఇకపై వర్తించదు. చరిత్ర కోసం ఉంచబడింది."
              : "This notice has passed its deadline. It is kept for the record, not for applying."}
          </p>
        </section>
      ) : null}

      <section className="section">
        <div className="resource-detail-actions">
          {hosted ? (
            <>
              <a className="btn btn-primary" href={resource.localFileUrl} target="_blank" rel="noopener">
                {te ? "చూడండి" : "View"}
              </a>
              <a className="btn" href={resource.localFileUrl} download>
                {te ? "డౌన్‌లోడ్" : "Download"}
              </a>
            </>
          ) : null}
          <a className="btn" href={resource.originalUrl} target="_blank" rel="noopener noreferrer">
            {te ? "అసలు వనరు చూడండి →" : "View Original Resource →"}
          </a>
        </div>

        {!hosted && resource.resourceType !== "video" ? (
          <p className="muted resource-license-note">
            {te
              ? "ఈ పత్రాన్ని మేము ఇక్కడ నిల్వ చేయలేము — దాని కాపీరైట్ అనుమతించదు. అధికారిక సైట్‌లో చదవండి."
              : "We do not keep a copy of this document here — its source has not granted permission to redistribute it. Read it on the official site."}
          </p>
        ) : null}
      </section>

      <section className="section">
        <h2>{te ? "వివరాలు" : "Details"}</h2>
        <dl className="resource-detail-list">
          <Row label={te ? "విభాగం" : "Category"}>
            {categoryLabel(resource.category, te ? "te" : "en")}
            {resource.subcategory
              ? ` · ${subcategoryLabel(resource.category, resource.subcategory, te ? "te" : "en")}`
              : ""}
          </Row>
          {resource.subject ? <Row label={te ? "సబ్జెక్ట్" : "Subject"}>{resource.subject}</Row> : null}
          {resource.classLevel ? <Row label={te ? "తరగతి / స్థాయి" : "Class / Level"}>{resource.classLevel}</Row> : null}
          {resource.exam ? <Row label={te ? "పరీక్ష" : "Exam"}>{resource.exam}</Row> : null}
          <Row label={te ? "భాష" : "Language"}>{LANGUAGE_LABEL[resource.language]}</Row>
          <Row label={te ? "వనరు రకం" : "Resource Type"}>{RESOURCE_TYPE_LABEL[resource.resourceType]}</Row>
          <Row label={te ? "మూలం" : "Source"}>
            {source ? (
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.name}
              </a>
            ) : (
              resource.sourceId
            )}
          </Row>
          {resource.publishedDate ? (
            <Row label={te ? "ప్రచురణ తేదీ" : "Published Date"}>{formatEventDate(resource.publishedDate, dateFmt)}</Row>
          ) : null}
          {resource.lastUpdatedDate ? (
            <Row label={te ? "చివరి నవీకరణ" : "Last Updated"}>{formatEventDate(resource.lastUpdatedDate, dateFmt)}</Row>
          ) : null}
          <Row label={te ? "సేకరించిన తేదీ" : "Collected Date"}>{formatEventDate(resource.collectedDate, dateFmt)}</Row>
          {resource.expiryDate ? (
            <Row label={te ? "గడువు తేదీ" : "Deadline"}>{formatEventDate(resource.expiryDate, dateFmt)}</Row>
          ) : null}
          {size ? <Row label={te ? "ఫైల్ పరిమాణం" : "File Size"}>{size}</Row> : null}
        </dl>
      </section>

      {/* §5: version history, where we lawfully hold the older files. */}
      {resource.versions && resource.versions.length > 0 ? (
        <section className="section">
          <h2>{te ? "మునుపటి సంస్కరణలు" : "Earlier versions"}</h2>
          <ul className="resource-versions">
            {resource.versions.map((v) => (
              <li key={v.hash}>
                <span>{formatEventDate(v.collectedDate, dateFmt)}</span>
                {v.fileKey && resource.licenseStatus === "yes" ? (
                  <a href={`/${v.fileKey}`} target="_blank" rel="noopener">
                    {te ? "ఈ సంస్కరణ" : "This version"}
                  </a>
                ) : (
                  <span className="muted">{te ? "ఆర్కైవ్ చేయబడింది" : "Archived"}</span>
                )}
                {formatFileSize(v.fileSize) ? (
                  <span className="muted">{formatFileSize(v.fileSize)}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* The attribution the source's licence requires. Rendering it is what
          makes our hosted copy lawful, so it is never conditional on space. */}
      {hosted && resource.attribution ? (
        <section className="section">
          <p className="resource-attribution">{resource.attribution}</p>
        </section>
      ) : null}
    </main>
  );
}
