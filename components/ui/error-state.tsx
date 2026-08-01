export function ErrorState({
  title = "Something went wrong",
  description = "Please refresh the page or try again shortly.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="error-state glass-card" role="alert">
      <p className="eyebrow">Error</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </div>
  );
}
