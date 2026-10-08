import Link from "next/link";

const EVENTS=[
  {slug:"heroclix-pulp-300",game:"HeroClix",title:"Pulp · 300 puntos",desc:"Formato Pulp de 300 puntos. Construye tu equipo y demuestra tu estrategia.",meta:"HeroClix · 300 pts"},
  {slug:"pokemon-standard",game:"Pokémon TCG",title:"Standard",desc:"Compite con un mazo legal en el formato Standard vigente de Pokémon TCG.",meta:"Pokémon TCG · Standard"},
  {slug:"mtg-brawl",game:"Magic: The Gathering",title:"Brawl",desc:"Duelo de Brawl para quienes quieren poner a prueba su comandante y construcción.",meta:"MTG · Brawl"},
  {slug:"mtg-commander-multiplayer",game:"Magic: The Gathering",title:"Commander Multiplayer",desc:"Commander en mesa multijugador. Prepara tu mazo y disfruta la partida.",meta:"MTG · Commander Multiplayer"}
];

export default function Eventos(){
 return <main className="siteShell">
  <header className="top siteTop"><Link href="/" className="logoLink">← La Comarca</Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><Link href="/eventos">Eventos</Link></nav></header>
  <section className="wrap sectionBlock">
   <div className="sectionTitle"><h2>EVENTOS</h2><span>Inscripciones abiertas · La Comarca</span></div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18}}>
    {EVENTS.map(e=><Link key={e.slug} href={"/eventos/"+e.slug} style={{textDecoration:"none",display:"block",padding:24,border:"1px solid rgba(255,255,255,.14)",borderRadius:16,background:"linear-gradient(145deg,rgba(18,27,39,.95),rgba(9,14,22,.95))"}}>
      <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:.65,marginBottom:10}}>{e.game}</div>
      <h3 style={{margin:"0 0 10px",fontSize:"1.45rem",color:"#f2d08b"}}>{e.title}</h3>
      <p style={{margin:"0 0 18px",lineHeight:1.55,opacity:.82}}>{e.desc}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><small style={{opacity:.65}}>{e.meta}</small><strong style={{color:"#f2d08b"}}>Inscribirme →</strong></div>
    </Link>)}
   </div>
   <div style={{marginTop:28}}><img src="/liga-ranking-agosto.webp" alt="Ranking de Ligas de Agosto" style={{width:"100%",maxWidth:"1600px",height:"auto",display:"block",margin:"0 auto",borderRadius:16,border:"1px solid rgba(255,255,255,.16)"}}/></div>
  </section>
 </main>
}