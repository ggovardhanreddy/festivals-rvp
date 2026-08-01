import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state glass-card" role="status">
      <p className="eyebrow">Nothing here yet</p>
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
