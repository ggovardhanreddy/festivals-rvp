import { readdir, readFile, writeFile } from "node:fs/promises";
type Album = { title:string; year:number; category:string; date:string; description?:string; published?:boolean; favorite?:boolean };
const files = await readdir("content", {recursive:true}); const albums: Album[] = [];
for (const file of files) if (String(file).endsWith("metadata.json")) { const path = `content/${file}`; const item = JSON.parse(await readFile(path, "utf8")) as Album; if (item.published !== false) albums.push(item); }
albums.sort((a,b) => b.date.localeCompare(a.date));
await writeFile("public/search-index.json", JSON.stringify(albums.map(({title,year,category,date,description}) => ({title,year,category,date,description})), null, 2));
const url = process.env.NEXT_PUBLIC_SITE_URL || "https://festivals-rvp.pages.dev";
await writeFile("public/feed.xml", `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Festivals RVP</title>${albums.map(a => `<entry><title>${a.title}</title><id>${url}/${a.year}</id><updated>${a.date}T00:00:00Z</updated></entry>`).join("")}</feed>`);
const routes = ["", "years", "timeline", "festivals", "trips", "videos", "documents", "gallery", "favorites", "search", "about", "memory-of-the-day", "this-day"];
await writeFile("public/sitemap.xml", `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${url}/${route}</loc></url>`).join("")}</urlset>`);
console.log(`Generated search, feed and sitemap for ${albums.length} published albums.`);
