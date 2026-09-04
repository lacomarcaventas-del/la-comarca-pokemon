import Link from "next/link";
import FacebookFeed from "../components/FacebookFeed";
import BrandLogo from "../components/BrandLogo";

const lines=[
  ["Pokémon","pokemon","Pokémon"],["Magic: The Gathering","magic","Magic: The Gathering"],["Yu-Gi-Oh!","yugioh","Yu-Gi-Oh!"],["One Piece Card Game","onepiece","One Piece Card Game"],
  ["Disney Lorcana","lorcana","Disney Lorcana"],["Weiss Schwarz","weiss","Weiss Schwarz"],["Gundam Card Game","gundam","Gundam Card Game"],["Dungeons & Dragons","dnd","Dungeons & Dragons"]
];

export default function Home(){return <div className="siteShell">
  <header className="top siteTop"><Link href="/" className="logoLink"><BrandLogo/></Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><a href="#lineas">Categorías</a><a href="#comunidad">Comunidad</a><Link href="/eventos">Eventos</Link></nav><div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div></header>
  <main>
    <section id="lineas" className="wrap sectionBlock"><div className="sectionTitle"><h2>Explora nuestras líneas</h2><span>La Comarca · TCG & Hobby</span></div><div className="lineGrid">{lines.map(([name,key,category])=><Link href={`/catalogo?categoria=${encodeURIComponent(category)}`} className={`lineCard ${key}`} key={key}><div className="lineMark">{name}</div><strong>Ver productos →</strong></Link>)}</div></section>
    <section className="wrap sectionBlock"><div className="sectionTitle"><h2>Eventos</h2><Link href="/eventos">Ver eventos →</Link></div><Link href="/eventos/temporada-de-novatos" style={{display:"block",maxWidth:360}}><img src="/eventos/temporada-novatos-2026.jpg" alt="Temporada de Novatos" style={{width:"100%",height:"auto",display:"block",borderRadius:14,border:"1px solid rgba(255,255,255,.16)"}}/></Link></section>
    <section id="comunidad" className="wrap benefits"><div><b>◈</b><span><strong>Envíos a todo México</strong><small>Envíos seguros y rápidos</small></span></div><div><b>◇</b><span><strong>Tienda 100% segura</strong><small>Protección en tus compras</small></span></div><div><b>♧</b><span><strong>Atención personalizada</strong><small>Estamos para ayudarte</small></span></div><div><b>♙</b><span><strong>Comunidad La Comarca</strong><small>Eventos, torneos y más</small></span></div></section>
    <section className="wrap feedSection"><div className="sectionTitle"><h2>Últimas publicaciones</h2><a href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">Ver Facebook →</a></div><FacebookFeed/></section>
  </main>
  <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
</div>}
