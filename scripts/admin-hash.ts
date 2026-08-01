import crypto from "node:crypto";

const password = process.argv[2] || "change-me-govardhan";
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto
  .pbkdf2Sync(password, salt, 210000, 32, "sha256")
  .toString("base64url");
console.log(`ADMIN_PASSWORD_HASH=pbkdf2:${salt}:${hash}`);
console.log(`ADMIN_SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}`);
