/**
 * List R2 object keys via S3-compatible ListObjectsV2 (SigV4).
 *
 * Requires:
 *   CLOUDFLARE_ACCOUNT_ID (or R2_ACCOUNT_ID)
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET (default: reddivaripalli)
 *
 * Optional: R2_LIST_PREFIXES=gallery/,videos/,audio/,funfest/
 */
import crypto from "node:crypto";
import type { R2ObjectRef } from "../lib/r2-catalog";

function sha256hex(data: string | Buffer) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string) {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function amzDate(d = new Date()) {
  const iso = d.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return { amz: iso.slice(0, 15) + "Z", date: iso.slice(0, 8) };
}

function signRequest(opts: {
  method: string;
  host: string;
  path: string;
  query: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  payloadHash: string;
}) {
  const { amz, date } = amzDate();
  const canonicalHeaders =
    `host:${opts.host}\n` + `x-amz-content-sha256:${opts.payloadHash}\n` + `x-amz-date:${amz}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    opts.method,
    opts.path,
    opts.query,
    canonicalHeaders,
    signedHeaders,
    opts.payloadHash,
  ].join("\n");

  const credentialScope = `${date}/${opts.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amz,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join("\n");

  const kDate = hmac(`AWS4${opts.secretAccessKey}`, date);
  const kRegion = hmac(kDate, opts.region);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  return {
    amz,
    authorization: `AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function xmlTag(body: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([^<]*)</${tag}>`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out.push(m[1]!);
  return out;
}

export function r2ListCredentialsPresent(): boolean {
  const account =
    process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || "";
  const access = process.env.R2_ACCESS_KEY_ID || "";
  const secret = process.env.R2_SECRET_ACCESS_KEY || "";
  return Boolean(account && access && secret);
}

export async function listR2Objects(prefixes?: string[]): Promise<R2ObjectRef[]> {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
  const bucket = process.env.R2_BUCKET || "reddivaripalli";
  const region = process.env.R2_REGION || "auto";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 listing requires CLOUDFLARE_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY",
    );
  }

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const prefixList =
    prefixes ||
    (process.env.R2_LIST_PREFIXES || "gallery/,videos/,audio/,funfest/")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

  const objects: R2ObjectRef[] = [];

  for (const prefix of prefixList) {
    let token: string | undefined;
    do {
      const params = new URLSearchParams({
        "list-type": "2",
        prefix,
        "max-keys": "1000",
      });
      if (token) params.set("continuation-token", token);

      // Encode query the way S3 expects (sorted, RFC3986)
      const query = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%20/g, "%20")}`,
        )
        .join("&");

      const path = `/${bucket}`;
      const payloadHash = sha256hex("");
      const signed = signRequest({
        method: "GET",
        host,
        path,
        query,
        accessKeyId,
        secretAccessKey,
        region,
        payloadHash,
      });

      const url = `https://${host}${path}?${query}`;
      const res = await fetch(url, {
        headers: {
          Authorization: signed.authorization,
          "x-amz-content-sha256": payloadHash,
          "x-amz-date": signed.amz,
        },
      });
      const body = await res.text();
      if (!res.ok) {
        throw new Error(`R2 ListObjectsV2 failed (${res.status}): ${body.slice(0, 240)}`);
      }

      const keys = xmlTag(body, "Key");
      const dates = xmlTag(body, "LastModified");
      const sizes = xmlTag(body, "Size");
      for (let i = 0; i < keys.length; i += 1) {
        objects.push({
          key: keys[i]!,
          uploaded: dates[i],
          size: sizes[i] ? Number(sizes[i]) : undefined,
        });
      }

      const truncated = xmlTag(body, "IsTruncated")[0] === "true";
      token = truncated
        ? decodeURIComponent(xmlTag(body, "NextContinuationToken")[0] || "")
        : undefined;
      // Avoid empty-string loop
      if (token === "") token = undefined;
    } while (token);
  }

  return objects;
}

/** Fetch a previously written public catalog from R2 (no secrets needed). */
export async function fetchPublicAlbumsCatalog(
  publicBase?: string,
): Promise<import("../lib/types").Album[] | null> {
  const base = (
    publicBase ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base) return null;
  for (const suffix of ["catalog/albums.json", "catalog/albums.array.json"]) {
    const url = `${base}/${suffix}`;
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as
        | import("../lib/types").Album[]
        | { albums?: import("../lib/types").Album[] };
      const albums = Array.isArray(data) ? data : data.albums;
      if (!Array.isArray(albums) || !albums.length) continue;
      return albums;
    } catch {
      // try next candidate
    }
  }
  return null;
}
