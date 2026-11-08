import type { ReactNode } from "react";
export default function SectionHeading({eyebrow,title,description}:{eyebrow:string,title:ReactNode,description?:string}){return <div className="section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{description&&<p>{description}</p>}</div>}
