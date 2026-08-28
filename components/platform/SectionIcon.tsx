/**
 * Inline SVG icons for doors, explore tiles and games.
 *
 * Inline rather than an icon font or a sprite request: each is a handful of
 * bytes, they inherit currentColor for dark mode, and they cost no extra
 * network round trip on a slow connection.
 */
const PATHS: Record<string, string> = {
  kids: "M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-7 16a7 7 0 0 1 14 0v1H5v-1Z",
  students: "M12 3 1 9l11 6 9-4.9V17h2V9L12 3ZM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.8-7-3.8Z",
  farmers: "M4 18h3l1-5h3v5h3l2-8h4v-2h-5l-2 8H9V9H6L4 18Zm14 1a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM7 19a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  careers: "M9 4h6a2 2 0 0 1 2 2v1h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3V6a2 2 0 0 1 2-2Zm0 3h6V6H9v1Z",
  seniors: "M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-1 8h2l3 10h-2.2l-.7-2.5h-2.2L10.2 21H8l3-10Z",
  explore: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.5 6.5-2.1 5-5 2.1 2.1-5 5-2.1Z",
  agriculture: "M12 3c3 3 4 6 4 9a4 4 0 0 1-8 0c0-3 1-6 4-9Zm0 14v5h-1.5v-5H12Z",
  learn: "M4 5h7v14H4V5Zm9 0h7v14h-7V5Z",
  play: "M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14 14h-4l-1.8 1A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4Z",
  english: "M4 5h16v14H4V5Zm3 3v8h2v-3h2v3h2V8h-2v3H9V8H7Z",
  engineering: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 6a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z",
  it: "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z",
  temples: "M12 2 6 8h12l-6-6ZM5 10h14v2H5v-2Zm1 4h12v8h-4v-5h-4v5H6v-8Z",
  weather: "M6 16a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 16H6Z",
  community: "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM2 19a6 6 0 0 1 12 0v1H2v-1Zm12.5-4.9A6 6 0 0 1 22 19v1h-6v-1c0-1.8-.6-3.5-1.5-4.9Z",
  government: "M12 3 2 8v2h20V8L12 3ZM4 12h2v7H4v-7Zm5 0h2v7H9v-7Zm4 0h2v7h-2v-7Zm5 0h2v7h-2v-7ZM2 20h20v2H2v-2Z",
  digital: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 17h4v1h-4v-1Z",
  grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
  cards: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
  letter: "M5 4h14v3H5V4Zm6 4h2v12h-2V8Z",
  question: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm1.8-6.3-.9.9c-.6.6-.9 1.1-.9 2.4h-2v-.5c0-1 .4-1.8 1-2.4l1.2-1.2a1.8 1.8 0 1 0-3.1-1.2H8a4 4 0 1 1 6.8 2.8Z",
};

export function SectionIcon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const d = PATHS[name] ?? PATHS.explore!;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
