import { readdir } from "node:fs/promises";
const files = await readdir("inbox");
const zips = files.filter((file) => file.toLowerCase().endsWith(".zip"));
if (zips.length) console.log(`Found ${zips.length} ZIP(s). Install an extraction tool and review each archive before ingesting.`);
else console.log("No ZIP files found in inbox.");
