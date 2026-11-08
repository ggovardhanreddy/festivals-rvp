"use client";
import Link from "next/link";
import { useState } from "react";
export default function Header() {
  const [open,setOpen]=useState(false);
  const links=[["Our Village","/village"],["Heritage","/heritage"],["Temples","/temples"],["Festivals","/festivals"],["People","/people"],["Development","/development"],["Gallery","/gallery"],["News","/news"]];
  return <><div className="announcement">A living archive of our village, our people and our traditions</div><header className="header"><Link className="brand" href="/production"><span className="brand-mark">R</span><span><strong>REDDIVARIPALLI</strong><small>OUR VILLAGE · OUR HERITAGE · OUR HOME</small></span></Link><button className="mobile-toggle" onClick={()=>setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open?"×":"☰"}</button><nav className={`nav ${open?"open":""}`}>{links.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}</nav><Link className="nav-cta" href="/production/contact">Get in touch ↗</Link></header></>;
}
