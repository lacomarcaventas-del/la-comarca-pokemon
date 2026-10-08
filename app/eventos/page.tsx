"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {supabaseBrowser} from "../../lib/supabase";

const EVENTS=[
  {slug:"heroclix-pulp-300",game:"HeroClix",title:"Pulp · 300 puntos",meta:"HeroClix · 300 pts"},
  {slug:"pokemon-standard",game:"Pokémon TCG",title:"Standard",meta:"Pokémon TCG · Standard"},
  {slug:"mtg-brawl",game:"Magic: The Gathering",title:"Brawl",meta:"MTG · Brawl"},
  {slug:"mtg-commander-multiplayer",game:"Magic: The Gathering",title:"Commander Multiplayer · Bracket 1",meta:"MTG · Commander Multiplayer · Bracket 1"}
];

export default function Eventos(){
 const sb=supabaseBrowser();
 const [counts,setCounts]=useState<Record<string,number>>({});
 useEffect(()=>{(async()=>{
  const {data}=await sb.from("event_registrations").select("event_slug");
  if(data){
   const next:Record<string,number>={};
   for(const row of data)next[row.event_slug]=(next[row.event_slug]||0)+1;
   setCounts(next);
  }
 })()},[]);
 return <main className="siteShell">
  <header className="top siteTop"><Link href="/" className="logoLink">← La Comarca</Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><Link href="/eventos">Eventos</Link></nav></header>
  <section className="wrap sectionBlock">
   <div className="sectionTitle"><h2>EVENTOS · OCTUBRE</h2><span>Inscripciones abiertas · La Comarca</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
    {EVENTS.map(e=>{
      const count=counts[e.slug]||0,full=count>=8;
      return <Link key={e.slug} href={"/eventos/"+e.slug} style={{textDecoration:"none",display:"block",padding:24,border:"1px solid rgba(255,255,255,.14)",borderRadius:16,background:"linear-gradient(145deg,rgba(18,27,39,.95),rgba(9,14,22,.95))"}}>
       <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:.65,marginBottom:10}}>{e.game}</div>
       <h3 style={{margin:"0 0 10px",fontSize:"1.45rem",color:"#f2d08b"}}>{e.title}</h3>

       <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:14,marginTop:18,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.08)"}}>
        <span style={{fontSize:12,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:full?"#e58a8a":"rgba(255,255,255,.62)"}}>
         {count}/8 {full?"· Cupo lleno":"· lugares"}
        </span>
        <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:118,padding:"10px 16px",borderRadius:999,border:full?"1px solid rgba(229,138,138,.35)":"1px solid rgba(242,208,139,.55)",background:full?"rgba(229,138,138,.08)":"linear-gradient(180deg,rgba(242,208,139,.18),rgba(180,125,45,.10))",boxShadow:full?"none":"0 6px 20px rgba(0,0,0,.22)",color:full?"#e58a8a":"#f2d08b",fontSize:12,fontWeight:800,letterSpacing:".08em",textTransform:"uppercase"}}>
         {full?"Cupo lleno":"Inscribirme"}
        </span>
       </div>
      </Link>
    })}
   </div>
   <div style={{marginTop:28}}><img src="/liga-ranking-agosto.webp" alt="Ranking de Ligas de Agosto" style={{width:"100%",maxWidth:"1600px",height:"auto",display:"block",margin:"0 auto",borderRadius:16,border:"1px solid rgba(255,255,255,.16)"}}/></div>
  </section>
 </main>
}