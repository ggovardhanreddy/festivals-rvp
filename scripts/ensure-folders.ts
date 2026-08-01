import { mkdir } from "node:fs/promises";
const folders = ["content", "inbox", "public/images", "public/thumbs", ".tmp"];
await Promise.all(folders.map((folder) => mkdir(folder, { recursive: true })));
console.log("Archive folders are ready.");
