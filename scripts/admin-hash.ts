import { createHmac, randomBytes } from "node:crypto";
import { appendFile } from "node:fs/promises";
const password = process.argv[2] || "change-me-govardhan";
const secret = randomBytes(32).toString("hex");
const hash = createHmac("sha256", secret).update(password).digest("hex");
await appendFile(".env.local", `\nADMIN_SESSION_SECRET=${secret}\nADMIN_PASSWORD_HASH=${hash}\n`);
console.log("Credentials written to .env.local. Change the password before production use.");
