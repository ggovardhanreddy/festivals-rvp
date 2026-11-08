import Link from "next/link";
import type { ContentItem } from "@/lib/production/types";
export default function ContentGrid({items}:{items:ContentItem[]}) {
 if(!items.length)return <div className="empty">No published stories here yet. Please check back soon.</div>;
 return <div className="cards">{items.map(item=><article className="card" key={item.id}>
  {item.cover_image?<img src={item.cover_image} alt={item.title} loading="lazy"/>:<div style={{height:220,background:"#e6e4dc"}}/>}
  <div className="card-body"><span className="card-meta">{item.category.replaceAll("_"," ")}</span><h3>{item.title}</h3>{item.summary&&<p>{item.summary}</p>}<Link className="link" href={`/${item.category}/${item.slug}`}>Read story →</Link></div>
 </article>)}</div>;
}
