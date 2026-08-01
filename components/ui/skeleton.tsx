import type { CSSProperties } from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={style}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card" aria-hidden>
      <Skeleton className="card-media" />
      <div className="card-body">
        <Skeleton style={{ height: 12, width: "40%", marginBottom: 10 }} />
        <Skeleton style={{ height: 22, width: "70%", marginBottom: 8 }} />
        <Skeleton style={{ height: 14, width: "90%" }} />
      </div>
    </div>
  );
}
