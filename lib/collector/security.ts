/**
 * §18: every downloaded file is untrusted input.
 *
 * The threat here is not sophisticated. It is a government portal serving an
 * HTML error page with a .pdf URL, a zero-byte file from a half-finished
 * upload, a password-protected exam paper, or — the one that actually matters
 * — something that is not the file type it claims to be, landing in a public
 * bucket under a name a browser will happily execute.
 *
 * So: identify by magic bytes and never by extension, cap the size, generate
 * our own filename rather than trusting theirs, and never execute anything.
 *
 * Node-only.
 */
import crypto from "node:crypto";

export type FileKind = "pdf" | "image" | "video" | "office" | "text" | "html" | "archive" | "unknown";

/** Magic-byte signatures. Extension is a hint for humans, not an identity. */
export function sniffKind(buf: Buffer): FileKind {
  if (buf.length < 4) return "unknown";
  const hex = buf.subarray(0, 12).toString("hex").toLowerCase();
  const head = buf.subarray(0, 512).toString("utf8").trimStart().toLowerCase();

  if (hex.startsWith("25504446")) return "pdf"; // %PDF
  if (hex.startsWith("89504e47")) return "image"; // PNG
  if (hex.startsWith("ffd8ff")) return "image"; // JPEG
  if (hex.startsWith("47494638")) return "image"; // GIF
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image";
  if (buf.subarray(4, 8).toString("ascii") === "ftyp") return "video"; // MP4/MOV
  // ZIP container: could be docx/xlsx/pptx or a plain archive. Both are
  // "not a PDF", which is all the pipeline needs to refuse it.
  if (hex.startsWith("504b0304")) return "archive";
  if (hex.startsWith("d0cf11e0")) return "office"; // legacy OLE .doc/.xls
  if (head.startsWith("<!doctype html") || head.startsWith("<html") || head.startsWith("<?xml")) return "html";
  // Printable-ASCII-dominant short buffers are text.
  const sample = buf.subarray(0, 256);
  let printable = 0;
  for (const b of sample) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) printable += 1;
  if (printable / sample.length > 0.9) return "text";
  return "unknown";
}

export function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * A PDF is encrypted when its trailer carries /Encrypt.
 *
 * Checked before text extraction because a password-protected exam paper is a
 * legitimate thing for a board to publish and an illegitimate thing for us to
 * try to open. §10 wants it flagged, not cracked.
 */
export function isEncryptedPdf(buf: Buffer): boolean {
  // The trailer lives at the end; scanning the tail avoids a false positive
  // from the literal string appearing inside a content stream.
  const tail = buf.subarray(Math.max(0, buf.length - 4096)).toString("latin1");
  if (/\/Encrypt\s/.test(tail)) return true;
  // Linearized PDFs can place the trailer dictionary early.
  const head = buf.subarray(0, 4096).toString("latin1");
  return /\/Encrypt\s+\d+\s+\d+\s+R/.test(head);
}

/** Below this a "PDF" carries no document. §10's "empty PDF". */
export const MIN_PDF_BYTES = 1024;

export type FileVerdict =
  | { ok: true; kind: FileKind; hash: string; size: number }
  | { ok: false; reason: "empty-file" | "wrong-file-type" | "password-protected" | "too-large"; detail: string };

export function validateDownload(
  buf: Buffer,
  expected: FileKind,
  maxBytes: number,
): FileVerdict {
  if (buf.length === 0) return { ok: false, reason: "empty-file", detail: "zero bytes" };
  if (buf.length > maxBytes) {
    return { ok: false, reason: "too-large", detail: `${buf.length} bytes exceeds ${maxBytes}` };
  }
  const kind = sniffKind(buf);
  if (kind !== expected) {
    return {
      ok: false,
      reason: "wrong-file-type",
      // Naming both sides matters: "served HTML for a .pdf link" is the single
      // most common failure on these portals and an admin should see it said.
      detail: `expected ${expected}, magic bytes say ${kind}`,
    };
  }
  if (expected === "pdf") {
    if (buf.length < MIN_PDF_BYTES) {
      return { ok: false, reason: "empty-file", detail: `${buf.length} bytes is too small to be a document` };
    }
    if (isEncryptedPdf(buf)) {
      return { ok: false, reason: "password-protected", detail: "PDF trailer carries /Encrypt" };
    }
  }
  return { ok: true, kind, hash: sha256(buf), size: buf.length };
}

/**
 * Build our own storage name from the source id and content hash.
 *
 * Never derived from the remote filename. A portal is free to serve
 * `../../index.html` or `report .pdf; rm -rf` as a filename; the hash is not.
 * The original name is kept in the resource's title, where it is data.
 */
export function safeFileKey(sourceId: string, hash: string, kind: FileKind): string {
  const ext = kind === "pdf" ? "pdf" : kind === "image" ? "img" : kind === "video" ? "mp4" : "bin";
  const id = sourceId.replace(/[^a-z0-9-]/gi, "").toLowerCase().slice(0, 40) || "source";
  return `resources/${id}/${hash.slice(0, 2)}/${hash}.${ext}`;
}

/**
 * Content-level screening.
 *
 * Not a virus scanner, and does not pretend to be: real AV belongs in the
 * workflow (see .github/workflows/collect-resources.yml, which runs ClamAV
 * over the downloads before they are committed). This catches the things that
 * are cheap to catch and specific to PDFs — embedded JavaScript and auto-run
 * actions, which a static study document has no reason to contain.
 */
export function screenPdfContent(buf: Buffer): { suspicious: boolean; findings: string[] } {
  const text = buf.toString("latin1");
  const findings: string[] = [];
  if (/\/JavaScript\b/.test(text) || /\/JS\b/.test(text)) findings.push("embedded JavaScript");
  if (/\/OpenAction\b/.test(text)) findings.push("/OpenAction auto-run");
  if (/\/AA\b/.test(text)) findings.push("/AA additional actions");
  if (/\/Launch\b/.test(text)) findings.push("/Launch external program action");
  if (/\/EmbeddedFile\b/.test(text)) findings.push("embedded file attachment");
  return { suspicious: findings.length > 0, findings };
}
