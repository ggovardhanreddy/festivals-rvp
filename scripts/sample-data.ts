import { mkdir, writeFile } from "node:fs/promises";
const album = "content/2024/Festivals/Sankranti-2024";
await mkdir(`${album}/originals`, {recursive:true}); await mkdir(`${album}/public/images`, {recursive:true}); await mkdir(`${album}/public/thumbs`, {recursive:true});
await writeFile(`${album}/metadata.json`, JSON.stringify({title:"Sankranti 2024", year:2024, category:"Festivals", date:"2024-01-15", description:"A family celebration of color and togetherness.", published:true, favorite:true, cover:null, items:[]}, null, 2));
console.log("Sample album created.");
