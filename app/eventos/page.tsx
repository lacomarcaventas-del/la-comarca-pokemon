import Link from "next/link";

export default function Eventos(){
  return <main className="siteShell"><header className="top siteTop"><Link href="/" className="logoLink">← La Comarca</Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><Link href="/eventos">Eventos</Link></nav></header>
  <section className="wrap sectionBlock"><div className="sectionTitle"><h2>EVENTOS</h2><span>Inscripciones y actividades de La Comarca</span></div>
  <div className="flex flex-col items-center gap-8"><Link href="/eventos/temporada-de-novatos" className="block w-full max-w-5xl" style={{textDecoration:"none"}}><img src="/temporada-novatos-2026.jpg.jpg" alt="Temporada de Novatos" style={{width:"100%",height:"auto",display:"block",borderRadius:16,border:"1px solid rgba(255,255,255,.16)"}}/></Link><img src="/liga-ranking-agosto.webp" alt="Ranking de Ligas de Agosto" style={{width:"100%",maxWidth:"1600px",height:"auto",display:"block",borderRadius:16,border:"1px solid rgba(255,255,255,.16)"}}/></div></section></main>
}