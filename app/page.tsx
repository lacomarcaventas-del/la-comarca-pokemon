import Link from "next/link";
import FacebookFeed from "../components/FacebookFeed";
import BrandLogo from "../components/BrandLogo";

const lines=[
  ["Pokémon","pokemon"],["Magic: The Gathering","magic"],["Yu-Gi-Oh!","yugioh"],["One Piece Card Game","onepiece"],
  ["Disney Lorcana","lorcana"],["Weiss Schwarz","weiss"],["Gundam Card Game","gundam"],["Dungeons & Dragons","dnd"]
];

export default function Home(){return <div className="siteShell">
  <header className="top siteTop"><Link href="/" className="logoLink"><BrandLogo/></Link><nav className="mainNav navPills"><Link href="/catalogo">Catálogo</Link><a href="#lineas">Categorías</a><a href="#comunidad">Comunidad</a></nav><div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div></header>
  <main>
    <section id="lineas" className="wrap sectionBlock"><div className="sectionTitle"><h2>Explora nuestras líneas</h2><span>La Comarca · TCG & Hobby</span></div><div className="lineGrid">{lines.map(([name,key])=><Link href="/catalogo" className={`lineCard ${key}`} key={key}><div className="lineMark">{name}</div><strong>Ver productos →</strong></Link>)}</div></section>
    <section id="comunidad" className="wrap benefits"><div><b>◈</b><span><strong>Envíos a todo México</strong><small>Envíos seguros y rápidos</small></span></div><div><b>◇</b><span><strong>Tienda 100% segura</strong><small>Protección en tus compras</small></span></div><div><b>♧</b><span><strong>Atención personalizada</strong><small>Estamos para ayudarte</small></span></div><div><b>♙</b><span><strong>Comunidad La Comarca</strong><small>Eventos, torneos y más</small></span></div></section>
    <section className="wrap feedSection"><div className="sectionTitle"><h2>Últimas publicaciones</h2><a href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">Ver Facebook →</a></div><FacebookFeed/></section>
  </main>
  <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
  <style jsx>{`.navPills a{padding:9px 16px!important;border:1px solid #5c4327!important;border-bottom-color:#5c4327!important;border-radius:999px;color:#d9d0c4;transition:.18s ease;background:rgba(13,20,29,.72)}.navPills a:hover{color:#fff!important;border-color:#e0a04f!important;background:linear-gradient(135deg,#25170d,#151b24);transform:translateY(-1px);box-shadow:0 6px 18px #0007}.navPills a:first-child{color:#f0b45b;border-color:#8a5b2a!important}`}</style>
</div>}
