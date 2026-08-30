import Link from "next/link";

/**
 * An empty section, stated plainly.
 *
 * The eyebrow used to be a hard-coded "Nothing here yet", which reads as an
 * apology and tells a visitor nothing about where they are. Callers name the
 * section instead, or leave it off.
 */
export function EmptyState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state glass-card" role="status">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {actionHref && actionLabel && (
        <Link className="btn" href={actionHref} style={{ marginTop: "1rem" }}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
