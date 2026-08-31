/**
 * PDF handling, §4.
 *
 * Extraction is for two purposes only: giving the resource a real title when
 * the link text was "Click here", and producing text for search and
 * categorisation. It is never used to re-typeset or summarise a document —
 * NCERT's licence forbids derivation explicitly, and the same caution is
 * right for every other source.
 *
 * unpdf wraps pdfjs with no worker setup, which matters because this runs in
 * a GitHub Actions runner with no browser. Extraction is wrapped in a timeout
 * and a try/catch: a malformed government PDF must degrade to "no text" and
 * a `missing-metadata` flag, never take down a collection run.
 *
 * Node-only.
 */
import { extractText, getDocumentProxy, getMeta } from "unpdf";

export type PdfInfo = {
  /** Title from the PDF's own metadata, when it is usable. */
  metaTitle?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  /** ISO date from the PDF's CreationDate. */
  createdDate?: string;
  /** ISO date from the PDF's ModDate. §5's publication/update date. */
  modifiedDate?: string;
  pages?: number;
  /** Extracted text, trimmed and whitespace-normalised. May be empty. */
  text: string;
  /** True when the PDF yielded no extractable text at all — a scanned
   *  document. Recorded so an admin knows search will not find it. */
  imageOnly: boolean;
};

/** How much text to keep. 20k characters is far more than categorisation or
 *  search snippets need, and keeps the catalog JSON from ballooning. */
const MAX_TEXT = 20000;

/**
 * PDF date strings look like `D:20260830143000+05'30'`.
 * Anything else is ignored rather than guessed at.
 */
export function parsePdfDate(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const m = raw.match(/^D?:?(\d{4})(\d{2})(\d{2})/);
  if (!m) return undefined;
  const [, y, mo, d] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);
  if (year < 1990 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${y}-${mo}-${d}`;
}

/**
 * PDF producers write junk into /Title constantly: the source filename, a
 * Word template name, "Microsoft Word - notification.doc", or an empty
 * string. A title that looks like a filename is worse than no title, because
 * it would be shown to a reader as the document's name.
 */
export function usableTitle(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  let t = raw.replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  t = t.replace(/^microsoft word\s*-\s*/i, "");
  t = t.replace(/\.(pdf|doc|docx|indd|cdr|tmp)$/i, "");
  if (t.length < 4) return undefined;
  // A single-token title is only junk when it is shaped like a filename or an
  // identifier. "Notification" is a poor title but a real one; "eapcet_2026_final"
  // and "a3f9b2c1d4e5" are the producer leaking its filename into /Title.
  if (!/\s/.test(t) && (/[_]/.test(t) || /\d/.test(t) || /^[0-9a-f]{8,}$/i.test(t))) {
    return undefined;
  }
  if (/^untitled$/i.test(t)) return undefined;
  return t.slice(0, 300);
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

export async function readPdf(buf: Buffer, timeoutMs = 60000): Promise<PdfInfo> {
  const empty: PdfInfo = { text: "", imageOnly: true };
  let doc: Awaited<ReturnType<typeof getDocumentProxy>>;
  try {
    doc = await withTimeout(getDocumentProxy(new Uint8Array(buf)), timeoutMs, "PDF open");
  } catch {
    return empty;
  }

  const info: PdfInfo = { text: "", imageOnly: true };

  try {
    const meta = await withTimeout(getMeta(doc), 20000, "PDF metadata");
    const raw = (meta.info ?? {}) as Record<string, unknown>;
    info.metaTitle = usableTitle(raw.Title);
    if (typeof raw.Author === "string" && raw.Author.trim()) info.author = raw.Author.trim().slice(0, 200);
    if (typeof raw.Subject === "string" && raw.Subject.trim()) info.subject = raw.Subject.trim().slice(0, 500);
    if (typeof raw.Keywords === "string" && raw.Keywords.trim()) {
      info.keywords = raw.Keywords.split(/[,;]/).map((k) => k.trim()).filter(Boolean).slice(0, 20);
    }
    info.createdDate = parsePdfDate(raw.CreationDate);
    info.modifiedDate = parsePdfDate(raw.ModDate);
  } catch {
    // Metadata is optional; text is the part that matters.
  }

  try {
    info.pages = doc.numPages;
    const { text } = await withTimeout(extractText(doc, { mergePages: true }), timeoutMs, "PDF text");
    const joined = (Array.isArray(text) ? text.join("\n") : text) ?? "";
    const normalised = joined.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    info.text = normalised.slice(0, MAX_TEXT);
    info.imageOnly = normalised.length < 40;
  } catch {
    info.text = "";
    info.imageOnly = true;
  }

  return info;
}

/**
 * Best title for a resource, in order of trustworthiness.
 *
 * Link text first: a human wrote it on the source page, in context, and it is
 * what the reader saw. PDF metadata second. The first heading-ish line of the
 * extracted text third. The filename is the last resort, cleaned up, because
 * showing `AP_EAPCET_2026_notif_final_v2.pdf` to a student is a failure.
 */
export function bestTitle(opts: {
  linkText?: string;
  metaTitle?: string;
  text?: string;
  url: string;
}): string {
  const link = opts.linkText?.replace(/\s+/g, " ").trim();
  if (link && link.length >= 8 && !/^(click here|download|view|pdf|here|link|more)$/i.test(link)) {
    return link.slice(0, 300);
  }
  if (opts.metaTitle) return opts.metaTitle;

  if (opts.text) {
    for (const line of opts.text.split("\n").slice(0, 12)) {
      const l = line.replace(/\s+/g, " ").trim();
      // A title line is a sentence-length fragment, not a paragraph and not a
      // page number or a lone letterhead word.
      if (l.length >= 12 && l.length <= 180 && /[a-zA-Zఀ-౿]/.test(l)) return l;
    }
  }
  if (link) return link.slice(0, 300);

  try {
    const name = decodeURIComponent(new URL(opts.url).pathname.split("/").pop() ?? "");
    const cleaned = name
      .replace(/\.[a-z0-9]{2,5}$/i, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length >= 4) return cleaned.slice(0, 300);
  } catch {
    // fall through
  }
  return "Untitled document";
}
