/**
 * Free Google Drive overflow for media when R2 is near capacity.
 *
 * Secrets (Pages → Settings → Environment variables / secrets):
 *   GOOGLE_DRIVE_CLIENT_ID
 *   GOOGLE_DRIVE_CLIENT_SECRET
 *   GOOGLE_DRIVE_REFRESH_TOKEN
 *   GOOGLE_DRIVE_FOLDER_ID   (optional — shared folder in your free Drive)
 *
 * Setup (all free — Google Cloud free tier + personal Drive 15GB):
 * 1. Create a Google Cloud project → enable Google Drive API
 * 2. OAuth Desktop client → download client id/secret
 * 3. OAuth consent (External / Testing) → add your Gmail as test user
 * 4. Get a refresh token once with drive.file scope (script below in docs)
 * 5. Create a Drive folder, share it with your account, paste folder id
 */

export type GDriveEnv = {
  GOOGLE_DRIVE_CLIENT_ID?: string;
  GOOGLE_DRIVE_CLIENT_SECRET?: string;
  GOOGLE_DRIVE_REFRESH_TOKEN?: string;
  GOOGLE_DRIVE_FOLDER_ID?: string;
};

export type GDriveUploadResult = {
  fileId: string;
  webViewLink: string;
  publicUrl: string;
  name: string;
};

function driveConfigured(env: GDriveEnv) {
  return Boolean(
    env.GOOGLE_DRIVE_CLIENT_ID &&
      env.GOOGLE_DRIVE_CLIENT_SECRET &&
      env.GOOGLE_DRIVE_REFRESH_TOKEN,
  );
}

export function isGoogleDriveConfigured(env: GDriveEnv) {
  return driveConfigured(env);
}

async function accessToken(env: GDriveEnv): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_DRIVE_CLIENT_ID!,
      client_secret: env.GOOGLE_DRIVE_CLIENT_SECRET!,
      refresh_token: env.GOOGLE_DRIVE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error || "Google Drive token refresh failed");
  }
  return data.access_token;
}

/** Public-ish direct image URL (works for "anyone with the link" files). */
export function gdrivePublicUrl(fileId: string) {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export async function uploadToGoogleDrive(
  env: GDriveEnv,
  input: {
    bytes: Uint8Array;
    name: string;
    mime: string;
  },
): Promise<GDriveUploadResult> {
  if (!driveConfigured(env)) {
    throw new Error("Google Drive secrets are not configured");
  }
  const token = await accessToken(env);
  const metadata: Record<string, unknown> = {
    name: input.name,
    mimeType: input.mime,
  };
  if (env.GOOGLE_DRIVE_FOLDER_ID) {
    metadata.parents = [env.GOOGLE_DRIVE_FOLDER_ID];
  }

  const boundary = `rvp_${crypto.randomUUID().replace(/-/g, "")}`;
  const metaPart = JSON.stringify(metadata);
  const preamble =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metaPart}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${input.mime}\r\n\r\n`;
  const closing = `\r\n--${boundary}--\r\n`;

  const preambleBytes = new TextEncoder().encode(preamble);
  const closingBytes = new TextEncoder().encode(closing);
  const body = new Uint8Array(
    preambleBytes.length + input.bytes.length + closingBytes.length,
  );
  body.set(preambleBytes, 0);
  body.set(input.bytes, preambleBytes.length);
  body.set(closingBytes, preambleBytes.length + input.bytes.length);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  const file = (await uploadRes.json()) as {
    id?: string;
    name?: string;
    webViewLink?: string;
    error?: { message?: string };
  };
  if (!uploadRes.ok || !file.id) {
    throw new Error(file.error?.message || "Google Drive upload failed");
  }

  // Anyone-with-link read (free personal Drive)
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );

  return {
    fileId: file.id,
    webViewLink:
      file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    publicUrl: gdrivePublicUrl(file.id),
    name: file.name || input.name,
  };
}
