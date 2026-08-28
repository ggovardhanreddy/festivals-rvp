/**
 * Self-hosted typography.
 *
 * Previously loaded through `next/font/google`, which fetches from
 * fonts.googleapis.com AT BUILD TIME -- so a production build failed whenever
 * that host was unreachable (see docs/BASELINE.md section 6).
 *
 * The WOFF2 subsets in assets/fonts are committed, so `next build` needs no
 * network at all. Refresh them with `npm run fonts:sync`.
 *
 * Weights are deliberately minimal:
 *   Playfair Display  600, 700   display only
 *   Poppins           400, 600   body
 *   Noto Sans Telugu  400, 600   Telugu, applied via :lang(te)
 *
 * 144 KB total. Telugu is the bulk and is not optional -- neither Playfair nor
 * Poppins contains a single Telugu glyph, so before this the Telugu UI fell
 * back to whatever the device happened to have.
 */
import localFont from "next/font/local";

export const playfair = localFont({
  src: [
    { path: "../assets/fonts/playfair-display-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/playfair-display-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const poppins = localFont({
  src: [
    { path: "../assets/fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
  adjustFontFallback: "Arial",
});

/** Telugu. Loaded for every visitor because panchangam labels are bilingual. */
export const notoTelugu = localFont({
  src: [
    { path: "../assets/fonts/noto-sans-telugu-telugu-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/noto-sans-telugu-telugu-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-telugu",
  display: "swap",
  preload: false,
  fallback: ["Noto Sans Telugu", "Gautami", "sans-serif"],
});

export const fontVariables = `${playfair.variable} ${poppins.variable} ${notoTelugu.variable}`;
