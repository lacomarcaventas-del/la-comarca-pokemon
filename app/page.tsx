import Link from "next/link";
import FacebookFeed from "../components/FacebookFeed";
import BrandLogo from "../components/BrandLogo";

const lines=[
  ["Accesorios","accesorios","Accesorios","◆"],["Coleccionables","coleccionables","Coleccionables","●"],["Disney Lorcana","lorcana","Disney Lorcana","✦"],["Dungeons & Dragons","dnd","Dungeons & Dragons","⚔"],["Gundam Card Game","gundam","Gundam Card Game","◈"],["Heroclix","heroclix","Heroclix","♙"],["Juegos de Mesa","juegos-mesa","Juegos de Mesa","♟"],["Magic: The Gathering","magic","Magic: The Gathering","✦"],["Modelismo","modelismo","Modelismo","▰"],["One Piece Card Game","onepiece","One Piece Card Game","☠"],["Pokémon TCG","pokemon","Pokémon TCG","◉"],["Weiss Schwarz","weiss","Weiss Schwarz","✥"],["Yu-Gi-Oh!","yugioh","Yu-Gi-Oh!","◉"]
];

export default function Home(){return <div className="siteShell">
  <section className="shippingHero" aria-label="Envíos a todo México"><div className="shippingInner">
    <div className="shippingLead"><strong>ENVIAMOS A<br/>TODO EL PAÍS</strong></div>
    <div className="shippingRoute"><span className="routeLine"></span><i>◆</i><i>◆</i><i>◆</i></div>
    <div className="carrier mexpost"><b>▰ MEXPOST</b><span>3–5 días hábiles<br/>Cobertura nacional</span></div>
    <div className="carrier fedex"><b><em>Fed</em>Ex</b><span>3 días hábiles<br/>Rápido y seguro</span></div>
    
  </div></section>
  <header className="top siteTop"><Link href="/" className="logoLink"><BrandLogo/></Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><a href="#comunidad">Comunidad</a><Link href="/eventos">Eventos</Link></nav><div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div></header>
  <main>
    <section id="lineas" className="wrap sectionBlock"><div className="sectionTitle"><h2>Explora nuestras líneas</h2><span>La Comarca · TCG & Hobby</span></div><div className="lineGrid">{lines.map(([name,key,category,icon])=><Link href={"/catalogo?categoria="+encodeURIComponent(category)} className={"lineCard "+key} key={key}><div className="lineIcon">{icon}</div><div className="lineContent"><div className="lineMark">{name}</div><strong>Explorar <span>→</span></strong></div></Link>)}</div></section>
    <section className="wrap sectionBlock"><div className="sectionTitle"><h2>Eventos</h2><Link href="/eventos">Ver eventos →</Link></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}><Link href="/eventos/temporada-de-novatos" style={{display:"block"}}><img src="/temporada-novatos-2026.jpg.jpg" alt="Temporada de Novatos" style={{width:"100%",height:"auto",display:"block",borderRadius:14,border:"1px solid rgba(255,255,255,.16)"}}/></Link><Link href={"/catalogo?categoria="+encodeURIComponent("Magic: The Gathering")} style={{display:"block"}}><img src="/evento-liga-magic-anticipada.svg" alt="Liga Magic: compra anticipada con promo" style={{width:"100%",height:"auto",display:"block",borderRadius:14,border:"1px solid rgba(255,255,255,.16)"}}/></Link></div></section>
    <section id="comunidad" className="wrap benefits"><div><b>◈</b><span><strong>Envíos a todo México</strong><small>Envíos seguros y rápidos</small></span></div><div><b>◇</b><span><strong>Tienda 100% segura</strong><small>Protección en tus compras</small></span></div><div><b>♧</b><span><strong>Atención personalizada</strong><small>Estamos para ayudarte</small></span></div><div><b>♙</b><span><strong>Comunidad La Comarca</strong><small>Eventos, torneos y más</small></span></div></section>
    <section className="wrap feedSection"><div className="sectionTitle"><h2>Últimas publicaciones</h2><a href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">Ver Facebook →</a></div><FacebookFeed/></section>
  </main>
  <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
</div>}